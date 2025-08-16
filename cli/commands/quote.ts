import { readdir, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import matter from 'gray-matter';
import { openEditor } from '../lib/editor';
import { previewQuote } from '../lib/preview';
import { getQuotes } from '../../src/lib/data';

const QUOTES_DIR = join(process.cwd(), 'content', 'quotes');

/**
 * Gets the next available quote ID by finding the max existing ID
 */
async function getNextQuoteId(): Promise<number> {
  try {
    const files = await readdir(QUOTES_DIR);
    const ids = files
      .filter(f => f.endsWith('.md'))
      .map(f => parseInt(f.replace('.md', '')))
      .filter(n => !isNaN(n));

    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  } catch {
    return 1;
  }
}

/**
 * Adds a new quote interactively using the user's editor
 */
export async function addQuote(): Promise<void> {
  try {
    console.log(chalk.cyan('📝 Opening editor to add a new quote...'));
    console.log(chalk.gray('Enter the quote text. Save and close the editor when done.'));
    console.log(chalk.gray('Leave empty to cancel.\n'));

    // Template for the quote
    const template = `# Enter your quote here
# Lines starting with # will be ignored
# Just type or paste the quote text below:

`;

    // Check if EDITOR is configured
    if (!process.env.EDITOR && !process.env.VISUAL) {
      console.log(chalk.yellow('⚠️  No EDITOR environment variable set.'));
      console.log(
        chalk.gray(
          '  Using default editor (vi). Set EDITOR or VISUAL to use your preferred editor.'
        )
      );
      console.log(chalk.gray('  Example: export EDITOR=nvim'));
    }
    // Open editor for quote text
    const quoteContent = await openEditor(template, '.txt');

    if (!quoteContent) {
      console.log(chalk.yellow('✖ Quote creation cancelled.'));
      return;
    }

    // Remove comment lines and trim
    const cleanQuote = quoteContent
      .split('\n')
      .filter(line => !line.startsWith('#'))
      .join('\n')
      .trim();

    if (!cleanQuote) {
      console.log(chalk.yellow('✖ No quote text provided.'));
      return;
    }

    // Get author information
    console.log(chalk.cyan("\n📚 Now, let's add the author..."));
    const authorTemplate = `# Enter the author's name
# Save and close the editor when done:

`;

    const authorContent = await openEditor(authorTemplate, '.txt');

    if (!authorContent) {
      console.log(chalk.yellow('✖ Quote creation cancelled - no author provided.'));
      return;
    }

    const author = authorContent
      .split('\n')
      .filter(line => !line.startsWith('#'))
      .join('\n')
      .trim();

    if (!author) {
      console.log(chalk.yellow('✖ No author provided.'));
      return;
    }

    // Get next ID and create filename
    const nextId = await getNextQuoteId();
    const filename = String(nextId).padStart(4, '0') + '.md';
    const filepath = join(QUOTES_DIR, filename);

    // Show preview before saving
    console.log(previewQuote(cleanQuote, author, nextId));

    // Create the quote file content
    const fileContent = matter.stringify(cleanQuote, {
      author,
      id: nextId,
    });

    // Ensure quotes directory exists
    try {
      if (!existsSync(QUOTES_DIR)) {
        await mkdir(QUOTES_DIR, { recursive: true });
      }
    } catch (dirError) {
      console.error(chalk.red('✖ Failed to create quotes directory:'), dirError);
      process.exit(1);
    }

    // Write the file
    try {
      await writeFile(filepath, fileContent);
      console.log(chalk.green(`\n✅ Quote #${nextId} saved to ${filename}`));
    } catch (writeError) {
      console.error(chalk.red('✖ Failed to save quote file:'), writeError);
      console.log(chalk.gray(`  Attempted to write to: ${filepath}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('✖ Error adding quote:'), error);
    process.exit(1);
  }
}

/**
 * Lists recent quotes with formatting
 * @param limit Number of quotes to show (default 10)
 */
export function listQuotes(limit: number = 10): void {
  try {
    const quotes = getQuotes();

    // Sort by ID descending (most recent first)
    const sortedQuotes = quotes.sort((a, b) => b.id - a.id);
    const recentQuotes = sortedQuotes.slice(0, limit);

    if (recentQuotes.length === 0) {
      console.log(chalk.yellow('No quotes found.'));
      return;
    }

    console.log(
      chalk.cyan(`\n📝 Recent Quotes (showing ${recentQuotes.length} of ${quotes.length})\n`)
    );

    recentQuotes.forEach((quote, index) => {
      const truncatedText =
        quote.text.length > 100 ? quote.text.substring(0, 97) + '...' : quote.text;

      console.log(
        chalk.gray(`[${String(quote.id).padStart(4, '0')}]`) +
          ' ' +
          chalk.italic(`"${truncatedText}"`)
      );
      console.log(chalk.gray('       — ') + chalk.bold(quote.author));

      if (index < recentQuotes.length - 1) {
        console.log();
      }
    });

    console.log(chalk.gray(`\nTotal quotes: ${quotes.length}`));
  } catch (error) {
    console.error(chalk.red('✖ Error listing quotes:'), error);
    process.exit(1);
  }
}
