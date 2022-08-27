FROM node:16-alpine as development

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# imagem de produção
FROM node:16-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --only=production

# copiar os arquivos da estação de desenvolvimento
COPY --from=development /usr/src/app/dist ./dist

CMD [ "node", "dist/server.ts" ]








