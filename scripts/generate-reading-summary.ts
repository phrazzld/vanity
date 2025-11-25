#!/usr/bin/env tsx

import { getReadings } from '../src/lib/data';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface Reading {
  slug: string;
  title: string;
  author: string | null;
  finishedDate: string | null;
  coverImageSrc: string | null;
  audiobook?: boolean;
  favorite?: boolean;
}

function generateReadingSummary() {
  const readings = getReadings();

  // Separate finished and currently reading
  const finished = readings.filter(r => r.finishedDate !== null);
  const currentlyReading = readings.filter(r => r.finishedDate === null);

  // Group finished books by year
  const booksByYear: Record<string, Reading[]> = {};
  finished.forEach(book => {
    if (book.finishedDate) {
      const year = new Date(book.finishedDate).getFullYear();
      if (!booksByYear[year]) {
        booksByYear[year] = [];
      }
      booksByYear[year].push(book);
    }
  });

  // Sort years in descending order
  const years = Object.keys(booksByYear).sort((a, b) => parseInt(b) - parseInt(a));

  // Generate markdown content
  let content = `# Reading Summary

*Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}*

## Statistics

- **Total Books Tracked:** ${readings.length}
- **Books Finished:** ${finished.length}
- **Currently Reading:** ${currentlyReading.length}
- **Years Covered:** ${years.length > 0 ? `${years[years.length - 1]} - ${years[0]}` : 'N/A'}

## Currently Reading

`;

  if (currentlyReading.length === 0) {
    content += '*No books currently being read.*\n\n';
  } else {
    currentlyReading.forEach(book => {
      content += `- **${book.title}**${book.author ? ` by ${book.author}` : ''}\n`;
    });
    content += '\n';
  }

  content += '## Books by Year\n\n';

  // Add books grouped by year
  years.forEach(year => {
    const yearBooks = booksByYear[year];
    if (!yearBooks) return; // Skip if no books for this year

    content += `### ${year} (${yearBooks.length} books)\n\n`;

    // Sort books by date finished (most recent first)
    yearBooks.sort((a, b) => {
      const dateA = new Date(a.finishedDate || 0);
      const dateB = new Date(b.finishedDate || 0);
      return dateB.getTime() - dateA.getTime();
    });

    yearBooks.forEach(book => {
      const date = book.finishedDate
        ? new Date(book.finishedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : '';
      content += `- **${book.title}**${book.author ? ` by ${book.author}` : ''}${date ? ` *(${date})*` : ''}\n`;
    });
    content += '\n';
  });

  // Add top authors section
  const authorCounts: Record<string, number> = {};
  finished.forEach(book => {
    if (book.author) {
      authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
    }
  });

  const topAuthors = Object.entries(authorCounts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  if (topAuthors.length > 0) {
    content += '## Most Read Authors\n\n';
    topAuthors.forEach(([author, count]) => {
      content += `- **${author}**: ${count} books\n`;
    });
    content += '\n';
  }

  // Add reading list by category/genre if we detect patterns
  const categories = {
    philosophy: [
      'Plato',
      'Nietzsche',
      'Philosophy',
      'Stoic',
      'Marcus Aurelius',
      'Seneca',
      'Epictetus',
    ],
    fiction: ['Novel', 'Fiction', 'Vonnegut', 'Tolkien', 'Asimov', 'Corey'],
    history: ['History', 'Biography', 'Churchill', 'Chernow', 'Caro'],
    tech: ['Bitcoin', 'Programming', 'Javascript', 'Ethereum', 'Crypto', 'Code', 'Software'],
    religion: ['Bible', 'God', 'Catholic', 'Christian', 'Augustine', 'Aquinas'],
  };

  const booksByCategory: Record<string, Reading[]> = {
    philosophy: [],
    fiction: [],
    history: [],
    tech: [],
    religion: [],
    other: [],
  };

  finished.forEach(book => {
    let categorized = false;
    const fullText = `${book.title} ${book.author || ''}`.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => fullText.includes(keyword.toLowerCase()))) {
        const categoryBooks = booksByCategory[category];
        if (categoryBooks) {
          categoryBooks.push(book);
          categorized = true;
          break;
        }
      }
    }

    if (!categorized && booksByCategory.other) {
      booksByCategory.other.push(book);
    }
  });

  // Write the summary file
  const outputPath = join(process.cwd(), 'READING_SUMMARY.md');
  writeFileSync(outputPath, content, 'utf8');

  console.log(`✅ Reading summary generated: ${outputPath}`);
  console.log(`   - ${finished.length} books finished`);
  console.log(`   - ${currentlyReading.length} currently reading`);
  console.log(`   - ${years.length} years of reading history`);
}

// Run the script
try {
  generateReadingSummary();
} catch (error) {
  console.error('❌ Error generating reading summary:', error);
  // Use exit code 1 to indicate failure

  if (typeof process !== 'undefined') {
    process.exit(1);
  }
}
