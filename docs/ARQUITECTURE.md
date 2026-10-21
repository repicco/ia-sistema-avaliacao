# Arquitetura do projeto

## Front-end

Vamos utilizar as seguintes bibliotecas principais:

- TypeScript : Linguagem principalmente de desenvolvimento com tipagem
- Next.js: Framework para criacao e gestao de interfaces + APIs
- React.js: Biblioteca para criacao e componentizacao de interfaces
- Biome: Validacao/formatacao/correcao de código (lint)
- TailwindCss: Estilizacao
- Date-Fns: Manipulacao de data/hora
- Shadcn: Componetizacao base (design system)
- React Query: Criacao e gestao de queries para ler dados da API e mutations para alterar os dados

## Back-end

- TypeScript : Linguagem principalmente de desenvolvimento com tipagem
- Next.js: Framework para criacao de APIs
- bcryptjs: Implementacao em JavaScript do bcrypt para hash de senhas com salt incorporado ao hash
- Mastra.ai: Criacao e customizacao de agentes internos
- TRPC: Gestao de endpoints

## Banco de dados

Supabase: PostgreSQL

## Infraestrutura

Vercel: Hospedar tanto o servidor (API) quando cliente (SPA)

## Automacao

N8N: Cricao de fluxos automatizados
