import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import statusPlugin from './external/plugins/status';
import prismaPlugin from './external/plugins/prisma';
import usersPlugin from './external/plugins/users';

dotenv.config();

const server: Hapi.Server = Hapi.server({
  port: process.env.APP_PORT,
  host: process.env.APP_HOST,
});

// Registra os plugins e inicializa o servidor
export async function createServer(): Promise<Hapi.Server> {
  await server.register([statusPlugin, prismaPlugin, usersPlugin]);
  // inicia os caches, finaliza o registro do plugin
  // mas não inicia a escuta na porta de conexão.
  await server.initialize();

  return server;
}

// Inicia o servidor ouvindo a porta da conexão
export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start();
  console.log(`Server running on ${server.info.uri}`);

  return server;
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});
