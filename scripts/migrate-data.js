// A simpler approach to migrate data
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Sample data for testing - we'll use this until we can properly parse the source files
const sampleReadings = [
  {
    slug: 'the-silmarillion',
    title: 'The Silmarillion',
    author: 'J.R.R. Tolkien',
    finishedDate: null,
    coverImageSrc: '/readings/the-silmarillion-01.jpg',
    thoughts: '',
    dropped: false
  },
  {
    slug: 'why-greatness-cannot-be-planned',
    title: 'Why Greatness Cannot Be Planned: The Myth of the Objective',
    author: 'Kenneth O. O. Stanley',
    finishedDate: new Date('2025-02-24'),
    coverImageSrc: '/readings/why-greatness-cannot-be-planned-01.jpg',
    thoughts: '',
    dropped: false
  },
  {
    slug: 'the-technological-republic',
    title: 'The Technological Republic: Hard Power, Soft Belief, and the Future of the West',
    author: 'Alexander C. Karp and Nicholas W. Zamiska',
    finishedDate: null, 
    coverImageSrc: '/readings/the-technological-republic-01.jpg',
    thoughts: '',
    dropped: false
  }
];

const sampleQuotes = [
  {
    text: "Never outshine the master.",
    author: "Robert Greene, \"48 Laws of Power\", Law #01"
  },
  {
    text: "Never put too much trust in friends, learn how to use enemies.",
    author: "Robert Greene, \"48 Laws of Power\", Law #02"
  },
  {
    text: "Conceal your intentions.",
    author: "Robert Greene, \"48 Laws of Power\", Law #03"
  },
  {
    text: "Always say less than necessary.",
    author: "Robert Greene, \"48 Laws of Power\", Law #04"
  },
  {
    text: "So much depends on reputation--guard it with your life.",
    author: "Robert Greene, \"48 Laws of Power\", Law #05"
  }
];

async function migrateData() {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.quote.deleteMany();
    await prisma.reading.deleteMany();
    
    // Read files for manual extraction
    const readingsFilePath = path.join(__dirname, '../src/app/readings/data.ts');
    const quotesFilePath = path.join(__dirname, '../src/app/quotes.ts');
    
    const readingsContent = fs.readFileSync(readingsFilePath, 'utf8');
    const quotesContent = fs.readFileSync(quotesFilePath, 'utf8');
    
    // Migrate readings - using sample data for now
    console.log(`Migrating readings...`);
    for (const reading of sampleReadings) {
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
    
    // Migrate quotes - using sample data for now
    console.log(`Migrating quotes...`);
    for (const quote of sampleQuotes) {
      await prisma.quote.create({
        data: {
          text: quote.text,
          author: quote.author || null,
        },
      });
    }
    
    // Get counts
    const readingCount = await prisma.reading.count();
    const quoteCount = await prisma.quote.count();
    
    console.log(`Migration completed: ${readingCount} readings and ${quoteCount} quotes imported.`);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateData();