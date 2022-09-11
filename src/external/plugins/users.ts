import Hapi from '@hapi/hapi';
import Joi from 'joi';

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
        options: {
          validate: {
            payload: userInputValidator,
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
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

async function createUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
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

const userInputValidator = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  social: Joi.object({
    facebook: Joi.string().optional(),
    twitter: Joi.string().optional(),
    github: Joi.string().optional(),
    website: Joi.string().optional(),
  }).optional(),
});
