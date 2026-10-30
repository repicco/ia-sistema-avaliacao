# Arquitetura do projeto

## Front-end

- TypeScript
- Next.js (App Router) e React
- Biome (lint e formatação)
- Tailwind CSS 4, com tokens em `app/globals.css`
- React Hook Form + Zod
- TanStack Query (listagens, mutações e cache)

Shadcn está referenciado em `components.json` como base futura. Ainda não há `components/ui`.

## Back-end

- TypeScript
- Next.js Route Handlers em `/api/v1`
- bcryptjs para hash de senha
- Mastra.ai para o resumo de avaliações
- Cookie HMAC próprio (`avalia_session`); não usamos tRPC nem NextAuth

## Banco de dados

Supabase: PostgreSQL. A aplicação acessa o banco com a chave `service_role` no servidor. RLS está ligado: leitura pública de produtos e avaliações para `anon`/`authenticated`; contas e escritas continuam bloqueadas para essas roles.

## Infraestrutura

Vercel: hospeda o servidor (API) e o cliente.

## Automação

N8N permanece como opção de fluxo externo. Nenhum workflow da aplicação depende dele hoje.
