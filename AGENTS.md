# Avalia — guia para agentes

## Stack real

Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Zod, React Hook Form, TanStack Query, Supabase (PostgreSQL) via `service_role` no servidor, bcryptjs, Mastra (`openai/gpt-4o-mini`).

APIs são Route Handlers REST em `app/api/v1`. Não use tRPC. date-fns não faz parte do projeto; use `Intl`. N8N está no README como automação opcional, sem integração no código.

## Onde mora o quê

- Specs: `specs/`
- Planos: `plan/`
- Skills: `.agents/skills/`
- Padrões de código: `CODING_STANDARDS.md`

## Execução de planos

Neste repositório o modo padrão é Native: o agente da sessão implementa o plano (`executing-plans`). Use `subagent-driven-development` só se a pessoa pedir.

## Checagem

`bun run lint`, `bun run typecheck`, `bun test` e `bun run build` precisam passar antes de declarar a tarefa completa.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
