# Plano da feature: Acesso à plataforma

## Objetivo

Permitir que uma pessoa entre com e-mail e senha, receba uma sessão protegida por cookie e veja sua identidade no cabeçalho da plataforma. Em caso de sucesso, direcioná-la para `/`.

## Escopo

- Página de acesso em `/auth/sign-in`.
- Validação no cliente e no endpoint `POST /api/v1/sign-in`.
- Verificação de senha com bcrypt contra a tabela existente `accounts`, sem revelar se e-mail ou senha estão incorretos.
- Cookie de sessão HTTP-only e leitura da conta autenticada no servidor.
- Componente de cabeçalho compartilhado: link de acesso para visitantes; avatar e nome, sobrenome e e-mail para pessoas autenticadas.
- Estrutura visual compartilhada da plataforma para Home e página de detalhes.

## Etapas de implementação

1. Definir e implementar um módulo de sessão de servidor, com cookie assinado, prazo de validade e atributos `httpOnly`, `sameSite`, `path` e `secure` em produção. Obter a chave de assinatura de uma variável de ambiente exclusiva do servidor e documentar sua configuração sem expor segredos.
2. Criar o endpoint de sign-in: validar JSON e campos; consultar a conta ativa pelo e-mail sem diferenciar maiúsculas e minúsculas; comparar a senha com bcrypt; retornar `400` para dados inválidos, `401` para credenciais inválidas, `200` para autenticação e `500` explícito para falhas de configuração ou infraestrutura. Não incluir detalhes que confirmem a existência de uma conta.
3. Criar a página `/auth/sign-in` com a identidade visual Avalia, formulário acessível, feedback de erro em alerta vermelho e ligação ao endpoint. Em sucesso, navegar para `/`.
4. Criar um cabeçalho reutilizável que consulte a sessão no servidor e apresente a opção de acesso ou a identidade da pessoa autenticada. Exportar o contrato de consulta da sessão para reutilização pela feature de feedback.
5. Entregar o cabeçalho e o contrato sem substituir `app/page.tsx`: a Home é propriedade da feature Home. A página de detalhes pode importar o mesmo cabeçalho.
6. Documentar variáveis de ambiente, comportamento de sessão e instruções para testar o fluxo.

## Contrato para execução paralela

- Este plano é o responsável exclusivo por `lib/auth/session.ts`, `app/api/v1/sign-in/route.ts`, `app/auth/sign-in/page.tsx`, componentes de sign-in/cabeçalho e documentação de configuração de sessão.
- O módulo `lib/auth/session.ts` deve expor `getCurrentAccount()` para uso exclusivamente no servidor, retornando `{ id, firstName, lastName, email }` ou `null`. A feature Feedback consumirá esse contrato; não deve duplicar a validação do cookie.
- A Home e a página de detalhes podem compor o cabeçalho exportado, mas não devem alterá-lo.
- `app/page.tsx` pertence exclusivamente ao plano Home. Não implementar o esqueleto da Home neste plano: o conteúdo listado é fornecido pela feature Home.

## Fora do escopo

- Recuperação ou redefinição de senha, confirmação por e-mail, cadastro ou autorização granular.
- Criar uma segunda tabela de usuários ou substituir o armazenamento bcrypt existente.
- Implementar conteúdo da Home ou avaliações de produtos.

## Critérios de aceite

- A página `/auth/sign-in` apresenta e valida e-mail e senha e envia JSON para `POST /api/v1/sign-in`.
- Dados malformados retornam `400`; credenciais inválidas retornam `401` com mensagem genérica; autenticação bem-sucedida retorna `200` e define cookie de sessão seguro.
- Contas inativas não conseguem autenticar.
- O cookie não é acessível por JavaScript e a sessão expira conforme o prazo documentado.
- O sucesso navega para `/`; o cabeçalho identifica visitantes e pessoas autenticadas com os dados solicitados.
- A sessão pode ser consultada no servidor pela feature Feedback sem expor a chave de assinatura ao cliente.
- Lint, typecheck e build passam; testes cobrem validação, credenciais, cookie e leitura da sessão.

## Decisões incluídas para aprovação

- Usar cookie de sessão assinado com HMAC e chave em variável de ambiente de servidor, contendo apenas o identificador e a expiração; o cabeçalho carrega os dados atuais da conta no servidor.
- O campo `email` será normalizado para minúsculas na busca, em consonância com o índice único case-insensitive existente.
- Não incluir logout, pois ele não consta nos requisitos fornecidos.

