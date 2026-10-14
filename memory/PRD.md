# PRD — MAF · Mundos Artificiais em Finanças

## Problema original (resumo)
Criar um site completo e navegável do laboratório de pesquisa "Mundos Artificiais em Finanças (MAF)", do PPGI/UFRJ em colaboração com o CEFET/RJ — Campus Maria da Graça (BSI), com dados reais extraídos dos currículos Lattes anexados (Eber Schmitz, Sildenir Ribeiro, Gilberto Passos, Cristiano Fuschilo, Raphael Jesus) + mestrando Hugo Fraga. Temas: ABMS, Gêmeos Digitais Financeiros, Finanças Comportamentais, Protocolo ODD, Simulação Computacional. Referências: LAMFO, LIFT, LAB, Quantum PUC-IA, IAG PUC-Rio, LAFIM.

## Escolhas do usuário
- Bilíngue PT/EN com seletor no topo
- Dados reais dos currículos (bio, formação, publicações, projetos)
- Seções: Início, Sobre, Pesquisa, Equipe, Publicações, Projetos, Notícias, Parceiros, Contato
- Painel administrativo com login para editar notícias e publicações

## Arquitetura
- Frontend: React 19 + Tailwind + framer-motion + lenis + shadcn/ui + sonner
- Backend: FastAPI + motor (MongoDB async), rotas sob /api, Swagger em /api/docs
- Auth: JWT (access 60min + refresh 7d) em cookies httpOnly, bcrypt, proteção contra brute force (5 tentativas → 15min), admin semeado via .env
- Banco: MongoDB (coleções: users, publications, news, contacts, login_attempts)

## Personas
- Visitante/pesquisador: conhece o lab, equipe, publicações e projetos
- Estudante: interesse em PPGI/OBInvest, usa o contato
- Admin (equipe do lab): gerencia notícias e publicações

## Implementado (2026-07-14)
- Hero cinético com revelação mascarada + simulação ABM em canvas (140 agentes, botão "Choque de Liquidez"/"Restaurar Confiança", gráfico de preço sintético)
- Seções: Sobre, Pesquisa (6 pilares), Equipe (6 membros reais com modal: bio, formação, áreas, Lattes/ORCID/LinkedIn), Publicações (10 reais extraídas dos CVs, busca + filtro por tag + copiar BibTeX), Projetos (5: MAF-Brasil, OBInvest, Gêmeo Digital de Liquidez, HumânITas, Gestão Estratégica de TI), Notícias (destaque + grid), Parceiros (marquee + cards com links), Contato (form → MongoDB)
- i18n PT/EN completo via contexto
- Admin: /admin/login + /admin (stats, CRUD notícias, CRUD publicações, caixa de mensagens de contato)
- Logo SVG original + favicon, tema Obsidian/Esmeralda, fontes Playfair Display / JetBrains Mono / Plus Jakarta Sans

## Verificado
- curl: root, login, /me, publications (10), news (4), contact POST, 401 sem auth
- screenshots: hero (PT/EN), choque de liquidez, equipe + modal, publicações, mobile 375px, login admin → dashboard

## Credenciais
- admin@maf.ufrj.br / MAF-Lab#2026! (ver /app/memory/test_credentials.md)

## Backlog
- P0: nada pendente do escopo aprovado
- P1: páginas individuais de publicação com DOI/PDF; upload de foto dos membros; feed de notícias com imagem de capa
- P2: versão pública da simulação como página interativa dedicada; exportar publicações em BibTeX completo; integração com API Lattes; e-mail de notificação do formulário de contato (Resend)
