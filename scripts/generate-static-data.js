#!/usr/bin/env node

/**
 * Generate static JSON files from markdown content at build time
 * This allows client components to import data directly without API calls
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Ensure public/data directory exists
const dataDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate quotes.json
function generateQuotes() {
  const dir = path.join(process.cwd(), 'content/quotes');
  const files = fs.readdirSync(dir);
  const quotes = files.map(file => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    return {
      id: data.id,
      author: data.author,
      text: content.trim(),
    };
  });

  fs.writeFileSync(path.join(dataDir, 'quotes.json'), JSON.stringify(quotes, null, 2));

  console.log(`✓ Generated quotes.json with ${quotes.length} quotes`);
  return quotes.length;
}

// Generate readings.json
function generateReadings() {
  const dir = path.join(process.cwd(), 'content/readings');
  const files = fs.readdirSync(dir);
  const readings = files.map((file, index) => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    return {
      id: index + 1, // Generate sequential IDs
      slug: file.replace('.md', ''),
      title: data.title || 'Untitled',
      author: data.author || 'Unknown Author',
      finishedDate: data.finished || null,
      coverImageSrc: data.coverImage || null,
      thoughts: content.trim(),
      dropped: data.dropped || false,
    };
  });

  // Filter out dropped readings
  const activeReadings = readings.filter(r => !r.dropped);

  // Sort by finished date (most recent first)
  const sortedReadings = activeReadings.sort((a, b) => {
    if (!a.finishedDate && !b.finishedDate) return 0;
    if (!a.finishedDate) return 1;
    if (!b.finishedDate) return -1;
    return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
  });

  const readingsData = {
    data: sortedReadings,
    totalCount: sortedReadings.length,
    hasMore: false,
  };

  fs.writeFileSync(path.join(dataDir, 'readings.json'), JSON.stringify(readingsData, null, 2));

  console.log(`✓ Generated readings.json with ${sortedReadings.length} readings`);
  return sortedReadings.length;
}

// Main execution
console.log('Generating static data files...');
const quotesCount = generateQuotes();
const readingsCount = generateReadings();
console.log(`✅ Static data generation complete: ${quotesCount} quotes, ${readingsCount} readings`);
