# Construção de um back-end moderno com TypeScript, PostgreSQL e Prisma ORM

## Descrição

Esse estudo explora e demonstra diferentes padrões, problemas e arquiteturas
para back-end moderno, resolvendo um problema concreto: **um sistema de
classificação para cursos online**. O estudo está concentrado no papel do banco
de dados em todos os aspectos do desenvolvimento back-end incluíndo:

- [Modelagem de dados](#modelagem-de-dados)
- CRUD
- Agregações
- Camadas da API
- Validação
- Testes
- Autenticação
- Integração com API externas
- Criação de imagens e containers Docker
- Implantação

# Stack deste estudo

- Backend:
  - PostgreSQL
  - Node.js
  - Prisma
  - TypeScript
  - Jest
  - Hapi.js

# Ambiente de desenvolvimento

- Node.js
- Docker (usado para executar um banco de dados PostgreSQL de desenvolvimento).


# Requisitos

## Primeira etapa

### Modelagem

- [x]  Definir o domínio do problema
- [x]  Entender o Prisma Schema
- [x]  Definir os Modelos
- [x]  Definir as Relações
- [x]  Migrando Database

## Segunda Etapa
## Tabela de endpoits da API

| Resource | HTTP Method | Route | Description |
| --- | --- | --- | --- |
| User | POST | /users | Cria um usuário (opcionalmente relacionado a um curso) |
| User | GET | /users/{userId} | Obtém um usuário |
| User | PUT | /users/{userId} | Atualiza um usuário  |
| User | DELETE | /users/{userId} | Deleta um usuário |
| User | GET | /users | Obtém uma lista de usuários u |
| CourseEnrollment | GET | /users/{userId}/courses | Obtém um usuário matriculado em cursos. |
| CourseEnrollment | POST | /users/{userId}/courses | Matricula um usuário a um curso (estudante ou professor) |
| CourseEnrollment | DELETE | /users/{userId}/courses/{courseId} | Deleta um usuário matriculado em um curso  |
| Course | POST | /courses | Cria um curso |
| Course | GET | /courses | Obtém uma lista de cursos |
| Course | GET | /courses/{courseId} | Obtém um curso |
| Course | PUT | /courses/{courseId} | Atualiza um curso |
| Course | DELETE | /courses/{courseId} | Deleta um curso |
| Test | POST | /courses/{courseId}/tests | Cria um teste para um curso. |
| Test | GET | /courses/tests/{testId} | Obtém um teste |
| Test | PUT | /courses/tests/{testId} | Atualiza um teste |
| Test | DELETE | /courses/tests/{testId} | Deleta um teste |
| Test Result | GET | /users/{userId}/test-results | Obtém os resultados dos testes de um usuário  |
| Test Result | POST | /courses/tests/{testId}/test-results | Cria resultados de teste para um teste associado a um usuário.  |
| Test Result | GET | /courses/tests/{testId}/test-results | Obtém múltiplos resultados de teste para um teste |
| Test Result | PUT | /courses/tests/test-results/{testResultId} | Atualiza um resultado de teste (associado a um usuário e a um teste)  |
| Test Result | DELETE | /courses/tests/test-results/{testResultId} | Deleta um resultado de teste |

- [x]  Criar um servidor com Hapi
- [x]  Definir uma rota de status
- [x]  Criar um Plugin e mover a rota de status para ele
- [x]  Registrar o plugin
- [x]  Definir um teste para o endpoint status
    - [x]  Dividir o arquivo `server.ts` em dois
    - [x]  Criar o teste para rota de status com Jest
- [x]  Definir um plugin para o Prisma
- [ ]  Definir um plugin para rotas de usuário com dependência do plugin Prisma
- [ ]  Definir a rota de criação do usuário
- [ ]  Adicionar validação à rota de criação do usuário
- [ ]  Criar o teste para a rota de criação do usuário

<aside>
💡 Definir e testar as rotas de user usando TDD

</aside>

- [ ]  Definir o teste para os endpoints GET `/user` e  `users/{userId}`
- [ ]  Definir as rotas GET e GET_BY_ID `/user` e `/userId`
- [ ]  Definir testes para o endpoint DELETE `/users/{userId}`
- [ ]  Definir a  DELETE
- [ ]  Definir os testes par PUT `/users/{userId}`
- [ ]  Definir a atualização e as regras de validação para user
- [ ]  Atualizar a validação do payload da rota de criação de usuário
- [ ]  Definir a rota de atualização do usuário

<aside>
💡 Seguir os mesmos princípios para a implementação dos endpoints restantes.

</aside>

- [ ]  `CourseEnrollment`
- [ ]  `Course`
- [ ]  `Test`
- [ ]  `Test Result`

