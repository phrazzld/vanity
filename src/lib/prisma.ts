import { PrismaClient } from '@prisma/client';

// This approach ensures we don't have multiple instances of PrismaClient in development
// See: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

// Ensure the global object has the right TypeScript definition
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a new client or use the existing one
const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// In development, we want to attach the client to the global object to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;