#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const readingsDir = path.join(process.cwd(), 'content/readings');
const files = fs.readdirSync(readingsDir);

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(readingsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix malformed URLs where CDN URL was prepended to already complete URLs
  const malformedPattern = /coverImage: https:\/\/book-covers\.nyc3\.digitaloceanspaces\.com(https:\/\/.*)/g;
  
  if (malformedPattern.test(content)) {
    content = content.replace(malformedPattern, (match, actualUrl) => {
      console.log(`Fixing ${file}: ${actualUrl}`);
      fixedCount++;
      return `coverImage: ${actualUrl}`;
    });
    
    fs.writeFileSync(filePath, content);
  }
});

console.log(`✅ Fixed ${fixedCount} malformed image URLs`);