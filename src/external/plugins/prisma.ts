import { PrismaClient } from '@prisma/client';
import Hapi from '@hapi/hapi';

/*
  Module Augmentation:
  Corrige o erro de tipo:
  error TS2339: Property 'prisma' does not exist on type 'ServerApplicationState'

  Aumento de módulo auxilia a estender as funcionalidades para bibliotecas de
  terceiros às quais talvez não tenhamos acesso ou classes em outros arquivos.
*/

declare module '@hapi/hapi' {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

// Plugin para instanciar Prisma Client

const prismaPlugin: Hapi.Plugin<null> = {
  name: 'prisma',
  register: async function (server: Hapi.Server) {
    const prisma = new PrismaClient();

    server.app.prisma = prisma;

    // Fecha a conexão com o banco de dados depois que listeners de conexão do servidor
    // são interrompidos
    // Relatado em: https://github.com/hapijs/hapi/issues/2839
    server.ext({
      type: 'onPostStop',
      method: async (server: Hapi.Server) => {
        server.app.prisma.$disconnect();
      },
    });
  },
};

export default prismaPlugin;
