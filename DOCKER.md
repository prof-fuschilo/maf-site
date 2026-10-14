# MAF — Implantação com Docker

Guia para publicar o sistema completo (React + FastAPI + MongoDB) em qualquer servidor com Docker.

## Pré-requisitos
- Docker Engine 24+ e Docker Compose v2 (`docker compose version`)
- 1 GB de RAM livre

## Passo a passo

1. Clone o repositório:
   ```bash
   git clone https://github.com/prof-fuschilo/maf-site.git
   cd maf-site
   ```

2. Crie o arquivo de variáveis do backend:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edite `backend/.env` e preencha:
   - `JWT_SECRET` — gere com `openssl rand -hex 32`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credenciais do painel
   - `EMERGENT_EMAIL_KEY` — chave de e-mail da plataforma (ou deixe em branco e o envio de e-mail fica desativado)
   - `NOTIFY_EMAIL` — e-mail que recebe alertas de contato (opcional)

3. (Opcional) Variáveis do compose — crie um `.env` na raiz:
   ```bash
   PORT=80                      # porta pública do site
   SERVER_URL=http://SEU_IP     # ou https://seudominio.com
   DB_NAME=maf_database
   ```

4. Suba tudo:
   ```bash
   docker compose up -d --build
   ```

5. Acesse:
   - Site: `http://SEU_IP` (ou a porta definida)
   - Painel admin: `http://SEU_IP/admin/login`
   - Documentação da API (Swagger): `http://SEU_IP/api/docs`

## Importante: HTTPS e cookies de login
Os cookies de sessão usam `Secure` por padrão (exigem HTTPS). As opções:
- **Com HTTPS (recomendado):** coloque um proxy reverso com TLS na frente (Caddy, Traefik ou Nginx + Certbot) e mantenha `COOKIE_SECURE=true`.
- **Sem HTTPS (testes em HTTP puro):** adicione `COOKIE_SECURE=false` no `backend/.env` e rode `docker compose up -d` novamente. Sem isso o login não persiste no navegador.

## Comandos úteis
```bash
docker compose logs -f backend        # logs da API
docker compose restart backend        # reiniciar após editar backend/.env
docker compose pull && docker compose up -d --build   # atualizar após git pull
docker compose down                   # parar tudo (dados do Mongo continuam no volume)
```

## Backup do banco (MongoDB)
```bash
# backup
docker compose exec mongo mongodump --db maf_database --archive > backup-maf.archive
# restauração
docker compose exec -T mongo mongorestore --db maf_database --archive < backup-maf.archive
```

## Estrutura dos contêineres
| Serviço   | Imagem/Build      | Função                                    |
|-----------|-------------------|-------------------------------------------|
| frontend  | build ./frontend  | Nginx servindo o React + proxy /api       |
| backend   | build ./backend   | FastAPI (uvicorn) na porta interna 8001   |
| mongo     | mongo:7           | Banco de dados (volume `mongo_data`)      |
