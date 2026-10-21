# Avalia

Aplicacao inicial para cadastro de contas, com Next.js, React, TypeScript, React Hook Form, TanStack Query, Tailwind CSS, Supabase e bcryptjs.

## Desenvolvimento

Requer Bun e um projeto Supabase.

1. Instale as dependencias com `bun install` (ou use Node.js 22.13 ou superior).
2. Copie `.env.example` para `.env.local` e preencha `SUPABASE_URL`, a chave `service_role` do Supabase, `AUTH_SESSION_SECRET` com um valor aleatório de pelo menos 32 bytes e `OPENAI_API_KEY`.
3. Execute as migrations no SQL Editor do Supabase nesta ordem:
   1. `supabase/migrations/20261018000000_create_accounts.sql`
   2. `supabase/migrations/20261019000000_create_products.sql`
   3. `supabase/migrations/20261019010000_create_products_feedbacks.sql`
   4. `supabase/migrations/20261020000000_add_product_price.sql`
   5. `supabase/migrations/20261021000000_add_product_ai_summary.sql`
4. Inicie o servidor com `bun run dev` e abra [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up).

A chave `SUPABASE_SERVICE_ROLE_KEY` tem acesso administrativo ao banco: mantenha-a somente no ambiente do servidor, nunca a exponha como variavel `NEXT_PUBLIC_*`.
`AUTH_SESSION_SECRET` também é exclusivamente do servidor e assina os cookies de sessão; não compartilhe nem inclua esse valor em código ou variáveis `NEXT_PUBLIC_*`.

## Fluxo de cadastro

- A pagina `/auth/sign-up` valida primeiro nome, sobrenome, e-mail, senha e confirmacao antes do envio.
- A API `POST /api/v1/sign-up` valida novamente os dados, gera o identificador com nanoid, calcula o hash bcrypt e grava a conta no Supabase.
- O e-mail e unico sem diferenciar maiusculas de minusculas. Duplicatas retornam `409`; JSON ou campos invalidos retornam `400`.
- O sucesso retorna `201` e direciona para `/auth/sign-up/success`.
- O salt e armazenado dentro da string de hash bcrypt; nao existe coluna separada para o salt.

O cadastro cria a conta com `active = true`; nao ha envio de e-mail ou fluxo de confirmacao nesta etapa.

## Catalogo de produtos

- A pagina inicial `/` lista produtos publicamente e carrega mais itens conforme a pessoa percorre o catalogo.
- `GET /api/v1/products` retorna `{ "items": [...], "nextCursor": "..." }`. A consulta aceita `cursor` e `limit`; o limite padrao e 12 e o maximo e 24. Sem produtos, retorna `200` com `items: []` e `nextCursor: null`.
- `POST /api/v1/products` cria um produto sem exigir autenticação ou sessão e retorna `201` com `{ "item": ... }`. Envie `{ "name": "Produto", "image": "https://exemplo.com/imagem.jpg", "price": 129.90 }`; `image` deve ser uma URL HTTPS e `price` um número não negativo com até duas casas decimais. O `id` e gerado pela API.
- A criação pública irrestrita pode permitir cadastros abusivos; aplique limitação de requisições ou outra proteção na infraestrutura se isso for necessário.
- A coluna `score` e booleana e inicia em `false`; nao representa a media das avaliacoes.

## Acesso e sessoes

- A pagina `/auth/sign-in` envia e-mail e senha como JSON para `POST /api/v1/sign-in`.
- A API retorna `400` para dados invalidos, `401` para credenciais invalidas e `200` no sucesso. O cookie assinado `avalia_session` e `HttpOnly`, tem validade de sete dias e e `Secure` em producao.
- O cabecalho da plataforma mostra o link de acesso para visitantes e a identidade da conta autenticada. A sessao do servidor e consultada por `getCurrentAccount()` em `lib/auth/session.ts`.

## Avaliacoes

- A pagina publica `/products/{id}` mostra os dados do produto e as avaliacoes existentes.
- `GET /api/v1/products/{id}/feedbacks` retorna as avaliacoes e o nome publico de cada autor; produto inexistente retorna `404`.
- `POST /api/v1/products/{id}/feedbacks` exige sessao e recebe `{ "score": 1, "comment": "..." }`, com nota inteira de 1 a 5 e comentario de ate 2.000 caracteres. A API define `created_by` a partir da sessao; visitante recebe `401` e sucesso retorna `201`.
- A página do produto exibe um resumo das avaliações gerado pelo agente Mastra com `openai/gpt-4o-mini`. O resumo é salvo no produto, atualizado após cada nova avaliação e gerado na primeira consulta para produtos que já tenham avaliações. Configure `OPENAI_API_KEY`; se a geração falhar, a avaliação continua salva e a página informa que o resumo não foi atualizado.
- A migration `20261019010000_create_products_feedbacks.sql` depende da tabela `products` criada pela migration `20261019000000_create_products.sql`.

## Fluxo de acesso

- A página `/auth/sign-in` valida e-mail e senha antes de enviar JSON para `POST /api/v1/sign-in`.
- As credenciais são verificadas contra contas ativas. Falhas de autenticação sempre retornam a mensagem genérica “E-mail ou senha inválidos.”
- O sucesso retorna `200` e define o cookie `avalia_session`: assinado com HMAC, `HttpOnly`, `SameSite=Lax`, restrito ao caminho `/` e `Secure` em produção. A sessão expira após sete dias.
- O módulo de servidor `lib/auth/session.ts` exporta `getCurrentAccount()`, que valida o cookie e retorna `{ id, firstName, lastName, email }` da conta ativa ou `null`.

## N8N

docker volume create n8n_data

docker run -d \
 --name n8n \
 --restart unless-stopped \
 -p 5678:5678 \
 --add-host=host.docker.internal:host-gateway \
 -e GENERIC_TIMEZONE=America/Sao_Paulo \
 -e TZ=America/Sao_Paulo \
 -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
 -v n8n_data:/home/node/.n8n \
 n8nio/n8n
