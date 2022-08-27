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

# Iniciando o projeto

- Inicie um pacote node com `npm init`.
- Instale as dependências de desenvolvimento iniciais:

```bash
npm i -D prisma typescript @types/node ts-node-dev

```

- Instale Prisma Client para gerarmos o esquema do banco de dados:

```bash
npm i @prisma/client

```

- Inicie um novo projeto Prisma:

```bash
npx prisma init

```

Note que, na raiz do projeto, um diretório chamado `prisma` foi criado. Dentro
dele temos um arquivo chamado `prisma-schema` que veremos em detalhes daqui a
pouco.

Também foi criado um arquivo `.env` com uma variável que define a
[URL de conexção](https://www.prisma.io/docs/reference/database-reference/connection-urls)
com o banco de dados. Por padrão, o Prisma nos direciona para o uso do
PostgreSQL, mas uma lista dos databases suportados pode ser consultada
[aqui](https://www.prisma.io/docs/reference/database-reference/supported-databases).

Neste estudo faremos uso do PostgreSQL, então a URL de conexão deve se parecer
com isso:

```bash
DATABASE_URL=postgresql://janedoe:mypassword@localhost:5432/mydb
```

- Conecte com o banco:

Configure as suas variáveis de ambiente com os valores necessários:

```bash
# POSTGRES_USER=<your user>
# POSTGRES_PASSWORD=<your password>
# POSTGRES_PORT=<port (5432)>
# POSTGRES_HOST=<your host>
# POSTGRES_DB=<your database name>

# URL 
# DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
```
Vamos configurar um container para usarmos um banco PostgreSQL:

```yml
version: '3.8'
services:
  postgres:
    image: postgres:14.1
    container_name: modern_api
    env_file: ./.env
    restart: always
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_HOST=${POSTGRES_HOST}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres:/var/lib/postgresql/data
    ports:
      - ${POSTGRES_PORT}:5432

volumes:
  postgres:
```
- Execute o container
```bash
docker-compose up -d

```
Com isso, você deve ser capaz de se conectar com o container PostgreSQL.

# Modelagem de dados

<details>
  <summary>
    <b>
      Domínio do Problema
    </b>
  </summary>

Sistema de classificação online de alunos de um curso específico.

> O domínio do problema (ou espaço do problema) é um termo que se refere a todas
> as informações que definem o problema e restringem a solução (as restrições
> fazem parte do problema). Ao entender o domínio do problema, a forma a
> estrutura do modelo de dados devem ficar claras.

Para esse estudo, definimos que teremos as seguintes entidades\*:

- **User**: Uma pessoa com uma conta. Um usuário pode ser um professor ou um
  aluno. Um mesmo usuário que é professor de um curso, por exemplo, pode ser um
  aluno em outro curso.
- **Course**: Um curso que pode ter um ou mais professores e alunos, como um ou
  mais testes de verificação de aprendizagem.
- **Tests**: Um curso pode ter muitos testes para avaliar a compreensão dos
  alunos. Os testes têm uma data e estão relacionados a um curso.
- **TestResult**: Cada teste pode ter vários registros e notas por aluno. Além
  disso, um `TestResult` também está relacionado ao professor que avaliou o
  teste.

> \*Uma entidade representa um objeto físico ou um conceito intangível.

</details>

<details>
  <summary>
    <b>
      Diagrama entidade relacionamento
    </b>
  </summary>

Considerando as entidades definidas acima, podemos perceber como elas se
relacionam:

- Um para muitos (1-N):

  - `Test` <--> `TestResult`
  - `Course` <--> `Test`
  - `User` <--> `TestResult` (através da FK `student`)
  - `User` <--> `TestResult` (através da FK `gradeId`)

- Muitos para muitos (M-N)
  - `User` <--> `Course` (através da tabela `CourseEnrollment` com duas FKs:
    `userId`, e `courseId`)

Para uma relação M-N, se faz necessário a criação de uma nova tabela, chamada de
_tabela de relacionamento (ou tabela JOIN)_. Uma tabela de relações é uma
prática de modelagem comum em SQL para representar relacionamentos entre
diferentes entidades. Em essência, significa que "uma relação mn é modelada como
duas relações 1-n no banco de dados".

Dessa maneira o sistema de avaliações terá as seguintes propriedades:

- Um único curso pode ter muitos usuários associados (alunos e professores).
- Um único usuário pode ser associado a vários cursos.

Com as cardinalidades das entidades compreendidas, podemos definir seus
atributos e representá-las graficamente.

Um Diagrama Entidade Relacionamento deste estudo pode ser acessado
[aqui.](https://drawsql.app/freelancer-51/diagrams/grading-system-online-course)

 [Voltar ao topo](#descrição)

</details>

# Prisma Schema

O `schema-prisma` é uma cofiguração declarativa que define as entidades que
serão migradas para o banco de dados. Essa migração é feita através do Prima
Migrate, que irá criar efetivamente as tabelas e suas colunas no banco dados.

<details>
  <summary>
    <b>
      Anatomia do arquivo prisma-schema
    </b>
  </summary>

```javascript

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- `generator`

  - Gerador do arquivo usado por Prisma Client através quando
    `npx prisma generate` é executado.

- `datasource`

  - Define o tipo de banco ao qual você se irá se conectar. Essa conexão é feita
    por uma string de conexão. Com `env('DATABASE_URL)`, o Prisma lerá a URL do
    banco definida em uma variável de ambiente criada no arquivo `.env` criado
    na raiz do projeto o comando `prisma init` foi executado.

- `model`

```javascript

model User {
  id            Int    @default(autoincrement()) @id
  email         String @unique
  firstName     String
  lastName      String
  social        Json?
}

```

O bloco de construção fundamental para do `prisma-schema` é o `model`. É nele
que declaramos as entidades, seus campos e suas relações.

Aqui está uma assinatura das entidades ignorando suas relações:

```javascript

model User {
  id            Int    @id @default(autoincrement())
  email         String @unique
  firstname     String
  lastname      String
  socila        Json?
}

model Course {
  id            Int     @id @default(autoincrement())
  name          String
  courseDetails String?
}

model Test {
  id            Int      @id @default(autoincrement())
  updatedAt     DateTime @updatedAt
  name          String // nome do teste
  date          DateTime // data do teste
}

model TestResult {
  id            Int      @id @default(autoincrement())
  createdAt     DateTime @default(now())
  result        Int
}

```

[Voltar ao topo](#descrição)

</details>

<details>
<summary>
  <b>
    Definindo as relações
  </b>
  </summary>
   <details>
    <summary>
      <b>
        1 --- N:
      </b>
    </summary>

Para definirmos uma relação um-para-muitos, anotamos o atributo `@relation` do
lado que recebe a chave estrangeira (lado "muitos" da relação). Essa anotação
recebe como argumentos o campo que representa a chave estrangeira da tabela
subjacente e uma referência à chave primária desta tabela.

Para ilustrar, tomemos a relação entre `Test` e `TestResult`:

```javascript
model Test {
  id              Int          @id @default(autoincrement())
  updatedAt       DateTime     @updatedAt
  name            String
  date            DateTime
}

model TestResult {
  id              Int      @id @default(autoincrement())
  createdAt       DateTime @default(now())
  result          Int
}
```

O lado "muitos", `TestResult`, armazenará a chave estrangeira que estabelecerá o
relacionamento com o modelo `Test`. Adicionamos os campos `testId`, que tem o
tipo `Test` e o atributo `@relation` configurando que este campo faz referência
à chave primária de `Test`:

```javascript
model Test {
  id              Int          @id @default(autoincrement())
  updatedAt       DateTime     @updatedAt
  name            String
  date            DateTime
+ testResults     TestResult[]
}

model TestResult {
  id              Int      @id @default(autoincrement())
  createdAt       DateTime @default(now())
  result          Int
+ test            Test     @relation(fields: [testId], references: [id])
+ testId          Int
}

```

Note que `testId` do tipo `Int` **representa o campo "real" do banco de dados
configurando a chave estrangeira.** Na
[documentação Prisma](https://www.prisma.io/docs/concepts/components/prisma-schema/relations#annotated-relation-fields-and-relation-scalar-fields)
este campo é chamado de "escalar" ou campo de "relação escalar".

O campo `test` do tipo `Test` e `testResult` do tipo `TestResult[]` são chamados
de "campos de relação". O atributo `@relation` mapeia a relação escalar `testId`
para o campo `id` que é a chave primária do modelo `Test` e `testResult` indica
que um array armazenará os resultados de queries futuras.

Ambos, `test` e `testResult` afetam as relações são programaticamente com Prisma
Client, mas **não representam colunas no banco de dados**.

[Voltar ao topo](#descrição)

  </details>
   <details>
    <summary>
      <b>
        M --- N:
      </b>
    </summary>

No Prisma, as relações muitos-para-muitos podem ser implícitas ou explícitas no
schema.

Na modelagem, percebemos que `User` e `Course` possuem uma relação M:N. Para
cria uma relação muitos-para-muitos implícita, definimos campos de relação com
listas em ambos os lados da relação:

```javascript
model User {
  id            Int    @default(autoincrement()) @id
  email         String @unique
  firstname     String
  lastName      String
  social        Json?

+ courses       Course[]
}

model Course {
  id            Int     @default(autoincrement()) @id
  name          String
  courseDetails String?

+ members       User[]
}
```

Isso garante que apenas um único curso terá muitos usuários associados e um
único usuário estará associado a muitos cursos.

Contudo, um dos requisitos do projeto é permitir relacionar um usuário a um
curso na função de "professor" ou "aluno". Isso significa que precisamos
encontrar uma maneira de armazenar "meta-informações" sobre a relação no banco
de dados.

Isso pode ser alcançado usando uma relação M:N explícita.

```javascript
model User {
  id        Int    @default(autoincrement()) @id
  email     String @unique
  firstName String
  lastName  String
  social    Json?

+ courses     CourseEnrollment[]
}

model Course {
  id            Int     @default(autoincrement()) @id
  name          String
  courseDetails String?

+ members       CourseEnrollment[]
}

model CourseEnrollment {

+  createdAt DateTime @default(now())
+  role      UserRole
+  // Relation Fields
+  userId   Int
+  user     User   @relation(fields: [userId], references: [id])
+  courseId Int
+  course   Course @relation(fields: [courseId], references: [id])
+  @@id([userId, courseId])
+  @@index([userId, role])
}

enum UserRole {
+  STUDENT
+  TEACHER
+
}
```

O que deve ser observado na relação M:N explícita:

- É usado um enum `UserRole` para indicar se o usuário é um professor ou aluno.

- `@@id[userId, courseId]` define uma chave primária composta. Isso garante que
  cada `User` seja associado a um `Course` uma vez, como professor ou aluno, mas
  não ambos.

Consulte a documentação sobre
[relações](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
e sobre
[chaves estrangeiras](https://www.prisma.io/docs/guides/general-guides/database-workflows/foreign-keys/postgresql#overview)

[Voltar ao topo](#descrição)

</details>

# Migrando o Banco de dados

Com o esquema definido, agora precisamos migrar os modelos usando Prisma Migrate
para gerar as tabelas no banco.

Execute:



# Semeando o banco de dados
