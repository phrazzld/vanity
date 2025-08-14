#!/usr/bin/env node

import { program } from 'commander';
import { addQuote, listQuotes } from './commands/quote';
import { addReading, listReadings } from './commands/reading';

program
  .name('vanity')
  .description('CLI tool for managing Vanity content - quotes and readings')
  .version('1.0.0')
  .addHelpText(
    'after',
    `
Examples:
  $ vanity quote add              # Add a new quote interactively
  $ vanity quote list             # List recent quotes
  $ vanity quote list -n 20       # List last 20 quotes
  
  $ vanity reading add            # Add a new reading with prompts
  $ vanity reading list           # List recent readings
  $ vanity reading list -n 5      # List last 5 readings

More Information:
  Use 'vanity <command> --help' for detailed help on specific commands
  `
  );

// Quote commands
const quote = program
  .command('quote')
  .description('Manage quotes - add, list, and organize memorable quotes');

quote
  .command('add')
  .description('Add a new quote interactively using your editor')
  .addHelpText(
    'after',
    `
This command will:
  1. Open your $EDITOR for the quote text
  2. Open your $EDITOR for the author name
  3. Show a preview of the formatted quote
  4. Save the quote with an auto-incremented ID

Environment:
  Set EDITOR environment variable to use your preferred editor
  Default: vi
  `
  )
  .action(async () => {
    await addQuote();
  });

quote
  .command('list')
  .description('List recent quotes in reverse chronological order')
  .option('-n, --number <count>', 'Number of quotes to show', '10')
  .addHelpText(
    'after',
    `
Examples:
  $ vanity quote list         # Show last 10 quotes
  $ vanity quote list -n 20   # Show last 20 quotes
  $ vanity quote list -n 1    # Show most recent quote
  `
  )
  .action(options => {
    const limit = parseInt(options.number, 10);
    listQuotes(isNaN(limit) ? 10 : limit);
  });

// Reading commands
const reading = program
  .command('reading')
  .description("Manage readings - track books you've read or are reading");

reading
  .command('add')
  .description('Add a new reading with interactive prompts')
  .addHelpText(
    'after',
    `
This command will prompt you for:
  • Book title and author
  • Whether you've finished the book
  • Finish date (if completed)
  • Cover image (URL, local file, or skip)
  • Optional thoughts about the book

Features:
  - Local images are automatically optimized to 400x600 WebP
  - Filenames are generated from slugified titles
  - Opens $EDITOR for longer thoughts
  `
  )
  .action(async () => {
    await addReading();
  });

reading
  .command('list')
  .description('List recent readings sorted by finish date')
  .option('-n, --number <count>', 'Number of readings to show', '10')
  .addHelpText(
    'after',
    `
Display Format:
  ✓ = Finished (with date)
  ○ = Currently reading
  
Examples:
  $ vanity reading list       # Show last 10 readings
  $ vanity reading list -n 5  # Show last 5 readings
  $ vanity reading list -n 50 # Show last 50 readings
  `
  )
  .action(options => {
    const limit = parseInt(options.number, 10);
    listReadings(isNaN(limit) ? 10 : limit);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
