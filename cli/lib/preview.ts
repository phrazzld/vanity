import boxen from 'boxen';
import chalk from 'chalk';

/**
 * Formats and displays a quote preview in a styled box
 * @param quote The quote text
 * @param author The quote author
 * @param id Optional quote ID
 */
export function previewQuote(quote: string, author: string, id?: number): string {
  const maxWidth = 60;
  const truncatedQuote = quote.length > 200 ? quote.substring(0, 197) + '...' : quote;

  const content = [chalk.italic(`"${truncatedQuote}"`), '', chalk.gray('— ') + chalk.bold(author)];

  if (id) {
    content.push('');
    content.push(chalk.dim(`Quote #${id}`));
  }

  return boxen(content.join('\n'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    title: '📝 Quote Preview',
    titleAlignment: 'center',
    width: Math.min(maxWidth, process.stdout.columns - 4),
  });
}

/**
 * Formats and displays a reading preview in a styled box
 * @param title The book title
 * @param author The book author
 * @param finished Whether the book was finished
 * @param thoughts Optional thoughts about the book
 */
export function previewReading(
  title: string,
  author: string,
  finished: boolean,
  thoughts?: string
): string {
  const maxWidth = 60;
  const status = finished ? chalk.green('✓ Finished') : chalk.yellow('○ In Progress');

  const content = [chalk.bold(title), chalk.gray('by ') + author, '', status];

  if (thoughts) {
    const truncatedThoughts = thoughts.length > 150 ? thoughts.substring(0, 147) + '...' : thoughts;
    content.push('');
    content.push(chalk.italic(truncatedThoughts));
  }

  return boxen(content.join('\n'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'magenta',
    title: '📚 Reading Preview',
    titleAlignment: 'center',
    width: Math.min(maxWidth, process.stdout.columns - 4),
  });
}

/**
 * Displays a success message in a styled box
 * @param message The success message
 */
export function showSuccess(message: string): string {
  return boxen(chalk.green(message), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green',
    title: '✅ Success',
    titleAlignment: 'center',
  });
}

/**
 * Displays an error message in a styled box
 * @param message The error message
 */
export function showError(message: string): string {
  return boxen(chalk.red(message), {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'red',
    title: '❌ Error',
    titleAlignment: 'center',
  });
}
