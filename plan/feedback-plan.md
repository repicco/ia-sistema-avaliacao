# Plano da feature: Avaliações de produtos

## Objetivo

Permitir que visitantes consultem os detalhes e avaliações de um produto, e que somente pessoas autenticadas publiquem uma nota de 1 a 5 acompanhada de comentário.

## Escopo

- Página pública `/products/[id]` com informações do produto e avaliações existentes.
- Persistência de avaliações na tabela `products_feedbacks` via migration independente.
- Endpoints para ler avaliações do produto e criar avaliação.
- Formulário visível somente para a pessoa autenticada; visitantes recebem orientação e link para `/auth/sign-in`.
- Uso do módulo de sessão e cabeçalho compartilhado pelo plano Sign-in.

## Etapas de implementação

1. Adicionar migration nova para `products_feedbacks`, com `id` texto gerado na API com `nanoid`, `score` inteiro limitado a 1–5, `comment`, `created_at`, `created_by` e `product_id`. Criar chaves estrangeiras para `accounts(id)` e `products(id)` e índices úteis para a consulta cronológica por produto; não alterar migrations existentes.
2. Criar validação de entrada no servidor: nota inteira de 1 a 5, comentário não vazio com limite razoável, produto existente e pessoa autenticada obtida da sessão. O cliente nunca define `created_by`.
3. Implementar endpoint de leitura das avaliações do produto, incluindo nota, comentário, data e nome da pessoa autora sem retornar dados sensíveis. Definir `404` para produto inexistente e `200` com array vazio quando não houver avaliações.
4. Implementar endpoint de criação de avaliação. Visitante recebe `401`; corpo inválido recebe `400`; produto inexistente recebe `404`; sucesso persiste `created_by` da sessão e retorna `201`. Erros de infraestrutura são reportados explicitamente.
5. Criar `/products/[id]`, buscar e exibir dados do produto e avaliações em ordem cronológica decrescente, com estados de carregamento, produto inexistente, lista vazia e falha.
6. Renderizar o formulário apenas com sessão válida; visitantes veem instrução direta e link para `/auth/sign-in`. Após envio, atualizar a lista com a avaliação criada sem apagar feedback de erro.
7. Reutilizar cabeçalho e consulta de sessão do plano Sign-in, e os contratos de produto/migration/endpoints definidos pelo plano Home.

## Contrato para execução paralela

- Este plano é o responsável exclusivo por `app/products/[id]/page.tsx`, rotas de API de avaliações, componentes/validação de avaliações e migration `products_feedbacks`.
- Depende do export `getCurrentAccount()` de `lib/auth/session.ts` do plano Sign-in, com o retorno `{ id, firstName, lastName, email } | null`. A feature não implementará uma segunda estratégia de sessão.
- Depende da tabela `products` e do campo `image_url` definidos no plano Home. A migration deve declarar sua referência à tabela de produtos sem alterar a migration ou implementação de propriedade do plano Home.
- O identificador de rota `/products/{id}` é o mesmo utilizado nos links da Home.
- A interface de detalhes pode importar o cabeçalho compartilhado pelo plano Sign-in; não criar nem modificar o componente compartilhado.

## Fora do escopo

- Alterar cadastro/login, redefinir senha, aprovar ou moderar avaliações.
- Avaliação sem autenticação, edição/exclusão de avaliação, resposta do autor do produto ou cálculo de nota média.
- Implementar busca, filtro ou paginação de comentários, salvo necessidade de performance constatada durante a implementação.

## Critérios de aceite

- `/products/{id}` mostra nome, imagem, descrição e avaliações do produto.
- Um produto sem avaliações exibe estado vazio útil; um ID inexistente apresenta não encontrado.
- Visitantes veem as avaliações e um bloco que explica que precisam entrar para avaliar, com link para `/auth/sign-in`; não veem o formulário de criação.
- Pessoas autenticadas podem enviar nota inteira de 1 a 5 e comentário; erros de validação são acessíveis e explícitos.
- A API rejeita gravação sem sessão com `401`, entrada inválida com `400` e produto inexistente com `404`; sucesso cria avaliação com `created_by` derivado da sessão e retorna `201`.
- A identidade da pessoa autora pode ser exibida sem expor e-mail, senha ou hash nas respostas públicas.
- Lint, typecheck e build passam; testes cobrem leitura, casos sem/ com avaliações, autorização e validação da criação.

## Decisões incluídas para aprovação

- Adicionar um endpoint GET de avaliações por produto, embora a spec mencione explicitamente apenas o endpoint de criação: a página de detalhes precisa de uma fonte de dados para listar avaliações.
- Não impor unicidade de avaliação por pessoa/produto nem permitir edição, pois essas regras não aparecem na spec.
- O link de autenticação leva a `/auth/sign-in` e, após login, o comportamento de retorno à página de origem não é requerido; o plano Sign-in direciona ao `/`.
- A associação `products_feedbacks.product_id -> products.id` exige que a migration de produtos seja aplicada antes da migration de avaliações.

