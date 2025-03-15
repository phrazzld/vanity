import { PrismaClient } from '@prisma/client';
import * as readingsData from '../src/app/readings/data';
import * as quotesData from '../src/app/quotes';

const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Get data from source files
    const readings = readingsData.READINGS || [];
    const quotes = quotesData.QUOTES || [];

    // Clear existing data (making the script idempotent)
    console.log('Clearing existing data...');
    await prisma.quote.deleteMany({});
    await prisma.reading.deleteMany({});
    
    // Insert readings
    console.log(`Migrating ${readings.length} readings...`);
    for (const reading of readings) {
      await prisma.reading.create({
        data: {
          slug: reading.slug,
          title: reading.title,
          author: reading.author,
          finishedDate: reading.finishedDate,
          coverImageSrc: reading.coverImageSrc,
          thoughts: reading.thoughts || '',
          dropped: reading.dropped || false,
        },
      });
    }

    // Insert quotes
    console.log(`Migrating ${quotes.length} quotes...`);
    for (const quote of quotes) {
      await prisma.quote.create({
        data: {
          text: quote.text,
          author: quote.author || null,
        },
      });
    }

    console.log('Data migration completed successfully.');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateData };