// Full data migration script using an alternative approach
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Extract readings from a JavaScript string
function extractAllReadings(fileContent) {
  // First, let's get all the reading arrays in the file
  const allReadings = [];

  // Find all standalone reading array declarations
  const readingArrayRegex = /const READINGS_[A-Z0-9_]+: Reading\[\] = \[([\s\S]*?)\];/g;
  let match;

  while ((match = readingArrayRegex.exec(fileContent)) !== null) {
    const arrayText = match[0];
    // Extract just the array part
    const arrayContentMatch = arrayText.match(/= \[([\s\S]*)\];$/);
    if (arrayContentMatch) {
      const arrayItemsText = arrayContentMatch[1];
      // Split by objects (each reading item)
      const itemsTexts = arrayItemsText.split(/},\s*\{/).filter(Boolean);

      // Process each item
      itemsTexts.forEach((itemText, index) => {
        // Clean up the item text (first and last items need special handling)
        let cleanedText = itemText;
        if (index === 0) {
          cleanedText = cleanedText.replace(/^\s*\[\s*{/, '');
        }
        if (index === itemsTexts.length - 1) {
          cleanedText = cleanedText.replace(/}\s*$/, '');
        }

        // Add back the curly braces
        cleanedText = '{' + cleanedText + '}';

        // Now parse each property
        try {
          const reading = extractReadingObject(cleanedText);
          if (reading) {
            allReadings.push(reading);
          }
        } catch (error) {
          console.error(`Error parsing reading object: ${error.message}`);
        }
      });
    }
  }

  // Also look for the main READINGS array
  const mainReadingsRegex = /export const READINGS: Reading\[\] = \[([\s\S]*?)\];/;
  const mainReadingsMatch = mainReadingsRegex.exec(fileContent);

  if (mainReadingsMatch && mainReadingsMatch[1]) {
    const arrayItemsText = mainReadingsMatch[1];
    // Split by objects (each reading item)
    const itemsTexts = arrayItemsText.split(/},\s*\{/).filter(Boolean);

    // Process each item
    itemsTexts.forEach((itemText, index) => {
      // Clean up the item text (first and last items need special handling)
      let cleanedText = itemText;
      if (index === 0) {
        cleanedText = cleanedText.replace(/^\s*\[\s*{/, '');
      }
      if (index === itemsTexts.length - 1) {
        cleanedText = cleanedText.replace(/}\s*$/, '');
      }

      // Add back the curly braces
      cleanedText = '{' + cleanedText + '}';

      // Now parse each property
      try {
        const reading = extractReadingObject(cleanedText);
        if (reading) {
          allReadings.push(reading);
        }
      } catch (error) {
        console.error(`Error parsing reading object: ${error.message}`);
      }
    });
  }

  return allReadings;
}

// Extract a reading object from a JavaScript object literal string
function extractReadingObject(objectText) {
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
  const slugMatch = objectText.match(/slug:\s*['"]([^'"]*)['"]/);
  if (slugMatch) reading.slug = slugMatch[1];

  // Extract title
  const titleMatch = objectText.match(/title:\s*['"]([^'"]*)['"]/);
  if (titleMatch) reading.title = titleMatch[1];

  // Extract author
  const authorMatch = objectText.match(/author:\s*['"]([^'"]*)['"]/);
  if (authorMatch) reading.author = authorMatch[1];

  // Extract finishedDate
  const finishedDateMatch = objectText.match(/finishedDate:\s*new Date\(['"]([^'"]*)['"]\)/);
  if (finishedDateMatch) {
    try {
      reading.finishedDate = new Date(finishedDateMatch[1]);
    } catch (_e) {
      reading.finishedDate = null;
    }
  }

  // Extract coverImageSrc
  const coverImageSrcMatch = objectText.match(/coverImageSrc:\s*['"]([^'"]*)['"]/);
  if (coverImageSrcMatch) reading.coverImageSrc = coverImageSrcMatch[1];

  // Extract thoughts
  const thoughtsMatch = objectText.match(/thoughts:\s*['"]([^'"]*)['"]/);
  if (thoughtsMatch) reading.thoughts = thoughtsMatch[1];

  // Extract dropped
  const droppedMatch = objectText.match(/dropped:\s*(true|false)/);
  if (droppedMatch) reading.dropped = droppedMatch[1] === 'true';

  // Only return the reading if we extracted the required fields
  if (reading.slug && reading.title && reading.author) {
    return reading;
  }
  return null;
}

// Extract quotes from a JavaScript string
function extractQuotes(fileContent) {
  // Extract the QUOTES array
  const quotesMatch = fileContent.match(/export const QUOTES = \[([\s\S]*)\];/);
  if (!quotesMatch) return [];

  const quotesArrayText = quotesMatch[1];
  const quotes = [];

  // Split by quote objects
  const quoteItemsTexts = quotesArrayText.split(/},\s*\{/).filter(Boolean);

  // Process each quote
  quoteItemsTexts.forEach((itemText, index) => {
    // Clean up the item text
    let cleanedText = itemText;
    if (index === 0) {
      cleanedText = cleanedText.replace(/^\s*\{/, '');
    }
    if (index === quoteItemsTexts.length - 1) {
      cleanedText = cleanedText.replace(/}\s*$/, '');
    }

    // Add back the curly braces
    cleanedText = '{' + cleanedText + '}';

    // Parse the quote properties
    try {
      const quote = extractQuoteObject(cleanedText);
      if (quote) {
        quotes.push(quote);
      }
    } catch (error) {
      console.error(`Error parsing quote object: ${error.message}`);
    }
  });

  return quotes;
}

// Extract a quote object from a JavaScript object literal string
function extractQuoteObject(objectText) {
  // Basic validation - make sure it has text property
  if (!objectText.includes('text:')) return null;

  const quote = {
    text: '',
    author: null,
  };

  // Extract text - can be complex because of quotes within quotes
  let textMatch = objectText.match(/text:\s*"((?:\\"|[^"])*?)"/);
  if (!textMatch) {
    // Try single quotes
    textMatch = objectText.match(/text:\s*'((?:\\'|[^'])*?)'/);
    if (!textMatch) {
      return null;
    }
  }
  quote.text = textMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'");

  // Extract author - can be null
  let authorMatch = objectText.match(/author:\s*"((?:\\"|[^"])*?)"/);
  if (!authorMatch) {
    // Try single quotes
    authorMatch = objectText.match(/author:\s*'((?:\\'|[^'])*?)'/);
  }

  if (authorMatch) {
    quote.author = authorMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
  }

  return quote;
}

async function migrateAllData() {
  try {
    // Read the data files
    const readingsFilePath = path.join(__dirname, '../src/app/readings/data.ts');
    const quotesFilePath = path.join(__dirname, '../src/app/quotes.ts');

    console.log(`Reading data files from ${readingsFilePath} and ${quotesFilePath}`);

    const readingsContent = fs.readFileSync(readingsFilePath, 'utf8');
    const quotesContent = fs.readFileSync(quotesFilePath, 'utf8');

    // Extract data
    const readings = extractAllReadings(readingsContent);
    const quotes = extractQuotes(quotesContent);

    console.log(`Extracted ${readings.length} readings and ${quotes.length} quotes`);

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.quote.deleteMany();
    await prisma.reading.deleteMany();

    // Migrate readings
    console.log(`Migrating ${readings.length} readings...`);
    let readingSuccesses = 0;

    for (const reading of readings) {
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
    console.log(`Migrating ${quotes.length} quotes...`);
    let quoteSuccesses = 0;

    for (const quote of quotes) {
      try {
        await prisma.quote.create({
          data: {
            text: quote.text,
            author: quote.author || null,
          },
        });
        quoteSuccesses++;
      } catch (error) {
        console.error(`Error migrating quote:`, error.message);
      }
    }

    console.log(
      `Migration completed with ${readingSuccesses}/${readings.length} readings and ${quoteSuccesses}/${quotes.length} quotes successfully migrated.`
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
