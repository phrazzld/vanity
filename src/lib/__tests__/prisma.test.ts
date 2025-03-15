import { PrismaClient } from '@prisma/client';
import prisma from '../prisma';

// Mock the PrismaClient constructor
jest.mock('@prisma/client');

describe('Prisma Client', () => {
  it('should return the same instance when imported multiple times', () => {
    // Import the client again
    const prisma2 = require('../prisma').default;
    
    // Should be the same instance
    expect(prisma).toBe(prisma2);
  });

  it('should create only one instance of PrismaClient', () => {
    expect(PrismaClient).toHaveBeenCalledTimes(1);
  });
});