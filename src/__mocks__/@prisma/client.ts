// src/__mocks__/@prisma/client.ts
export const PrismaClient = jest.fn().mockImplementation(() => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn(),
  $transaction: jest.fn((callback) => callback()),
  reading: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  quote: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

export const Prisma = {
  PrismaClientKnownRequestError: jest.fn().mockImplementation((message, { code, clientVersion, meta }) => {
    const error = new Error(message);
    error.name = 'PrismaClientKnownRequestError';
    error.code = code;
    error.clientVersion = clientVersion;
    error.meta = meta;
    return error;
  }),
  PrismaClientValidationError: jest.fn().mockImplementation((message) => {
    const error = new Error(message);
    error.name = 'PrismaClientValidationError';
    return error;
  }),
};