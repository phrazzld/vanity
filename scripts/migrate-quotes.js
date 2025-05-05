// A specialized script just for quotes migration
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateQuotes() {
  try {
    console.log('Starting quotes migration...');

    // Path to the quotes file
    const quotesPath = path.join(__dirname, '../src/app/quotes.ts');

    // Check if the file exists (it may have been removed after migration)
    let content = '';
    try {
      if (fs.existsSync(quotesPath)) {
        console.log('Reading quotes from:', quotesPath);
        content = fs.readFileSync(quotesPath, 'utf8');
      } else {
        console.log('Quotes file not found. Migration has likely already been completed.');
        console.log('Skipping file parsing step. Will only process existing database entries.');
        return; // Skip the migration since the file doesn't exist
      }
    } catch (error) {
      console.error('Error checking/reading quotes file:', error);
      throw error;
    }

    // Parse the quotes using a simple line-by-line approach
    const quotes = [];
    let currentQuote = null;

    // Split into lines and process
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Start of a quote object
      if (line === '{') {
        currentQuote = {};
        continue;
      }

      // End of a quote object
      if (line === '},' || line === '}') {
        if (currentQuote && currentQuote.text) {
          quotes.push(currentQuote);
        }
        currentQuote = null;
        continue;
      }

      // Process quote properties
      if (currentQuote) {
        // Text property
        if (line.startsWith('text:')) {
          // Extract everything after "text: " until the end of the line
          let text = line.substring(line.indexOf('text:') + 5).trim();

          // Remove the starting quote and trailing comma if present
          if (text.startsWith('"')) text = text.substring(1);
          if (text.endsWith('",')) text = text.substring(0, text.length - 2);
          else if (text.endsWith('"')) text = text.substring(0, text.length - 1);

          // Replace escape sequences with their actual characters
          text = text
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\')
            .replace(/\\t/g, '\t');

          currentQuote.text = text;
        }

        // Author property
        if (line.startsWith('author:')) {
          // Check for null author
          if (line.includes('null')) {
            currentQuote.author = null;
            continue;
          }

          // Extract everything after "author: " until the end of the line
          let author = line.substring(line.indexOf('author:') + 7).trim();

          // Remove the starting quote and trailing comma if present
          if (author.startsWith('"')) author = author.substring(1);
          if (author.endsWith('",')) author = author.substring(0, author.length - 2);
          else if (author.endsWith('"')) author = author.substring(0, author.length - 1);

          // Replace escape sequences with their actual characters
          author = author
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\')
            .replace(/\\t/g, '\t');

          currentQuote.author = author;
        }
      }
    }

    console.log(`Parsed ${quotes.length} quotes`);

    // Log a few sample quotes to verify escape sequences are handled correctly
    console.log('\nSample quotes to verify escape handling:');
    for (let i = 0; i < Math.min(5, quotes.length); i++) {
      const quote = quotes[i];
      console.log(`[${i + 1}] Text: "${quote.text}"`);
      console.log(`    Author: "${quote.author}"`);
    }

    // Find quotes with escaped characters for verification
    const quotesWithEscapes = quotes.filter(
      q => (q.text && q.text.includes('"')) || (q.author && q.author.includes('"'))
    );

    if (quotesWithEscapes.length > 0) {
      console.log('\nQuotes with quotation marks (after unescaping):');
      for (let i = 0; i < Math.min(3, quotesWithEscapes.length); i++) {
        const quote = quotesWithEscapes[i];
        console.log(`[${i + 1}] Text: "${quote.text}"`);
        console.log(`    Author: "${quote.author}"`);
      }
    }

    // Clean up the database first
    console.log('\nClearing existing quotes...');
    await prisma.quote.deleteMany({});

    // Insert the quotes
    console.log('Inserting quotes...');
    for (const quote of quotes) {
      try {
        await prisma.quote.create({
          data: {
            text: quote.text,
            author: quote.author,
          },
        });
      } catch (error) {
        console.error(`Error inserting quote: "${quote.text.substring(0, 30)}..."`, error);
      }
    }

    console.log('Quotes migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateQuotes()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
