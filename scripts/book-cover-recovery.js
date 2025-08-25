#!/usr/bin/env node

/**
 * Simple Book Cover Recovery
 *
 * Finds books with broken cover URLs and tries to fix them:
 * 1. Find books with broken DigitalOcean URLs
 * 2. Get ISBN from Google Books
 * 3. Get cover from OpenLibrary
 * 4. Update markdown file if successful
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { promisify } = require('util');

const sleep = promisify(setTimeout);

// Constants
const READINGS_DIR = path.join(process.cwd(), 'content/readings');
const BROKEN_URL_PATTERN = /book-covers\.nyc3\.digitaloceanspaces\.com/;
const BACKUP_DIR = path.join(process.cwd(), 'archive/cover-recovery-backup');
const CACHE_FILE = path.join(process.cwd(), 'logs/google-books-cache.json');

// API Configuration
const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const OPENLIBRARY_BASE_URL = 'https://covers.openlibrary.org/b/isbn';
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY || '';

/**
 * Find all books with broken cover URLs
 */
function findBrokenCovers() {
  const files = fs.readdirSync(READINGS_DIR).filter(file => file.endsWith('.md'));
  const brokenBooks = [];

  for (const file of files) {
    const filePath = path.join(READINGS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);

    if (data.title && data.author && data.coverImage && BROKEN_URL_PATTERN.test(data.coverImage)) {
      brokenBooks.push({
        slug: file.replace('.md', ''),
        title: data.title,
        author: data.author,
        filePath,
        currentCoverUrl: data.coverImage,
      });
    }
  }

  return brokenBooks;
}

/**
 * Load/save simple cache for API calls
 */
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (error) {
    // Ignore cache errors
  }
  return {};
}

function saveCache(cache) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    // Ignore cache errors
  }
}

/**
 * Try to get ISBN from Google Books
 */
async function getISBN(title, author, cache) {
  // Ensure title and author are strings
  const safeTitle = (title || '').toString().toLowerCase();
  const safeAuthor = (author || '').toString().toLowerCase();
  const cacheKey = `${safeTitle}:${safeAuthor}`;

  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const query = `intitle:"${safeTitle}"+inauthor:"${safeAuthor}"`;
  const url = `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=5${API_KEY ? `&key=${API_KEY}` : ''}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited, wait and retry once
        await sleep(2000);
        const retryResponse = await fetch(url);
        if (!retryResponse.ok) throw new Error('Rate limited');
        const retryData = await retryResponse.json();
        const isbn = extractISBN(retryData);
        cache[cacheKey] = isbn;
        return isbn;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const isbn = extractISBN(data);
    cache[cacheKey] = isbn;

    // Be respectful to the API
    await sleep(100);

    return isbn;
  } catch (error) {
    cache[cacheKey] = null;
    return null;
  }
}

/**
 * Extract ISBN from Google Books response, trying to avoid study guides and summaries
 */
function extractISBN(data) {
  if (!data.items || data.items.length === 0) return null;

  // Try to find the best match (avoid study guides, summaries, etc.)
  const books = data.items.filter(item => {
    const title = (item.volumeInfo?.title || '').toLowerCase();
    const authors = (item.volumeInfo?.authors || []).join(' ').toLowerCase();

    // Skip obvious study guides and summaries
    const skipPatterns = ['summary', 'study guide', 'sparknotes', 'cliffsnotes', 'analysis'];
    return !skipPatterns.some(pattern => title.includes(pattern));
  });

  // Use first filtered result, or fall back to first overall result
  const book = books.length > 0 ? books[0] : data.items[0];
  const identifiers = book.volumeInfo?.industryIdentifiers || [];

  // Prefer ISBN-13 over ISBN-10
  for (const id of identifiers) {
    if (id.type === 'ISBN_13') return id.identifier;
  }
  for (const id of identifiers) {
    if (id.type === 'ISBN_10') return id.identifier;
  }

  return null;
}

/**
 * Try to get cover from OpenLibrary
 */
async function getCover(isbn) {
  const sizes = ['L', 'M', 'S'];

  for (const size of sizes) {
    const url = `${OPENLIBRARY_BASE_URL}/${isbn}-${size}.jpg`;

    try {
      const response = await fetch(url, { method: 'HEAD' });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const contentLength = parseInt(response.headers.get('content-length') || '0', 10);

        // Valid image should have reasonable size and image content type
        if (contentType.startsWith('image/') && contentLength > 1000) {
          return url;
        }
      }

      // Small delay between requests
      await sleep(200);
    } catch (error) {
      // Try next size
    }
  }

  return null;
}

/**
 * Update markdown file with new cover URL
 */
function updateCoverImage(book, newCoverUrl) {
  const backupDir = path.join(BACKUP_DIR, new Date().toISOString().split('T')[0]);

  try {
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup original file
    const backupPath = path.join(backupDir, path.basename(book.filePath));
    fs.copyFileSync(book.filePath, backupPath);

    // Read and update file
    const content = fs.readFileSync(book.filePath, 'utf8');
    const { data: frontmatter, content: markdownContent } = matter(content);

    frontmatter.coverImage = newCoverUrl;
    const updatedContent = matter.stringify(markdownContent, frontmatter);

    // Write to temp file, then rename (atomic operation)
    const tempPath = `${book.filePath}.tmp`;
    fs.writeFileSync(tempPath, updatedContent, 'utf8');
    fs.renameSync(tempPath, book.filePath);

    return true;
  } catch (error) {
    console.error(`Failed to update ${book.slug}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Finding books with broken covers...');

  const brokenBooks = findBrokenCovers();
  if (brokenBooks.length === 0) {
    console.log('✅ No broken covers found!');
    return;
  }

  console.log(`📚 Found ${brokenBooks.length} books needing covers`);
  console.log('🔄 Processing...\n');

  const cache = loadCache();
  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < brokenBooks.length; i++) {
    const book = brokenBooks[i];
    const progress = `[${i + 1}/${brokenBooks.length}]`;

    process.stdout.write(`${progress} "${book.title}" by ${book.author} ... `);

    // Try to get ISBN
    const isbn = await getISBN(book.title, book.author, cache);
    if (!isbn) {
      console.log('❌ No ISBN found');
      failed++;
      continue;
    }

    // Try to get cover
    const coverUrl = await getCover(isbn);
    if (!coverUrl) {
      console.log('❌ No cover available');
      failed++;
      continue;
    }

    // Update file
    const success = updateCoverImage(book, coverUrl);
    if (success) {
      console.log('✅ Fixed!');
      fixed++;
    } else {
      console.log('❌ Update failed');
      failed++;
    }
  }

  // Save cache and show results
  saveCache(cache);

  console.log(`\n📊 Results: ${fixed} fixed, ${failed} failed`);
  if (fixed > 0) {
    const backupDate = new Date().toISOString().split('T')[0];
    console.log(`📁 Backups saved to: archive/cover-recovery-backup/${backupDate}`);
  }

  if (failed > 0) {
    console.log(`\n💡 ${failed} books still need manual cover hunting`);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  findBrokenCovers,
  getISBN,
  getCover,
  updateCoverImage,
};
