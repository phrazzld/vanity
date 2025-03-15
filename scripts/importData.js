const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

// Import data directly from the files
async function importData() {
  try {
    console.log('Starting data import...');

    // Load data from source files
    const readingsFile = fs.readFileSync(path.join(__dirname, '../src/app/readings/data.ts'), 'utf8');
    const quotesFile = fs.readFileSync(path.join(__dirname, '../src/app/quotes.ts'), 'utf8');

    // Extract READINGS array using regex
    let readingsMatch = readingsFile.match(/export const READINGS[^\[]*(\[[\s\S]*\])/);
    if (!readingsMatch) {
      console.error('Could not find READINGS array in data.ts');
      return;
    }

    // Extract QUOTES array using regex
    let quotesMatch = quotesFile.match(/export const QUOTES[^\[]*(\[[\s\S]*\])/);
    if (!quotesMatch) {
      console.error('Could not find QUOTES array in quotes.ts');
      return;
    }

    // Parse readings data - this is a simplified approach
    const readingsData = eval(`(${readingsMatch[1]})`);
    const quotesData = eval(`(${quotesMatch[1]})`);

    console.log(`Found ${readingsData.length} readings and ${quotesData.length} quotes`);

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.quote.deleteMany({});
    await prisma.reading.deleteMany({});
    
    // Insert readings
    console.log(`Migrating ${readingsData.length} readings...`);
    for (const reading of readingsData) {
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
    console.log(`Migrating ${quotesData.length} quotes...`);
    for (const quote of quotesData) {
      await prisma.quote.create({
        data: {
          text: quote.text,
          author: quote.author || null,
        },
      });
    }

    console.log('Data import completed successfully.');
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importData()
  .then(() => console.log('Done!'))
  .catch((e) => console.error(e));