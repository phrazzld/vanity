// This script migrates all the real data from the source files to the database
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const prisma = new PrismaClient();

async function migrateRealData() {
  try {
    console.log('Starting data migration...');
    
    // Read data files
    const readingsFilePath = path.join(__dirname, '../src/app/readings/data.ts');
    const quotesFilePath = path.join(__dirname, '../src/app/quotes.ts');
    
    console.log(`Reading data from ${readingsFilePath} and ${quotesFilePath}`);
    
    const readingsContent = fs.readFileSync(readingsFilePath, 'utf8');
    const quotesContent = fs.readFileSync(quotesFilePath, 'utf8');
    
    // Extract READINGS and QUOTES arrays
    
    // For readings, we need to find all the arrays and concatenate them
    let readingsArrays = [];
    
    // Extract all the READINGS_* arrays
    const readingsCurrentlyMatch = readingsContent.match(/const READINGS_CURRENTLY: Reading\[\] = (\[[\s\S]*?\]);/);
    if (readingsCurrentlyMatch && readingsCurrentlyMatch[1]) {
      readingsArrays.push(readingsCurrentlyMatch[1]);
    }
    
    const readings2025Match = readingsContent.match(/const READINGS_2025: Reading\[\] = (\[[\s\S]*?\]);/);
    if (readings2025Match && readings2025Match[1]) {
      readingsArrays.push(readings2025Match[1]);
    }
    
    const readings2024Match = readingsContent.match(/const READINGS_2024: Reading\[\] = (\[[\s\S]*?\]);/);
    if (readings2024Match && readings2024Match[1]) {
      readingsArrays.push(readings2024Match[1]);
    }
    
    const readings2023Match = readingsContent.match(/const READINGS_2023: Reading\[\] = (\[[\s\S]*?\]);/);
    if (readings2023Match && readings2023Match[1]) {
      readingsArrays.push(readings2023Match[1]);
    }
    
    const readings2022Match = readingsContent.match(/const READINGS_2022: Reading\[\] = (\[[\s\S]*?\]);/);
    if (readings2022Match && readings2022Match[1]) {
      readingsArrays.push(readings2022Match[1]);
    }
    
    const readings2021Match = readingsContent.match(/const READINGS_2021: Reading\[\] = (\[[\s\S]*?\]);/);
    if (readings2021Match && readings2021Match[1]) {
      readingsArrays.push(readings2021Match[1]);
    }
    
    const readings2020Match = readingsContent.match(/const READINGS_2020: Reading\[\] = (\[[\s\S]*?\]);/);
    if (readings2020Match && readings2020Match[1]) {
      readingsArrays.push(readings2020Match[1]);
    }
    
    const readingsDroppedMatch = readingsContent.match(/const READINGS_DROPPED: Reading\[\] = (\[[\s\S]*?\]);/);
    if (readingsDroppedMatch && readingsDroppedMatch[1]) {
      readingsArrays.push(readingsDroppedMatch[1]);
    }
    
    // Also try to get the main READINGS array
    const readingsMatch = readingsContent.match(/export const READINGS: Reading\[\] = (\[[\s\S]*\]);/);
    if (readingsMatch && readingsMatch[1]) {
      readingsArrays.push(readingsMatch[1]);
    }
    
    console.log(`Found ${readingsArrays.length} reading arrays`);
    
    // Extract QUOTES array
    const quotesMatch = quotesContent.match(/export const QUOTES = (\[[\s\S]*\]);/);
    let quotesArray = null;
    if (quotesMatch && quotesMatch[1]) {
      quotesArray = quotesMatch[1];
    }
    
    // Function to parse a JavaScript array string into an actual array
    function parseArrayString(arrayString) {
      // Replace Date objects with ISO strings
      const isoDateReplacedString = arrayString.replace(/new Date\(['"](.*?)['"]\)/g, (match, dateStr) => {
        return `"${new Date(dateStr).toISOString()}"`;
      });
      
      // Create a safe context to evaluate the string
      const context = {};
      const script = `(${isoDateReplacedString})`;
      try {
        return JSON.parse(vm.runInNewContext(script, context));
      } catch (error) {
        console.error(`Error parsing array string: ${error.message}`);
        console.error(`Problematic string: ${arrayString.slice(0, 200)}...`);
        return [];
      }
    }
    
    // Parse all arrays into objects
    const parsedReadingsArrays = readingsArrays.map(arr => {
      try {
        return parseArrayString(arr);
      } catch (error) {
        console.error(`Error parsing readings array: ${error.message}`);
        return [];
      }
    });
    
    // Combine all readings
    const allReadings = parsedReadingsArrays.flat();
    
    console.log(`Successfully parsed ${allReadings.length} readings`);
    
    // Parse quotes
    let allQuotes = [];
    if (quotesArray) {
      try {
        allQuotes = parseArrayString(quotesArray);
        console.log(`Successfully parsed ${allQuotes.length} quotes`);
      } catch (error) {
        console.error(`Error parsing quotes array: ${error.message}`);
      }
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.quote.deleteMany();
    await prisma.reading.deleteMany();
    
    // Migrate readings
    if (allReadings.length > 0) {
      console.log(`Migrating ${allReadings.length} readings...`);
      
      let successCount = 0;
      
      for (const reading of allReadings) {
        try {
          // Convert ISO date strings back to Date objects
          const finishedDate = reading.finishedDate ? new Date(reading.finishedDate) : null;
          
          await prisma.reading.create({
            data: {
              slug: reading.slug,
              title: reading.title,
              author: reading.author,
              finishedDate: finishedDate,
              coverImageSrc: reading.coverImageSrc,
              thoughts: reading.thoughts || '',
              dropped: reading.dropped || false,
            },
          });
          
          successCount++;
        } catch (error) {
          console.error(`Error migrating reading ${reading.slug}:`, error);
        }
      }
      
      console.log(`Successfully migrated ${successCount} readings`);
    }
    
    // Migrate quotes
    if (allQuotes.length > 0) {
      console.log(`Migrating ${allQuotes.length} quotes...`);
      
      let successCount = 0;
      
      for (const quote of allQuotes) {
        try {
          await prisma.quote.create({
            data: {
              text: quote.text,
              author: quote.author || null,
            },
          });
          
          successCount++;
        } catch (error) {
          console.error(`Error migrating quote:`, error);
        }
      }
      
      console.log(`Successfully migrated ${successCount} quotes`);
    }
    
    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateRealData();