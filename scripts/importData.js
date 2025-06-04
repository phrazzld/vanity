const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

// Safe parser for readings array
function parseReadingsArray(arrayContent) {
  const readings = [];
  const objPattern = /{[\s\S]*?}/g;
  const matches = arrayContent.match(objPattern) || [];

  for (const objText of matches) {
    try {
      // Extract properties using regex
      const slugMatch = objText.match(/slug:\s*['"]([^'"]*)['"]/);
      const titleMatch = objText.match(/title:\s*['"]([^'"]*)['"]/);
      const authorMatch = objText.match(/author:\s*['"]([^'"]*)['"]/);
      const finishedDateMatch = objText.match(
        /finishedDate:\s*(?:new Date\(['"]([^'"]*)['"]\)|null)/
      );
      const coverImageSrcMatch = objText.match(/coverImageSrc:\s*['"]([^'"]*)['"]/);
      const thoughtsMatch = objText.match(/thoughts:\s*['"]([^'"]*)['"]/);
      const droppedMatch = objText.match(/dropped:\s*(true|false)/);

      if (slugMatch && titleMatch) {
        const reading = {
          slug: slugMatch[1],
          title: titleMatch[1],
          author: authorMatch ? authorMatch[1] : '',
          finishedDate: finishedDateMatch && finishedDateMatch[1] ? finishedDateMatch[1] : null,
          coverImageSrc: coverImageSrcMatch ? coverImageSrcMatch[1] : null,
          thoughts: thoughtsMatch ? thoughtsMatch[1] : '',
          dropped: droppedMatch ? droppedMatch[1] === 'true' : false,
        };
        readings.push(reading);
      }
    } catch (error) {
      console.error('Error parsing reading object:', error);
    }
  }

  return readings;
}

// Safe parser for quotes array
function parseQuotesArray(arrayContent) {
  const quotes = [];
  let currentQuote = null;
  let inQuoteObject = false;
  let textBuffer = '';
  let authorBuffer = '';
  let capturingText = false;
  let capturingAuthor = false;

  // Split by lines and process
  const lines = arrayContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Start of a quote object
    if (trimmedLine === '{') {
      inQuoteObject = true;
      currentQuote = { text: '', author: null };
      continue;
    }

    // End of a quote object
    if (trimmedLine === '},' || trimmedLine === '}') {
      if (currentQuote && currentQuote.text) {
        quotes.push(currentQuote);
      }
      inQuoteObject = false;
      currentQuote = null;
      textBuffer = '';
      authorBuffer = '';
      capturingText = false;
      capturingAuthor = false;
      continue;
    }

    // Inside a quote object
    if (inQuoteObject) {
      // Text property
      if (trimmedLine.startsWith('text:')) {
        capturingText = true;
        capturingAuthor = false;
        // Extract text value
        const textMatch = trimmedLine.match(/text:\s*["'](.*)$/);
        if (textMatch) {
          textBuffer = textMatch[1];
          // Check if quote is complete on this line
          if (textBuffer.match(/["']$/)) {
            textBuffer = textBuffer.slice(0, -1);
            currentQuote.text = textBuffer.replace(/\\"/g, '"');
            capturingText = false;
            textBuffer = '';
          }
        }
        continue;
      }

      // Author property
      if (trimmedLine.startsWith('author:')) {
        capturingText = false;
        capturingAuthor = true;
        // Handle null author
        if (trimmedLine.includes('null')) {
          currentQuote.author = null;
          capturingAuthor = false;
          continue;
        }
        // Extract author value
        const authorMatch = trimmedLine.match(/author:\s*["'](.*)$/);
        if (authorMatch) {
          authorBuffer = authorMatch[1];
          // Check if quote is complete on this line
          if (authorBuffer.match(/["']$/)) {
            authorBuffer = authorBuffer.slice(0, -1);
            currentQuote.author = authorBuffer.replace(/\\"/g, '"');
            capturingAuthor = false;
            authorBuffer = '';
          }
        }
        continue;
      }

      // Continue capturing multi-line text
      if (capturingText) {
        textBuffer += ' ' + trimmedLine;
        if (trimmedLine.match(/["']$/)) {
          textBuffer = textBuffer.slice(0, -1);
          currentQuote.text = textBuffer.replace(/\\"/g, '"');
          capturingText = false;
          textBuffer = '';
        }
      }

      // Continue capturing multi-line author
      if (capturingAuthor) {
        authorBuffer += ' ' + trimmedLine;
        if (trimmedLine.match(/["']$/)) {
          authorBuffer = authorBuffer.slice(0, -1);
          currentQuote.author = authorBuffer.replace(/\\"/g, '"');
          capturingAuthor = false;
          authorBuffer = '';
        }
      }
    }
  }

  return quotes;
}

// Import data directly from the files
async function importData() {
  try {
    console.log('Starting data import...');

    // Load data from source files
    const readingsFile = fs.readFileSync(
      path.join(__dirname, '../src/app/readings/data.ts'),
      'utf8'
    );
    const quotesFile = fs.readFileSync(path.join(__dirname, '../src/app/quotes.ts'), 'utf8');

    // Extract READINGS array using regex
    let readingsMatch = readingsFile.match(/export const READINGS[^[]*(\[[\s\S]*\])/);
    if (!readingsMatch) {
      console.error('Could not find READINGS array in data.ts');
      return;
    }

    // Extract QUOTES array using regex
    let quotesMatch = quotesFile.match(/export const QUOTES[^[]*(\[[\s\S]*\])/);
    if (!quotesMatch) {
      console.error('Could not find QUOTES array in quotes.ts');
      return;
    }

    // Parse readings data using safe regex-based extraction
    const readingsData = parseReadingsArray(readingsMatch[1]);
    const quotesData = parseQuotesArray(quotesMatch[1]);

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
  .catch(e => console.error(e));
