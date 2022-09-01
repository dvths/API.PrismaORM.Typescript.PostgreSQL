import Hapi from '@hapi/hapi';

const userPlugin = {
  name: 'app/users',
  // Garante que o Hapi carregue o plugin Prisma primeiro
  dependencies: ['prisma'],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: 'POST',
        path: '/users',
        handler: createUserHandler,
      },
    ]);
  },
};

export default userPlugin;

interface IUserInput {
  firstname: string;
  lastname: string;
  email: string;
  social: {
    facebook?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

async function createUserHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;
  const payload = request.payload as IUserInput;

  try {
    const createdUser = await prisma.user.create({
      data: {
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        social: JSON.stringify(payload.social),
      },
      select: {
        id: true,
      },
    });
    return h.response(createdUser).code(201);
  } catch (err) {
    console.log(err);
  }
}
