# Test Credentials
# Agent writes here when creating/modifying auth credentials (admin accounts, test users).
# Testing agent reads this before auth tests. Fork/continuation agents read on startup.

## MAF Admin (painel /admin)
- Email: admin@maf.ufrj.br
- Senha: MAF-Lab#2026!
- Papel: admin
- Login: POST /api/auth/login (cookies httpOnly access_token + refresh_token)
- Rotas do painel: /admin/login (login) e /admin (dashboard: notícias, publicações, mensagens)

## Endpoints de auth
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me
- POST /api/auth/refresh

## Endpoints públicos
- GET  /api/publications
- GET  /api/news
- POST /api/contact

## Google Sign-In (Emergent-managed)
- Botão "Entrar com Google" na tela /admin/login
- Allowlist: SOMENTE o e-mail configurado em ADMIN_EMAIL (admin@maf.ufrj.br) é aceito no painel; qualquer outra conta Google recebe 403
- A sessão Google usa os mesmos cookies JWT (access_token/refresh_token) do login por senha
- Não há senha gerenciada pelo app para contas Google
