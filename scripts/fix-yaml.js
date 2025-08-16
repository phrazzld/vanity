#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const quotesDir = path.join(process.cwd(), 'content/quotes');
const files = fs.readdirSync(quotesDir);

files.forEach(file => {
  const filePath = path.join(quotesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix author fields that contain colons or quotes
  content = content.replace(/^author: (.+)$/m, (match, author) => {
    // If the author contains a colon or quote and isn't already quoted
    if ((author.includes(':') || author.includes('"')) && !author.startsWith("'") && !author.startsWith('"')) {
      return `author: '${author.replace(/'/g, "''")}'`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content);
});

console.log('Fixed YAML in all quote files');