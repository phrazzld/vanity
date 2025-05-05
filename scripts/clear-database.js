// This script clears all data from the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('Clearing existing data...');
    await prisma.quote.deleteMany();
    await prisma.reading.deleteMany();
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
