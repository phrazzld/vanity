/**
 * Mock implementation of the Prisma Client
 * Used for testing to avoid real database connections
 * @jest-environment node
 */

// Add Jest globals to ESLint environment
/* eslint-env jest */
/* eslint-disable no-undef */

const PrismaClientMock = jest.fn().mockImplementation(() => ({
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

// Export the mock
export const PrismaClient = PrismaClientMock;

// Type-safe error creation
interface PrismaClientKnownRequestErrorParams {
  code: string;
  clientVersion: string;
  meta?: Record<string, unknown>;
}

// Mock Prisma error classes
export const Prisma = {
  PrismaClientKnownRequestError: jest
    .fn()
    .mockImplementation((message: string, params: PrismaClientKnownRequestErrorParams) => {
      const error = new Error(message);
      Object.defineProperty(error, 'name', { value: 'PrismaClientKnownRequestError' });
      Object.defineProperty(error, 'code', { value: params.code });
      Object.defineProperty(error, 'clientVersion', { value: params.clientVersion });
      Object.defineProperty(error, 'meta', { value: params.meta });
      return error;
    }),
  PrismaClientValidationError: jest.fn().mockImplementation((message: string) => {
    const error = new Error(message);
    Object.defineProperty(error, 'name', { value: 'PrismaClientValidationError' });
    return error;
  }),
};