// Extract data from source files and output as CSV for easier import
const fs = require('fs');
const path = require('path');

// Paths to data files
const readingsPath = path.join(__dirname, '../src/app/readings/data.ts');
const quotesPath = path.join(__dirname, '../src/app/quotes.ts');

// Read files as text
console.log('Reading source files...');
const readingsContent = fs.readFileSync(readingsPath, 'utf8');
const quotesContent = fs.readFileSync(quotesPath, 'utf8');

// Function to find all indices of a substring in a string
function findAllIndices(str, substring) {
  const indices = [];
  let startIndex = 0;
  let index;

  while ((index = str.indexOf(substring, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + substring.length;
  }

  return indices;
}

// Extract all objects from a string between the specified start and end markers
function extractObjectsFromString(content, startMarker, _endMarker) {
  const startIndices = findAllIndices(content, startMarker);
  const objects = [];

  for (const startIndex of startIndices) {
    // Find the closing bracket that matches the opening bracket
    let openBrackets = 1;
    let endIndex = startIndex + startMarker.length;

    while (openBrackets > 0 && endIndex < content.length) {
      if (content[endIndex] === '{') {
        openBrackets++;
      } else if (content[endIndex] === '}') {
        openBrackets--;
      }
      endIndex++;
    }

    if (openBrackets === 0) {
      // We found a complete object
      const objectText = content.substring(startIndex + startMarker.length - 1, endIndex);
      objects.push(objectText);
    }
  }

  return objects;
}

// Extract and process readings
const readingObjects = extractObjectsFromString(readingsContent, '{', '}');
console.log(`Found ${readingObjects.length} potential reading objects`);

// Extract and process quotes
const quoteObjects = extractObjectsFromString(quotesContent, '{', '}');
console.log(`Found ${quoteObjects.length} potential quote objects`);

// Output first 5 objects of each type for inspection
console.log('\nSample Reading Objects:');
readingObjects.slice(0, 5).forEach((obj, i) => {
  console.log(`\nReading ${i + 1}:`);
  console.log(obj);
});

console.log('\nSample Quote Objects:');
quoteObjects.slice(0, 5).forEach((obj, i) => {
  console.log(`\nQuote ${i + 1}:`);
  console.log(obj);
});
