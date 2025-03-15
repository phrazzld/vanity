// CommonJS migration script
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper function to extract array data from TypeScript files
function extractArrayFromFile(filePath, arrayName) {
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    console.log('Migration has likely already been completed.');
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Special case for the READINGS array which is at the end of the file
  if (arrayName === 'READINGS') {
    console.log('Attempting to parse READINGS from:', filePath);
    
    // Extract all objects between curly braces that have slug, title, and author properties
    const allReadings = [];
    const objPattern = /{[\s\S]*?slug:[\s\S]*?title:[\s\S]*?author:[\s\S]*?}/g;
    const matches = content.match(objPattern) || [];
    
    console.log(`Found ${matches.length} raw reading objects`);
    
    for (const objText of matches) {
      try {
        // Extract properties from the object text
        const slugMatch = objText.match(/slug:\s*['"]([^'"]*)['"]/);
        const titleMatch = objText.match(/title:\s*['"]([^'"]*)['"]/);
        const authorMatch = objText.match(/author:\s*['"]([^'"]*)['"]/);
        const finishedDateMatch = objText.match(/finishedDate:\s*(?:new Date\(['"]([^'"]*)['"]\)|null)/);
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
            dropped: droppedMatch ? droppedMatch[1] === 'true' : false
          };
          
          allReadings.push(reading);
        }
      } catch (error) {
        console.error('Error parsing reading object:', error);
      }
    }
    
    console.log(`Successfully parsed ${allReadings.length} readings`);
    return allReadings;
  }
  
  // Special handling for QUOTES array
  console.log('Attempting to parse QUOTES from:', filePath);
  const startMatch = content.match(/export\s+const\s+QUOTES\s*=\s*\[/);
  
  if (!startMatch) {
    console.log(`No QUOTES array found in ${filePath}`);
    return [];
  }
  
  try {
    // Extract the whole array content
    const arrayStartIndex = startMatch.index + startMatch[0].length;
    const arrayEndMatch = content.substring(arrayStartIndex).match(/\];/);
    
    if (!arrayEndMatch) {
      console.log('Could not find end of QUOTES array');
      return [];
    }
    
    const arrayContent = content.substring(
      arrayStartIndex, 
      arrayStartIndex + arrayEndMatch.index
    );
    
    console.log('Successfully extracted quotes array content, length:', arrayContent.length);
    
    // Process array content using a more sophisticated approach
    const quotes = [];
    let currentQuote = null;
    let inQuoteObject = false;
    let textCapturing = false;
    let authorCapturing = false;
    let textBuffer = '';
    let authorBuffer = '';
    
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
        textCapturing = false;
        authorCapturing = false;
        textBuffer = '';
        authorBuffer = '';
        continue;
      }
      
      // Inside a quote object
      if (inQuoteObject) {
        // Text property
        if (trimmedLine.startsWith('text:')) {
          textCapturing = true;
          authorCapturing = false;
          // Extract text value, handling multi-line
          const textMatch = trimmedLine.match(/text:\s*"(.*)$/);
          if (textMatch) {
            textBuffer = textMatch[1];
            // If the line ends with a quote, we're done
            if (textBuffer.endsWith('"') && !textBuffer.endsWith('\\"')) {
              textBuffer = textBuffer.slice(0, -1);
              currentQuote.text = textBuffer;
              textCapturing = false;
            }
          }
          continue;
        }
        
        // Author property
        if (trimmedLine.startsWith('author:')) {
          textCapturing = false;
          authorCapturing = true;
          // Extract author value, handling multi-line
          const authorMatch = trimmedLine.match(/author:\s*"(.*)$/);
          if (authorMatch) {
            authorBuffer = authorMatch[1];
            // If the line ends with a quote, we're done
            if (authorBuffer.endsWith('"') && !authorBuffer.endsWith('\\"')) {
              authorBuffer = authorBuffer.slice(0, -1);
              currentQuote.author = authorBuffer;
              authorCapturing = false;
            }
          } else if (trimmedLine === 'author: null,') {
            currentQuote.author = null;
            authorCapturing = false;
          }
          continue;
        }
        
        // Continue capturing multi-line text
        if (textCapturing) {
          textBuffer += ' ' + trimmedLine;
          // Check if this line completes the text
          if (trimmedLine.endsWith('"') && !trimmedLine.endsWith('\\"')) {
            textBuffer = textBuffer.slice(0, -1);
            currentQuote.text = textBuffer;
            textCapturing = false;
          }
          continue;
        }
        
        // Continue capturing multi-line author
        if (authorCapturing) {
          authorBuffer += ' ' + trimmedLine;
          // Check if this line completes the author
          if (trimmedLine.endsWith('"') && !trimmedLine.endsWith('\\"')) {
            authorBuffer = authorBuffer.slice(0, -1);
            currentQuote.author = authorBuffer;
            authorCapturing = false;
          }
          continue;
        }
      }
    }
    
    // Clean up any escape sequences in the quotes
    quotes.forEach(quote => {
      if (quote.text) {
        quote.text = quote.text
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\n/g, '\n')
          .replace(/\\\\/g, '\\');
      }
      if (quote.author) {
        quote.author = quote.author
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\n/g, '\n')
          .replace(/\\\\/g, '\\');
      }
    });
    
    // Log some sample quotes for debugging
    if (quotes.length > 0) {
      console.log('Sample quotes:');
      for (let i = 0; i < Math.min(3, quotes.length); i++) {
        console.log(`Quote ${i+1}: "${quotes[i].text.substring(0, 40)}..." by "${quotes[i].author}"`);
      }
    }
    
    console.log(`Found ${quotes.length} quotes in the file`);
    return quotes;
  } catch (error) {
    console.error('Error parsing QUOTES array:', error);
    return [];
  }
}

async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Get file paths
    const readingsPath = path.join(__dirname, '../src/app/readings/data.ts');
    const quotesPath = path.join(__dirname, '../src/app/quotes.ts');
    
    // Extract data
    console.log('Extracting data from source files...');
    const readings = extractArrayFromFile(readingsPath, 'READINGS');
    const quotes = extractArrayFromFile(quotesPath, 'QUOTES');
    
    console.log(`Found ${readings.length} readings and ${quotes.length} quotes`);

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.quote.deleteMany({});
    await prisma.reading.deleteMany({});
    
    // Insert readings
    console.log(`Migrating ${readings.length} readings...`);
    for (const reading of readings) {
      try {
        await prisma.reading.create({
          data: {
            slug: reading.slug,
            title: reading.title,
            author: reading.author,
            finishedDate: reading.finishedDate ? new Date(reading.finishedDate) : null,
            coverImageSrc: reading.coverImageSrc || null,
            thoughts: reading.thoughts || '',
            dropped: reading.dropped || false,
          },
        });
      } catch (error) {
        console.error(`Error creating reading: ${reading.slug}`, error);
      }
    }

    // Insert quotes
    console.log(`Migrating ${quotes.length} quotes...`);
    for (const quote of quotes) {
      try {
        await prisma.quote.create({
          data: {
            text: quote.text,
            author: quote.author || null,
          },
        });
      } catch (error) {
        console.error(`Error creating quote: "${quote.text.substring(0, 30)}..."`, error);
      }
    }

    console.log('Data migration completed successfully.');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute when this file is run directly
migrateData()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });