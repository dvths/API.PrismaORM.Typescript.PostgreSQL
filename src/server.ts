import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';

dotenv.config();

const server: Hapi.Server = Hapi.server({
  port: process.env.APP_PORT,
  host: process.env.APP_HOST,
});

export async function start(): Promise<Hapi.Server> {
  await server.start();
  return server;
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

start()
  .then((server) => {
    console.log(`Server running on ${server.info.uri}`);
  })
  .catch((err) => {
    console.log(err);
  });
