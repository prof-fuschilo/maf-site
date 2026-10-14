from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="MAF API", docs_url="/api/docs", openapi_url="/api/openapi.json")
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(minutes=60)}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh",
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True,
                        samesite="none", max_age=3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------- Models ----------

class LoginInput(BaseModel):
    email: str
    password: str


class PublicationIn(BaseModel):
    title: str
    authors: str
    venue: str
    year: int
    tags: List[str] = []
    url: Optional[str] = None
    kind: str = "article"


class Publication(PublicationIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class NewsIn(BaseModel):
    title_pt: str
    title_en: str
    summary_pt: str
    summary_en: str
    date: str
    tag: str = "LAB"
    featured: bool = False


class News(NewsIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class ContactIn(BaseModel):
    name: str
    email: str
    subject: str
    category: str = "pesquisa"
    message: str


# ---------- Auth ----------

async def check_lockout(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("count", 0) >= 5:
        locked_until = rec.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")


async def record_failure(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    count = (rec.get("count", 0) + 1) if rec else 1
    doc = {"identifier": identifier, "count": count,
           "last_attempt": datetime.now(timezone.utc).isoformat()}
    if count >= 5:
        doc["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
    await db.login_attempts.update_one({"identifier": identifier}, {"$set": doc}, upsert=True)


@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request, response: Response):
    email = input.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    await check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await record_failure(identifier)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    await db.login_attempts.delete_many({"identifier": identifier})
    set_auth_cookies(response, create_access_token(user["id"], email), create_refresh_token(user["id"]))
    return {"id": user["id"], "email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    response.set_cookie("access_token", create_access_token(user["id"], user["email"]),
                        httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    return user


# ---------- Publications ----------

@api_router.get("/publications", response_model=List[Publication])
async def list_publications():
    pubs = await db.publications.find({}, {"_id": 0}).sort("year", -1).to_list(500)
    return pubs


@api_router.post("/publications", response_model=Publication)
async def create_publication(input: PublicationIn, user: dict = Depends(get_current_user)):
    pub = Publication(**input.model_dump())
    await db.publications.insert_one(pub.model_dump())
    return pub


@api_router.put("/publications/{pub_id}", response_model=Publication)
async def update_publication(pub_id: str, input: PublicationIn, user: dict = Depends(get_current_user)):
    res = await db.publications.update_one({"id": pub_id}, {"$set": input.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Publication not found")
    doc = await db.publications.find_one({"id": pub_id}, {"_id": 0})
    return Publication(**doc)


@api_router.delete("/publications/{pub_id}")
async def delete_publication(pub_id: str, user: dict = Depends(get_current_user)):
    res = await db.publications.delete_one({"id": pub_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Publication not found")
    return {"ok": True}


# ---------- News ----------

@api_router.get("/news", response_model=List[News])
async def list_news():
    return await db.news.find({}, {"_id": 0}).sort("date", -1).to_list(200)


@api_router.post("/news", response_model=News)
async def create_news(input: NewsIn, user: dict = Depends(get_current_user)):
    item = News(**input.model_dump())
    await db.news.insert_one(item.model_dump())
    return item


@api_router.put("/news/{news_id}", response_model=News)
async def update_news(news_id: str, input: NewsIn, user: dict = Depends(get_current_user)):
    res = await db.news.update_one({"id": news_id}, {"$set": input.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="News not found")
    doc = await db.news.find_one({"id": news_id}, {"_id": 0})
    return News(**doc)


@api_router.delete("/news/{news_id}")
async def delete_news(news_id: str, user: dict = Depends(get_current_user)):
    res = await db.news.delete_one({"id": news_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News not found")
    return {"ok": True}


# ---------- Contact ----------

@api_router.post("/contact")
async def send_contact(input: ContactIn):
    doc = input.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/contact")
async def list_contacts(user: dict = Depends(get_current_user)):
    return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api_router.get("/admin/stats")
async def admin_stats(user: dict = Depends(get_current_user)):
    return {
        "publications": await db.publications.count_documents({}),
        "news": await db.news.count_documents({}),
        "messages": await db.contacts.count_documents({}),
    }


@api_router.get("/")
async def root():
    return {"message": "MAF API — Mundos Artificiais em Finanças"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Seeds ----------

async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": email, "name": "Administrador MAF",
            "role": "admin", "password_hash": hash_password(password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})


SEED_PUBLICATIONS = [
    {"title": "Um Estudo Utilizando Fatos Estilizados na Comparação entre FIIs e REITs",
     "authors": "PASSOS, G. G. F. G.; RIBEIRO, S. A.; SCHMITZ, E. A.",
     "venue": "Anais do XXV Encontro Brasileiro de Finanças", "year": 2025,
     "tags": ["ABMS", "Mercados Artificiais"], "kind": "conference"},
    {"title": "Simulação Baseada em Agentes e Indicadores em ILPIs: Um Estudo para o Desenvolvimento do GeronTrack",
     "authors": "SANTOS, R. O.; FERREIRA, E.; FUSCHILO, C.",
     "venue": "Anais do XIX WESAAC — Workshop-Escola de Sistemas de Agentes, seus Ambientes e Aplicações", "year": 2025,
     "tags": ["ABMS", "Simulação"], "kind": "conference"},
    {"title": "Modeling the COVID-19 vaccination process using the FRAM Method",
     "authors": "AMARAL NETO, A. S.; NASCIMENTO, N. M.; LOUREIRO, A. B.; SILVA, M. F.; ARAÚJO, C.; RUBIO, M. P. A.; RIBEIRO, S. A.",
     "venue": "Ciência & Saúde Coletiva, v. 30", "year": 2025,
     "tags": ["Simulação", "Modelagem"], "kind": "article"},
    {"title": "Relatos sobre a criação da primeira olimpíada com foco em investimentos no Brasil",
     "authors": "PASSOS, G. G. F. G.",
     "venue": "Revista de Extensão", "year": 2023,
     "tags": ["Educação Financeira", "OBInvest"], "kind": "article"},
    {"title": "Risk Factors in the Software Deployment Phase: A Case Study Applied in two Brazilian Government Companies",
     "authors": "DOS SANTOS, L. J.; RIBEIRO, S. A.; SCHMITZ, E. A.; SILVA, M. F.; DE ALENCAR, A. J. S. M.",
     "venue": "Revista de Gestão da Tecnologia e Sistemas de Informação (JISTEM), v. 19", "year": 2022,
     "tags": ["Engenharia de Software", "Risco"], "kind": "article"},
    {"title": "Facilitators and barriers that influence Nursing Professionals in the Adoption of Information Systems: a systematic review",
     "authors": "AMARAL NETO, A. S.; ALVES, R. M. B.; SILVA, M. F.; SCHMITZ, E. A.; JUAREZ ALENCAR, A.",
     "venue": "iSys — Revista Brasileira de Sistemas de Informação, v. 15", "year": 2022,
     "tags": ["Sistemas de Informação"], "kind": "article"},
    {"title": "A Dynamic Job Shop Model for Scheduling Tasks in a Software Development Environment",
     "authors": "RIBEIRO, S. A.; SCHMITZ, E. A.; SILVA, M. F.; ALENCAR, A. J.",
     "venue": "Revista de Gestão da Tecnologia e Sistemas de Informação, v. 18", "year": 2021,
     "tags": ["Otimização", "Simulação"], "kind": "article"},
    {"title": "Uma Proposta para Seleção de Portfólios Eficientes Utilizando Análise Envoltória de Dados (DEA)",
     "authors": "FUSCHILO, C.; SCHMITZ, E. A.; FEIJÓ, M.",
     "venue": "18th CONTECSI — International Conference on Information Systems and Technology Management", "year": 2021,
     "tags": ["Finanças Quantitativas", "DEA"], "kind": "conference"},
    {"title": "Educação Financeira e Finanças: contribuições educacionais da OBInvest",
     "authors": "PASSOS, G. G. F. G.; SANTOS, W. D.; SILVA, L. Y. C.; RIBEIRO, S.; et al.",
     "venue": "Editora Akademy, 1. ed. São Paulo", "year": 2026,
     "tags": ["Educação Financeira", "OBInvest"], "kind": "book"},
    {"title": "Literature Review on the Theory of Constraints Applied in the Software Development Process",
     "authors": "RIBEIRO, S.; SCHMITZ, E.; ALENCAR, A.; SILVA, M.",
     "venue": "IEEE Latin America Transactions, v. 16, p. 2747–2756", "year": 2018,
     "tags": ["Engenharia de Software", "Otimização"], "kind": "article"},
]

SEED_NEWS = [
    {"title_pt": "MAF apresenta estudo de fatos estilizados FIIs × REITs no XXV Encontro Brasileiro de Finanças",
     "title_en": "MAF presents stylized-facts study of FIIs vs REITs at the XXV Brazilian Finance Meeting",
     "summary_pt": "O trabalho dos pesquisadores Gilberto Passos, Sildenir Ribeiro e Eber Schmitz aplica estatísticas de mercados artificiais para comparar fundos imobiliários brasileiros e REITs americanos.",
     "summary_en": "Research by Gilberto Passos, Sildenir Ribeiro and Eber Schmitz applies artificial-market statistics to compare Brazilian real estate funds with US REITs.",
     "date": "2025-07-14", "tag": "PUBLICAÇÃO", "featured": True},
    {"title_pt": "Simulação baseada em agentes do GeronTrack é publicada no WESAAC 2025",
     "title_en": "GeronTrack agent-based simulation published at WESAAC 2025",
     "summary_pt": "Estudo do Prof. Cristiano Fuschilo utiliza ABMS para monitoramento de indicadores em Instituições de Longa Permanência para Idosos.",
     "summary_en": "Study by Prof. Cristiano Fuschilo uses ABMS to monitor indicators in long-term care institutions for the elderly.",
     "date": "2025-05-30", "tag": "PUBLICAÇÃO", "featured": False},
    {"title_pt": "OBInvest abre inscrições com trilha de mercado artificial",
     "title_en": "OBInvest opens registrations with an artificial-market track",
     "summary_pt": "A Olimpíada Brasileira de Investimentos, fundada pelo Prof. Gilberto Passos com apoio do CNPq, usará o simulador de mercado artificial do laboratório como ferramenta pedagógica.",
     "summary_en": "The Brazilian Investment Olympiad, founded by Prof. Gilberto Passos with CNPq support, will use the lab's artificial market simulator as a teaching tool.",
     "date": "2026-03-02", "tag": "OBINVEST", "featured": False},
    {"title_pt": "Laboratório inaugura micromercado artificial para estudo de crashes e liquidez",
     "title_en": "Lab launches artificial micromarket for crash and liquidity research",
     "summary_pt": "Nova infraestrutura de simulação multiagente replica book de ofertas, formação de preços e cascatas de pânico com milhares de agentes cognitivos autônomos.",
     "summary_en": "New multi-agent simulation infrastructure replicates order books, price formation and panic cascades with thousands of autonomous cognitive agents.",
     "date": "2026-06-20", "tag": "LAB", "featured": False},
]


async def seed_content():
    if await db.publications.count_documents({}) == 0:
        await db.publications.insert_many([Publication(**p).model_dump() for p in SEED_PUBLICATIONS])
    if await db.news.count_documents({}) == 0:
        await db.news.insert_many([News(**n).model_dump() for n in SEED_NEWS])


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_admin()
    await seed_content()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
