#!/usr/bin/env node

const fs = require('fs');

const readings = JSON.parse(fs.readFileSync('readings.json', 'utf8'));
const baseUrl = 'https://book-covers.nyc3.digitaloceanspaces.com';

// Get unique image URLs
const imageUrls = [...new Set(readings
  .filter(r => r.coverImageSrc)
  .map(r => r.coverImageSrc))];

console.log(`Found ${imageUrls.length} unique images to download`);

// Skip download for now - we'll reference the CDN URLs directly
// This is the Carmack way - don't copy files unnecessarily

imageUrls.forEach(imagePath => {
  console.log(`Would download: ${baseUrl}${imagePath}`);
});

console.log('\nActually, let\'s just keep using the CDN URLs directly. No need to download.');
console.log('We\'ll update the markdown files to use full CDN URLs.');