#!/usr/bin/env node

const fs = require('fs');
const quotes = JSON.parse(fs.readFileSync('quotes.json', 'utf8'));
const readings = JSON.parse(fs.readFileSync('readings.json', 'utf8'));

// Migrate quotes
quotes.forEach((quote) => {
  const filename = `content/quotes/${quote.id.toString().padStart(4, '0')}.md`;
  const content = `---
author: ${quote.author || 'Unknown'}
id: ${quote.id}
---

${quote.text}`;
  fs.writeFileSync(filename, content);
});
console.log(`✅ Created ${quotes.length} quote files`);

// Migrate readings  
readings.forEach((reading) => {
  const filename = `content/readings/${reading.slug}.md`;
  // Convert local image paths to CDN URLs
  const coverImage = reading.coverImageSrc 
    ? `https://book-covers.nyc3.digitaloceanspaces.com${reading.coverImageSrc}`
    : '';
  const content = `---
title: ${reading.title}
author: ${reading.author}
finished: ${reading.finishedDate || ''}
coverImage: ${coverImage}
dropped: ${reading.dropped || false}
---

${reading.thoughts || ''}`;
  fs.writeFileSync(filename, content);
});
console.log(`✅ Created ${readings.length} reading files`);