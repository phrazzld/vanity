/**
 * Reading Cover Management Module
 *
 * Provides dedicated commands for managing book cover images
 * with multiple source integrations and smart resolution.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import matter from 'gray-matter';
import inquirer from 'inquirer';
// import sharp from 'sharp'; // Will be used for local image processing in future

const READINGS_DIR = join(process.cwd(), 'content', 'readings');
// const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'readings'); // For future local image processing
const BACKUP_DIR = join(process.cwd(), 'archive', 'cover-recovery-backup');
const CACHE_FILE = join(process.cwd(), 'logs', 'book-cover-cache.json');

// API Configuration
const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const OPENLIBRARY_BASE_URL = 'https://covers.openlibrary.org/b/isbn';

interface BookCover {
  url: string;
  source: 'google' | 'openlibrary' | 'local' | 'url';
  confidence: number;
}

interface CoverCache {
  [key: string]: {
    isbn?: string | null;
    covers?: BookCover[];
    timestamp: number;
  };
}

/**
 * Load the cover cache
 */
function loadCache(): CoverCache {
  try {
    if (existsSync(CACHE_FILE)) {
      return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn(chalk.yellow('⚠️  Could not load cache'));
  }
  return {};
}

/**
 * Save the cover cache
 */
function saveCache(cache: CoverCache): void {
  try {
    const dir = join(process.cwd(), 'logs');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.warn(chalk.yellow('⚠️  Could not save cache'));
  }
}

/**
 * Get ISBN from Google Books API
 */
async function getISBNFromGoogleBooks(title: string, author: string): Promise<string | null> {
  const query = `intitle:"${title}"+inauthor:"${author}"`;
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
  const url = `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=5${apiKey ? `&key=${apiKey}` : ''}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        console.log(chalk.yellow('⚠️  Rate limited by Google Books API'));
      }
      return null;
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return null;
    }

    // Try to find the best match
    const book = data.items[0];
    const identifiers = book.volumeInfo?.industryIdentifiers || [];

    // Prefer ISBN-13 over ISBN-10
    for (const id of identifiers) {
      if (id.type === 'ISBN_13') return id.identifier;
    }
    for (const id of identifiers) {
      if (id.type === 'ISBN_10') return id.identifier;
    }

    return null;
  } catch (error) {
    console.error(chalk.red('✖ Error fetching from Google Books:'), error);
    return null;
  }
}

/**
 * Get cover from OpenLibrary
 */
async function getCoverFromOpenLibrary(isbn: string): Promise<string | null> {
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
    } catch (error) {
      // Try next size
    }
  }

  return null;
}

/**
 * Search for book covers from multiple sources
 */
export async function searchCovers(title: string, author: string): Promise<BookCover[]> {
  const covers: BookCover[] = [];
  const cache = loadCache();
  const cacheKey = `${title.toLowerCase()}:${author.toLowerCase()}`;

  // Check cache first (1 week expiry)
  const cached = cache[cacheKey];
  if (cached && cached.covers && Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
    console.log(chalk.gray('Using cached results'));
    return cached.covers;
  }

  console.log(chalk.cyan('🔍 Searching for book covers...'));

  // Try to get ISBN from Google Books
  const isbn = await getISBNFromGoogleBooks(title, author);
  if (isbn) {
    console.log(chalk.gray(`Found ISBN: ${isbn}`));

    // Try OpenLibrary with ISBN
    const openLibraryCover = await getCoverFromOpenLibrary(isbn);
    if (openLibraryCover) {
      covers.push({
        url: openLibraryCover,
        source: 'openlibrary',
        confidence: 0.9,
      });
    }
  }

  // Cache results
  cache[cacheKey] = {
    isbn,
    covers,
    timestamp: Date.now(),
  };
  saveCache(cache);

  return covers;
}

/**
 * Interactive cover search and selection
 */
export async function interactiveCoverSearch(slug: string): Promise<void> {
  const filePath = join(READINGS_DIR, `${slug}.md`);

  if (!existsSync(filePath)) {
    console.error(chalk.red(`✖ Reading not found: ${slug}`));
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  const { data: frontmatter, content: markdownContent } = matter(content);

  console.log(chalk.cyan(`\n📚 ${frontmatter.title} by ${frontmatter.author}`));

  if (frontmatter.coverImage) {
    console.log(chalk.gray(`Current cover: ${frontmatter.coverImage}`));
  }

  const covers = await searchCovers(frontmatter.title, frontmatter.author);

  if (covers.length === 0) {
    console.log(chalk.yellow('⚠️  No covers found automatically'));

    const { imageChoice } = await inquirer.prompt<{ imageChoice: string }>([
      {
        type: 'list',
        name: 'imageChoice',
        message: 'How would you like to add a cover?',
        choices: [
          { name: '🔗 Enter URL', value: 'url' },
          { name: '📁 Use local file', value: 'local' },
          { name: '⏭️  Skip', value: 'skip' },
        ],
      },
    ]);

    if (imageChoice === 'skip') {
      console.log(chalk.yellow('✖ Cover update cancelled'));
      return;
    }

    if (imageChoice === 'url') {
      const { manualUrl } = await inquirer.prompt<{ manualUrl: string }>([
        {
          type: 'input',
          name: 'manualUrl',
          message: 'Enter cover image URL:',
          validate: (input: string) => {
            if (!input.trim()) return 'URL is required';
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL';
            }
          },
        },
      ]);
      frontmatter.coverImage = manualUrl;
    } else if (imageChoice === 'local') {
      // Import sharp for local image processing
      const sharp = await import('sharp');
      const { imagePath } = await inquirer.prompt<{ imagePath: string }>([
        {
          type: 'input',
          name: 'imagePath',
          message: 'Path to image file:',
          validate: (input: string) => {
            if (!input.trim()) return 'Path is required';
            if (!existsSync(input)) return 'File not found';

            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
            const ext = input.toLowerCase().match(/\.[^.]+$/)?.[0];
            if (!ext || !allowedExtensions.includes(ext)) {
              return `Invalid image format. Allowed: ${allowedExtensions.join(', ')}`;
            }

            const { statSync } = require('fs');
            const stats = statSync(input);
            const fileSizeInMB = stats.size / (1024 * 1024);
            if (fileSizeInMB > 10) {
              return `File too large (${fileSizeInMB.toFixed(1)}MB). Maximum size: 10MB`;
            }

            return true;
          },
        },
      ]);

      // Create images directory if it doesn't exist
      const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'readings');
      if (!existsSync(IMAGES_DIR)) {
        mkdirSync(IMAGES_DIR, { recursive: true });
      }

      // Optimize and save image
      const outputPath = join(IMAGES_DIR, `${slug}.webp`);
      console.log(chalk.gray('Optimizing image...'));

      try {
        await sharp
          .default(imagePath)
          .resize(400, 600, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 80 })
          .toFile(outputPath);

        frontmatter.coverImage = `/images/readings/${slug}.webp`;
        console.log(chalk.green('✓ Image optimized and saved'));
      } catch (imageError) {
        console.error(chalk.red('✖ Failed to process image:'), imageError);
        return;
      }
    }

    const updatedContent = matter.stringify(markdownContent, frontmatter);
    writeFileSync(filePath, updatedContent);
    console.log(chalk.green('✓ Cover image updated successfully'));
    return;
  }

  // Display found covers for selection
  const choices = covers.map((cover, index) => ({
    name: `${index + 1}. ${cover.source} (confidence: ${Math.round(cover.confidence * 100)}%)`,
    value: cover.url,
  }));
  choices.push({ name: '🔗 Enter URL manually', value: 'manual' });
  choices.push({ name: '📁 Use local file', value: 'local' });
  choices.push({ name: '⏭️  Skip', value: 'skip' });

  const { selectedCover } = await inquirer.prompt<{ selectedCover: string }>([
    {
      type: 'list',
      name: 'selectedCover',
      message: 'Select a cover:',
      choices,
    },
  ]);

  if (selectedCover === 'skip') {
    console.log(chalk.yellow('✖ Cover update cancelled'));
    return;
  }

  if (selectedCover === 'manual') {
    const { manualUrl } = await inquirer.prompt<{ manualUrl: string }>([
      {
        type: 'input',
        name: 'manualUrl',
        message: 'Enter cover image URL:',
        validate: (input: string) => {
          if (!input.trim()) return 'URL is required';
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        },
      },
    ]);
    frontmatter.coverImage = manualUrl;
  } else if (selectedCover === 'local') {
    // Import sharp for local image processing
    const sharp = await import('sharp');
    const { imagePath } = await inquirer.prompt<{ imagePath: string }>([
      {
        type: 'input',
        name: 'imagePath',
        message: 'Path to image file:',
        validate: (input: string) => {
          if (!input.trim()) return 'Path is required';
          if (!existsSync(input)) return 'File not found';

          const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
          const ext = input.toLowerCase().match(/\.[^.]+$/)?.[0];
          if (!ext || !allowedExtensions.includes(ext)) {
            return `Invalid image format. Allowed: ${allowedExtensions.join(', ')}`;
          }

          const { statSync } = require('fs');
          const stats = statSync(input);
          const fileSizeInMB = stats.size / (1024 * 1024);
          if (fileSizeInMB > 10) {
            return `File too large (${fileSizeInMB.toFixed(1)}MB). Maximum size: 10MB`;
          }

          return true;
        },
      },
    ]);

    // Create images directory if it doesn't exist
    const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'readings');
    if (!existsSync(IMAGES_DIR)) {
      mkdirSync(IMAGES_DIR, { recursive: true });
    }

    // Optimize and save image
    const outputPath = join(IMAGES_DIR, `${slug}.webp`);
    console.log(chalk.gray('Optimizing image...'));

    try {
      await sharp
        .default(imagePath)
        .resize(400, 600, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      frontmatter.coverImage = `/images/readings/${slug}.webp`;
      console.log(chalk.green('✓ Image optimized and saved'));
    } catch (imageError) {
      console.error(chalk.red('✖ Failed to process image:'), imageError);
      return;
    }
  } else {
    frontmatter.coverImage = selectedCover;
  }

  // Create backup before updating
  const dateStr = new Date().toISOString().split('T')[0];
  if (!dateStr) {
    console.error(chalk.red('✖ Could not generate date string for backup'));
    return;
  }
  const backupDir = join(BACKUP_DIR, dateStr);
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }
  const backupPath = join(backupDir, `${slug}.md`);
  writeFileSync(backupPath, content);

  // Update the file
  const updatedContent = matter.stringify(markdownContent, frontmatter);
  writeFileSync(filePath, updatedContent);
  console.log(chalk.green('✓ Cover image updated successfully'));
}

/**
 * Fix all broken cover URLs
 */
export async function fixBrokenCovers(): Promise<void> {
  const BROKEN_URL_PATTERN = /book-covers\.nyc3\.digitaloceanspaces\.com/;

  if (!existsSync(READINGS_DIR)) {
    console.log(chalk.yellow('⚠️  Readings directory not found'));
    return;
  }

  const { readdirSync } = await import('fs');
  const files = readdirSync(READINGS_DIR).filter(file => file.endsWith('.md'));

  const brokenBooks = [];

  for (const file of files) {
    const filePath = join(READINGS_DIR, file);
    const content = readFileSync(filePath, 'utf8');
    const { data } = matter(content);

    if (data.coverImage && BROKEN_URL_PATTERN.test(data.coverImage)) {
      brokenBooks.push({
        slug: file.replace('.md', ''),
        title: data.title,
        author: data.author,
        filePath,
      });
    }
  }

  if (brokenBooks.length === 0) {
    console.log(chalk.green('✅ No broken covers found!'));
    return;
  }

  console.log(chalk.yellow(`📚 Found ${brokenBooks.length} books with broken covers`));

  let fixed = 0;
  let failed = 0;

  for (const book of brokenBooks) {
    console.log(chalk.cyan(`\nProcessing: ${book.title} by ${book.author}`));

    const covers = await searchCovers(book.title, book.author);

    if (covers.length > 0) {
      // Use the highest confidence cover
      const bestCover = covers.sort((a, b) => b.confidence - a.confidence)[0];

      if (bestCover) {
        const content = readFileSync(book.filePath, 'utf8');
        const { data: frontmatter, content: markdownContent } = matter(content);

        frontmatter.coverImage = bestCover.url;
        const updatedContent = matter.stringify(markdownContent, frontmatter);

        writeFileSync(book.filePath, updatedContent);
        console.log(chalk.green(`✓ Fixed with ${bestCover.source} cover`));
        fixed++;
      } else {
        console.log(chalk.yellow('⚠️  No cover found'));
        failed++;
      }
    } else {
      console.log(chalk.yellow('⚠️  No cover found'));
      failed++;
    }
  }

  console.log(chalk.cyan(`\n📊 Results: ${fixed} fixed, ${failed} failed`));
}

/**
 * Validate all cover URLs
 */
export async function validateCovers(): Promise<void> {
  if (!existsSync(READINGS_DIR)) {
    console.log(chalk.yellow('⚠️  Readings directory not found'));
    return;
  }

  const { readdirSync } = await import('fs');
  const files = readdirSync(READINGS_DIR).filter(file => file.endsWith('.md'));

  let valid = 0;
  let invalid = 0;
  const invalidBooks = [];

  console.log(chalk.cyan('🔍 Validating cover URLs...'));

  for (const file of files) {
    const filePath = join(READINGS_DIR, file);
    const content = readFileSync(filePath, 'utf8');
    const { data } = matter(content);

    if (data.coverImage) {
      try {
        // For local images, check if file exists
        if (data.coverImage.startsWith('/images/')) {
          const imagePath = join(process.cwd(), 'public', data.coverImage);
          if (existsSync(imagePath)) {
            valid++;
          } else {
            invalid++;
            invalidBooks.push(`${data.title} - Local image missing: ${data.coverImage}`);
          }
        } else {
          // For remote URLs, do a HEAD request
          const response = await fetch(data.coverImage, { method: 'HEAD' });
          if (response.ok) {
            valid++;
          } else {
            invalid++;
            invalidBooks.push(`${data.title} - HTTP ${response.status}: ${data.coverImage}`);
          }
        }
      } catch (error) {
        invalid++;
        invalidBooks.push(`${data.title} - Error: ${data.coverImage}`);
      }
    }
  }

  console.log(chalk.green(`✅ Valid covers: ${valid}`));

  if (invalid > 0) {
    console.log(chalk.red(`✖ Invalid covers: ${invalid}`));
    console.log(chalk.yellow('\nInvalid covers:'));
    invalidBooks.forEach(book => console.log(chalk.gray(`  - ${book}`)));
  }
}
