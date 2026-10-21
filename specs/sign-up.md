# Sign-up (Criacao de conta)

## Escopo

Front-End, Back-End, Banco de dados

## Contexto

Precisamos implementar o fluxo para criacao de contas na plataforma, as pessoas precisarao fornecer:

- Primeiro nome
- Sobrenome
- Email
- Senha
- Confirmacao de senha

## Requisitos funcionais

1. Precisamos adicionar validacao no formulario na camada de cliente
   1. Caso o formulario esteja valido podemos enviar a requisicao para a API
2. Os campos de nome e sobrenome devem ser separados.
3. Precisamos criar uma nova conta do Banco de dados
   1. `id`: nanoid (geracao com `nanoid` na camada de API)
   2. `first_name`: text
   3. `last_name`: text
   4. `created_at`: timestamp
   5. `updated_at`: timestamp
   6. `active`: boolean
   7. `email`: text
   8. `password`: text (hash da senha gerado com `bcryptjs`; o salt fica incorporado no hash)
4. A requisicao deve ser um `POST` para `/api/v1/sign-up` e receber os dados como JSON no `body`
5. Caso tudo de certo retornar `201` ou erros de acordo com a validacao:
   1. `400`: Ma formatacao de dados

## Requisitos nao funcionais

- Seguranca: Precisamos salvar as senhas de forma segura no banco de dados
  - Precisamos receber os dados do cliente de forma segura usando HTTPS (para previnir network sniff)
- UI/UX: Boa experiencia de uso atraves de uma interface bonita, elegante e moderna
- Performance: O processo de criacao de conta precisa ser rapido

## Voce deve

- Criar a base do projeto com um endpoint inicial para criacao de conta
- Cria a base do projeto com uma pagina inicial para a interface de criacao de conta
- Configurar as bibliotecas base

## Voce nao deve

- Implementar qualquer outra funcionalidade que nao esteja relacionada com sign-up (criacao de contas)
- Nao vamos realizar nenhum envio de e-mail no momento, apenas processar a requisicao, salvar no banco de dados e tornar um sucesso

## Tecnologias (Stack)

React.js, Next.js, React-Hook-Form, Shadcn, Tailwind, Supabase, TRPC, Bunjs, bcryptjs

## Criterios de aceitacao

- Temos uma pagina para criar uma nova conta em `/auth/sign-up`
- A pagina contem um formulario com validacao
- A plataforma consegue se comunicar com a API para enviar os dados e receber uma resposta
- Estamos informando possiveis erros
  - Mostrar um alert em vermelho no formulario
- Estamos informando o sucesso de criacao da conta:
  - Navegar para `/auth/sign-up/success`

## Resultado

Pessoas conseguem criar uma nova conta na plataforma
