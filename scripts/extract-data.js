// Simpler approach to extract and validate data before migration
const fs = require('fs');
const path = require('path');

// Path to data files
const readingsPath = path.join(__dirname, '../src/app/readings/data.ts');
const quotesPath = path.join(__dirname, '../src/app/quotes.ts');

// Read files as text
const readingsContent = fs.readFileSync(readingsPath, 'utf8');
const quotesContent = fs.readFileSync(quotesPath, 'utf8');

// Extract array variable names from the readings file
const readingsVariables = readingsContent.match(/const ([A-Z_]+): Reading\[\]/g);
if (readingsVariables) {
  console.log('Reading arrays found:');
  readingsVariables.forEach(varName => {
    console.log('  -', varName);
  });
}

// Look for READINGS
const mainReadingsMatch = readingsContent.match(/export const READINGS/);
if (mainReadingsMatch) {
  console.log('Found main READINGS export');
}

// Look for QUOTES
const quotesMatch = quotesContent.match(/export const QUOTES/);
if (quotesMatch) {
  console.log('Found QUOTES export');
}

// Extract sample of data
console.log('\nSample of readings content:');
console.log(readingsContent.substring(0, 500));

console.log('\nSample of quotes content:');
console.log(quotesContent.substring(0, 500));
