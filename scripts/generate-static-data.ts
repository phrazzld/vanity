#!/usr/bin/env tsx

/**
 * Generate static JSON files from markdown content at build time
 * This allows client components to import data directly without API calls
 *
 * Caching: Calculates hash of all markdown files and skips generation if unchanged
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import matter from 'gray-matter';
import {
  parseRereadSlug,
  buildRereadMap,
  computeReadCount,
  validateRereadSequences,
} from '../cli/lib/reading-reread.js';

// Generator version - increment when schema changes to invalidate cache
const GENERATOR_VERSION = '2';

// Ensure public/data directory exists
const dataDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Calculate hash of all markdown files in content/
function calculateContentHash() {
  const hash = crypto.createHash('sha256');

  // Hash generator version to invalidate cache when schema changes
  hash.update(`v${GENERATOR_VERSION}`);

  const contentDir = path.join(process.cwd(), 'content');

  // Get all .md files recursively
  function getAllMdFiles(dir: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...getAllMdFiles(fullPath));
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files.sort(); // Sort for consistent hashing
  }

  const mdFiles = getAllMdFiles(contentDir);

  // Hash each file's content
  for (const file of mdFiles) {
    const content = fs.readFileSync(file, 'utf8');
    hash.update(content);
  }

  return hash.digest('hex');
}

// Check if we can skip generation
function shouldSkipGeneration() {
  const hashFile = path.join(dataDir, '.content-hash');
  const quotesFile = path.join(dataDir, 'quotes.json');
  const readingsFile = path.join(dataDir, 'readings.json');

  // Skip if output files don't exist
  if (!fs.existsSync(quotesFile) || !fs.existsSync(readingsFile)) {
    return false;
  }

  // Calculate current hash
  const currentHash = calculateContentHash();

  // Compare with stored hash
  if (fs.existsSync(hashFile)) {
    const storedHash = fs.readFileSync(hashFile, 'utf8').trim();
    if (storedHash === currentHash) {
      console.log('✓ Content unchanged, skipping generation (cache hit)');
      return true;
    }
  }

  // Store new hash for next time
  fs.writeFileSync(hashFile, currentHash);
  return false;
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

  // Build reread map before processing files
  const rereadMap = buildRereadMap(files);
  validateRereadSequences(rereadMap);

  const readings = files.map((file, index) => {
    const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    const slug = file.replace('.md', '');

    // Compute reread metadata
    const readCount = computeReadCount(slug, rereadMap);
    const parsed = parseRereadSlug(slug);
    const baseSlug = parsed ? parsed.baseSlug : slug;

    return {
      id: index + 1, // Generate sequential IDs
      slug,
      title: data.title || 'Untitled',
      author: data.author || 'Unknown Author',
      finishedDate: data.finished || null,
      coverImageSrc: data.coverImage || null,
      audiobook: data.audiobook || false,
      favorite: data.favorite || false,
      readCount,
      baseSlug,
    };
  });

  // Sort by finished date (most recent first)
  const sortedReadings = readings.sort((a, b) => {
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

  // Log reread summary
  const rereadCount = sortedReadings.filter(r => r.readCount > 1).length;
  const uniqueBooks = new Set(sortedReadings.map(r => r.baseSlug)).size;
  console.log(`✓ Generated readings.json with ${sortedReadings.length} readings`);
  console.log(`✓ Detected ${rereadCount} rereads across ${uniqueBooks} unique books`);
  return sortedReadings.length;
}

// Main execution
console.log('Generating static data files...');

// Check cache before regenerating
if (shouldSkipGeneration()) {
  process.exit(0);
}

const quotesCount = generateQuotes();
const readingsCount = generateReadings();
console.log(`✅ Static data generation complete: ${quotesCount} quotes, ${readingsCount} readings`);
