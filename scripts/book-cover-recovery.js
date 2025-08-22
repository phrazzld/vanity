#!/usr/bin/env node

/**
 * Book Cover Recovery System - Task 21: Metadata Extraction & Validation
 *
 * This script parses all reading markdown files to:
 * 1. Extract book metadata (title, author, cover URL)
 * 2. Identify broken DigitalOcean Spaces URLs
 * 3. Generate a detailed report of books needing cover recovery
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Constants
const READINGS_DIR = path.join(process.cwd(), 'content/readings');
const BROKEN_URL_PATTERN = /book-covers\.nyc3\.digitaloceanspaces\.com/;
const REPORT_DIR = path.join(process.cwd(), 'logs');
const REPORT_FILE = path.join(REPORT_DIR, 'book-cover-report.json');

/**
 * Extract metadata from all reading markdown files
 * @returns {Array} Array of book metadata objects
 */
function extractBookMetadata() {
  // Check if readings directory exists
  if (!fs.existsSync(READINGS_DIR)) {
    console.error('❌ Readings directory not found:', READINGS_DIR);
    process.exit(1);
  }

  // Get all markdown files
  const files = fs.readdirSync(READINGS_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.warn('⚠️  No markdown files found in readings directory');
    return [];
  }

  console.log(`📚 Found ${files.length} reading files to process...`);

  // Parse each file and extract metadata
  const metadata = files.map((file, index) => {
    const filePath = path.join(READINGS_DIR, file);
    const slug = file.replace('.md', '');

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);

      // Validate required fields
      const isValid = !!(data.title && data.author);

      // Check if cover URL is broken (DigitalOcean Spaces)
      const isBroken = data.coverImage ? BROKEN_URL_PATTERN.test(data.coverImage) : false;

      return {
        id: index + 1,
        slug,
        filePath,
        title: data.title || 'Untitled',
        author: data.author || 'Unknown Author',
        currentCoverUrl: data.coverImage || null,
        isBroken,
        hasCover: !!data.coverImage,
        isValid,
        audiobook: data.audiobook || false,
        finished: data.finished || null,
        // Additional metadata for error handling
        errors: []
          .concat(!data.title ? ['Missing title'] : [])
          .concat(!data.author ? ['Missing author'] : []),
      };
    } catch (error) {
      console.error(`❌ Error parsing ${file}:`, error.message);
      return {
        id: index + 1,
        slug,
        filePath,
        title: 'Error',
        author: 'Error',
        currentCoverUrl: null,
        isBroken: false,
        hasCover: false,
        isValid: false,
        errors: [`Parse error: ${error.message}`],
      };
    }
  });

  return metadata;
}

/**
 * Generate detailed report of book metadata and broken covers
 * @param {Array} metadata - Array of book metadata objects
 * @returns {Object} Report object with statistics and details
 */
function generateReport(metadata) {
  const brokenCovers = metadata.filter(book => book.isBroken);
  const missingCovers = metadata.filter(book => !book.hasCover);
  const validBooks = metadata.filter(book => book.isValid);
  const invalidBooks = metadata.filter(book => !book.isValid);

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: metadata.length,
      valid: validBooks.length,
      invalid: invalidBooks.length,
      withCovers: metadata.filter(book => book.hasCover).length,
      withoutCovers: missingCovers.length,
      brokenCovers: brokenCovers.length,
      digitalOceanUrls: brokenCovers.length,
      needsRecovery: brokenCovers.length + missingCovers.length,
    },
    brokenCovers: brokenCovers.map(book => ({
      slug: book.slug,
      title: book.title,
      author: book.author,
      currentUrl: book.currentCoverUrl,
      audiobook: book.audiobook,
    })),
    missingCovers: missingCovers.map(book => ({
      slug: book.slug,
      title: book.title,
      author: book.author,
      audiobook: book.audiobook,
    })),
    invalidBooks: invalidBooks.map(book => ({
      slug: book.slug,
      errors: book.errors,
      filePath: book.filePath,
    })),
    allBooks: metadata.map(book => ({
      slug: book.slug,
      title: book.title,
      author: book.author,
      coverStatus: book.isBroken ? 'broken' : book.hasCover ? 'ok' : 'missing',
      audiobook: book.audiobook,
    })),
  };

  return report;
}

/**
 * Save report to JSON file
 * @param {Object} report - Report object to save
 */
function saveReport(report) {
  // Ensure logs directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  // Save JSON report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`✅ Report saved to: ${REPORT_FILE}`);
}

/**
 * Display report summary in console
 * @param {Object} report - Report object to display
 */
function displaySummary(report) {
  console.log('\n📊 Book Cover Recovery Report');
  console.log('─'.repeat(50));

  console.log(`Total books: ${report.summary.total}`);
  console.log(`✓ Valid books: ${report.summary.valid}`);

  if (report.summary.invalid > 0) {
    console.log(`✗ Invalid books: ${report.summary.invalid}`);
  }

  console.log(`📖 Books with covers: ${report.summary.withCovers}`);
  console.log(`📖 Books without covers: ${report.summary.withoutCovers}`);

  console.log(`\n🔥 Broken DigitalOcean URLs: ${report.summary.brokenCovers}`);
  console.log(`⚠️  Total needing recovery: ${report.summary.needsRecovery}`);

  // List first 5 broken covers as examples
  if (report.brokenCovers.length > 0) {
    console.log('\n📚 Sample books with broken covers:');
    report.brokenCovers.slice(0, 5).forEach(book => {
      console.log(`  - ${book.title} by ${book.author}`);
    });

    if (report.brokenCovers.length > 5) {
      console.log(`  ... and ${report.brokenCovers.length - 5} more`);
    }
  }

  // List invalid books if any
  if (report.invalidBooks.length > 0) {
    console.log('\n⚠️  Invalid books (missing metadata)::');
    report.invalidBooks.forEach(book => {
      console.log(`  - ${book.slug}: ${book.errors.join(', ')}`);
    });
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Book Cover Recovery System - Metadata Extraction\n');

  try {
    // Step 1: Extract metadata from all reading files
    const metadata = extractBookMetadata();

    if (metadata.length === 0) {
      console.log('No books found to process.');
      return;
    }

    // Step 2: Generate detailed report
    const report = generateReport(metadata);

    // Step 3: Save report to file
    saveReport(report);

    // Step 4: Display summary
    displaySummary(report);

    console.log('\n✅ Metadata extraction complete!');
    console.log(`Check ${REPORT_FILE} for full details`);

    // Exit with appropriate code
    process.exit(report.summary.brokenCovers > 0 ? 0 : 0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing or use in other scripts
module.exports = {
  extractBookMetadata,
  generateReport,
  saveReport,
  displaySummary,
};
