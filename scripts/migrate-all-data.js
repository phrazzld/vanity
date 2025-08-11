// Script to extract and migrate all readings and quotes from the source files
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Paths to data files
const readingsPath = path.join(__dirname, '../src/app/readings/data.ts');
const quotesPath = path.join(__dirname, '../src/app/quotes.ts');

// Extract all JS object literals from a string
function extractJSObjects(content) {
  const objects = [];
  let bracketCount = 0;
  let currentObject = '';
  let inObject = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '{') {
      bracketCount++;
      if (bracketCount === 1) {
        inObject = true;
        currentObject = '{';
      } else if (inObject) {
        currentObject += char;
      }
    } else if (char === '}') {
      bracketCount--;
      if (bracketCount === 0 && inObject) {
        currentObject += '}';
        objects.push(currentObject);
        inObject = false;
        currentObject = '';
      } else if (inObject) {
        currentObject += char;
      }
    } else if (inObject) {
      currentObject += char;
    }
  }

  return objects;
}

// Parse a reading object from its string representation
function parseReading(objectStr) {
  // Check if this is a valid reading object (not a type definition or other object)
  if (!objectStr.includes('slug:') || !objectStr.includes('title:')) {
    return null;
  }

  const reading = {
    slug: '',
    title: '',
    author: '',
    finishedDate: null,
    coverImageSrc: null,
    thoughts: '',
    dropped: false,
  };

  // Extract slug
  const slugMatch = objectStr.match(/slug:\s*['"]([^'"]*)['"]/);
  if (slugMatch) reading.slug = slugMatch[1];

  // Extract title
  const titleMatch = objectStr.match(/title:\s*['"]([^'"]*)['"]/);
  if (titleMatch) reading.title = titleMatch[1];

  // Extract author
  const authorMatch = objectStr.match(/author:\s*['"]([^'"]*)['"]/);
  if (authorMatch) reading.author = authorMatch[1];

  // Extract finishedDate
  const finishedDateMatch = objectStr.match(/finishedDate:\s*new Date\(['"]([^'"]*)['"]\)/);
  if (finishedDateMatch) {
    try {
      reading.finishedDate = new Date(finishedDateMatch[1]);
    } catch {
      reading.finishedDate = null;
    }
  }

  // Extract coverImageSrc
  const coverImageSrcMatch = objectStr.match(/coverImageSrc:\s*['"]([^'"]*)['"]/);
  if (coverImageSrcMatch) reading.coverImageSrc = coverImageSrcMatch[1];

  // Extract thoughts
  const thoughtsMatch = objectStr.match(/thoughts:\s*['"]([^'"]*)['"]/);
  if (thoughtsMatch) reading.thoughts = thoughtsMatch[1];

  // Extract dropped
  const droppedMatch = objectStr.match(/dropped:\s*(true|false)/);
  if (droppedMatch) reading.dropped = droppedMatch[1] === 'true';

  // Only return valid reading objects with required fields
  if (reading.slug && reading.title && reading.author) {
    return reading;
  }

  return null;
}

// Parse a quote object from its string representation
function parseQuote(objectStr) {
  // Check if this is a valid quote object
  if (!objectStr.includes('text:')) {
    return null;
  }

  const quote = {
    text: '',
    author: null,
  };

  // Extract text (handling escaped quotes)
  const textMatch = objectStr.match(/text:\s*["'](.+?)["'](?=,|$)/s);
  if (textMatch) {
    // Remove escaped quotes
    quote.text = textMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
  } else {
    return null; // Text is required
  }

  // Extract author (can be null)
  const authorMatch = objectStr.match(/author:\s*["'](.+?)["'](?=,|$)/s);
  if (authorMatch) {
    // Remove escaped quotes
    quote.author = authorMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
  }

  return quote;
}

async function migrateAllData() {
  try {
    console.log('Reading source files...');
    const readingsContent = fs.readFileSync(readingsPath, 'utf8');
    const quotesContent = fs.readFileSync(quotesPath, 'utf8');

    // Extract JavaScript objects
    console.log('Extracting objects...');
    const readingObjects = extractJSObjects(readingsContent);
    const quoteObjects = extractJSObjects(quotesContent);

    console.log(
      `Found ${readingObjects.length} potential reading objects and ${quoteObjects.length} potential quote objects`
    );

    // Parse readings
    const readings = readingObjects.map(obj => parseReading(obj)).filter(r => r !== null);

    // Parse quotes
    const quotes = quoteObjects.map(obj => parseQuote(obj)).filter(q => q !== null);

    console.log(`Successfully parsed ${readings.length} readings and ${quotes.length} quotes`);

    // Deduplicate by slug/text
    const uniqueReadings = [];
    const slugsSet = new Set();

    for (const reading of readings) {
      if (!slugsSet.has(reading.slug)) {
        slugsSet.add(reading.slug);
        uniqueReadings.push(reading);
      }
    }

    const uniqueQuotes = [];
    const textsSet = new Set();

    for (const quote of quotes) {
      if (!textsSet.has(quote.text)) {
        textsSet.add(quote.text);
        uniqueQuotes.push(quote);
      }
    }

    console.log(
      `After deduplication: ${uniqueReadings.length} readings and ${uniqueQuotes.length} quotes`
    );

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.quote.deleteMany();
    await prisma.reading.deleteMany();

    // Migrate readings
    console.log(`Migrating ${uniqueReadings.length} readings...`);
    let readingSuccesses = 0;

    for (const reading of uniqueReadings) {
      try {
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
        readingSuccesses++;
      } catch (error) {
        console.error(`Error migrating reading ${reading.slug}:`, error.message);
      }
    }

    // Migrate quotes
    console.log(`Migrating ${uniqueQuotes.length} quotes...`);
    let quoteSuccesses = 0;

    for (const quote of uniqueQuotes) {
      try {
        await prisma.quote.create({
          data: {
            text: quote.text,
            author: quote.author,
          },
        });
        quoteSuccesses++;
      } catch (error) {
        console.error(`Error migrating quote:`, error.message);
      }
    }

    console.log(
      `Migration completed with ${readingSuccesses}/${uniqueReadings.length} readings and ${quoteSuccesses}/${uniqueQuotes.length} quotes successfully migrated.`
    );

    // Get counts from database to verify
    const dbReadingCount = await prisma.reading.count();
    const dbQuoteCount = await prisma.quote.count();

    console.log(`Database now contains ${dbReadingCount} readings and ${dbQuoteCount} quotes.`);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateAllData();
