# Auth Testing Playbook — MAF

Admin seeded at startup from env: ADMIN_EMAIL=admin@maf.ufrj.br / ADMIN_PASSWORD=MAF-Lab#2026!

## Step 1: MongoDB
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, unique index on users.email, index on login_attempts.identifier.

## Step 2: API
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -c /tmp/cookies.txt -X POST $API/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@maf.ufrj.br","password":"MAF-Lab#2026!"}'
curl -b /tmp/cookies.txt $API/api/auth/me
```
Login returns the user object and sets access_token + refresh_token cookies; /me returns the same user.

## Step 3: Protected CRUD
```
curl -b /tmp/cookies.txt -X POST $API/api/news -H "Content-Type: application/json" -d '{"title_pt":"T","title_en":"T","summary_pt":"S","summary_en":"S","date":"2026-07-01","tag":"LAB","featured":false}'
```
Unauthenticated POST/PUT/DELETE must return 401.
