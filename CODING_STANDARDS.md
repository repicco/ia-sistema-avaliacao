# Padrões de código

- UI e mensagens de API em português do Brasil.
- Validar entrada com Zod no cliente e de novo na rota.
- Não expor `SUPABASE_SERVICE_ROLE_KEY` nem `AUTH_SESSION_SECRET` com prefixo `NEXT_PUBLIC_`.
- Cliente Supabase só em módulos `server-only`. Leituras e escritas passam pelas rotas `/api/v1`.
- Cookie de sessão `HttpOnly`, `SameSite=Lax`, `Secure` em produção.
- Falhas de login usam a mensagem genérica “E-mail ou senha inválidos.”
- GET não gera efeito colateral caro (LLM, escrita). Resumo de IA atualiza no POST da avaliação.
- Criação de produto e de avaliação exige sessão.
- Uma avaliação por conta e produto.
- Componentes de dados usam TanStack Query. Formulários usam React Hook Form.
- Cores e tipos vêm dos tokens em `app/globals.css` (`ink`, `paper`, `accent`, `mark`, `danger`).
- Testes de schema, cursor e redirect ficam ao lado do módulo, em `*.test.ts`, e rodam com `bun test`.
