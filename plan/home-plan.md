# Plano da feature: Catálogo de produtos na Home

## Objetivo

Substituir o redirecionamento atual da raiz por um catálogo público de produtos, paginado por carregamento progressivo, com acesso futuro aos detalhes.

## Escopo

- Página `/` pública, com cabeçalho compartilhado fornecido pelo plano Sign-in.
- Tabela `products` e migration Supabase independente.
- Leitura paginada por `GET /api/v1/products`, com retorno `200` inclusive quando não houver produtos.
- Criação operacional de produto por `POST /api/v1/products`.
- Apresentação de nome, imagem e descrição breve; nome do produto leva a `/products/{id}`.
- Estado inicial, carregamento progressivo, fim da lista, lista vazia e erros.

## Etapas de implementação

1. Definir o modelo de dados e adicionar uma migration Supabase nova, sem editar a migration de `accounts`. Incluir `id` de texto gerado com `nanoid`, `name`, `description` opcional, `created_at`, `updated_at`, `score` booleano conforme a spec e `external_link`.
2. Definir o campo de imagem e o formato de entrada do endpoint de criação. A spec exige imagem no POST e na listagem, mas não declara uma coluna ou mecanismo de armazenamento; a proposta para aprovação é `image_url text not null`, recebendo uma URL HTTPS e retornando-a na listagem.
3. Criar validação compartilhada para produto e implementar `POST /api/v1/products`, validando `name`, `external_link` e `image_url`, gerando o ID na API e reportando erros de entrada e de Supabase com status explícitos.
4. Implementar `GET /api/v1/products` com paginação por cursor estável (`created_at` e `id`), limite controlado pelo servidor e resposta consistente com itens e próximo cursor. Uma tabela vazia produz `200` com lista vazia.
5. Construir a Home responsiva com cartões/lista de produto, carregamento incremental por scroll, acessibilidade de teclado e estados de carregamento, falha e lista vazia. Evitar duplicar o cabeçalho: importar o componente do plano Sign-in.
6. Transformar o nome do produto em link para `/products/{id}`. A tela de detalhes será entregue pelo plano Feedback; este plano não cria uma tela substituta.
7. Documentar migration, formato dos endpoints e procedimento de cadastro manual de produtos.

## Contrato para execução paralela

- Este plano é o responsável exclusivo por `app/page.tsx`, `app/api/v1/products/route.ts`, validação/modelos próprios de produto e migration da tabela `products`.
- O endpoint POST e o GET usam `/api/v1/products`, preservando o prefixo de API usado pelo projeto e a rota GET explicitada na spec.
- A página inicial importa o cabeçalho compartilhado pelo plano Sign-in; não criar outra versão nem editar o módulo de sessão.
- Os links apontam para `/products/{id}`. O plano Feedback é responsável por essa rota e pelo detalhe do produto.
- A migration de produtos deve poder ser aplicada independentemente da migration de avaliações. O plano Feedback pode referenciar `products(id)` e será integrado após ambas as migrations existirem.

## Fora do escopo

- Detalhes do produto, avaliações, autenticação obrigatória para navegação ou painel administrativo.
- Criar uma interface de administração de produtos.
- Upload binário, transformação ou hospedagem de imagens.

## Critérios de aceite

- `/` lista produtos publicamente, incluindo nome, imagem e descrição, e não redireciona para cadastro.
- `GET /api/v1/products` retorna `200` e itens com cursor de continuação; uma consulta sem produtos retorna `200` com array vazio.
- A paginação incremental busca a página seguinte sem duplicar produtos nem depender de uma chamada ilimitada.
- `POST /api/v1/products` aceita dados válidos, gera `id` com `nanoid`, persiste no Supabase e valida campos obrigatórios.
- O nome do produto navega para `/products/{id}`.
- Estados de carregamento, erro e lista vazia são compreensíveis e acessíveis.
- Lint, typecheck e build passam; testes cobrem validação, paginação, lista vazia e criação.

## Decisões incluídas para aprovação

- A imagem será representada por `image_url` (URL HTTPS), em vez de upload. Este é um campo adicional necessário para cumprir o requisito visual, mas ausente do esquema descrito.
- O GET retorna envelope `{ items, nextCursor }`, em vez de array simples, para suportar paginação real; sem resultados, `items` é `[]` e `nextCursor` é `null`.
- `score` permanece booleano, exatamente como especificado. Seu significado e uso não estão definidos e, portanto, não será interpretado como nota média nem exibido no catálogo.
- O POST será público, conforme o pedido de inserção manual sem requisito de autenticação. Isso permite escrita pública; caso não seja desejado, é necessário definir um mecanismo de proteção antes da implementação.

