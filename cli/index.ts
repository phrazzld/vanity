#!/usr/bin/env node

import { program } from 'commander';
import { addQuote, listQuotes } from './commands/quote';
import { addReading, listReadings, updateReading } from './commands/reading';
import { addProject, listProjects } from './commands/project';
import { addPlace, listPlaces } from './commands/place';

program
  .name('vanity')
  .description('CLI tool for managing Vanity content - quotes, readings, projects, and places')
  .version('1.0.0')
  .addHelpText(
    'after',
    `
Examples:
  $ vanity quote add              # Add a new quote interactively
  $ vanity quote list             # List recent quotes
  $ vanity quote list -n 20       # List last 20 quotes
  
  $ vanity reading add            # Add a new reading with prompts
  $ vanity reading update         # Update a reading (mark finished, etc.)
  $ vanity reading list           # List recent readings
  $ vanity reading list -n 5      # List last 5 readings

  $ vanity project add            # Add a new project interactively
  $ vanity project list           # List all projects
  $ vanity project list -n 5      # List first 5 projects

  $ vanity place add              # Add a new place with coordinates
  $ vanity place list             # List all places
  $ vanity place list -n 20       # List first 20 places

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

reading
  .command('update')
  .description('Update an existing reading (mark as finished, update thoughts, etc.)')
  .addHelpText(
    'after',
    `
This command lets you:
  • Update title, author, or cover image
  • Mark a book as finished (today or custom date)
  • Toggle audiobook status
  • Update your thoughts about a book
  • Update multiple fields at once
  • Delete a reading from your collection
  
The update wizard will:
  1. Show currently reading books first
  2. Let you select which book to update
  3. Present all available update options
  4. Preview changes before saving
  5. Save changes to the markdown file

Examples:
  $ vanity reading update     # Interactive update wizard
  
Common use case:
  Finishing a book you're currently reading - just run 'update',
  select the book, and choose "Mark as finished (today)".
  Need to fix a cover image? Choose "Update cover image".
  `
  )
  .action(async () => {
    await updateReading();
  });

// Project commands
const project = program.command('project').description('Manage projects - showcase your work');

project
  .command('add')
  .description('Add a new project interactively')
  .addHelpText(
    'after',
    `
This command will prompt you for:
  • Project title and description
  • Tech stack (comma-separated list)
  • Optional site URL
  • Optional code repository URL
  • Project image selection

Features:
  - Auto-incremented order for display sorting
  - Slug-based filenames from project title
  - Validation for URLs and required fields
  `
  )
  .action(async () => {
    await addProject();
  });

project
  .command('list')
  .description('List projects in order')
  .option('-n, --number <count>', 'Number of projects to show', '10')
  .addHelpText(
    'after',
    `
Examples:
  $ vanity project list       # Show first 10 projects
  $ vanity project list -n 5  # Show first 5 projects
  $ vanity project list -n 20 # Show first 20 projects
  `
  )
  .action(options => {
    const limit = parseInt(options.number, 10);
    listProjects(isNaN(limit) ? 10 : limit);
  });

// Place commands
const place = program
  .command('place')
  .description("Manage places - track locations you've visited");

place
  .command('add')
  .description('Add a new place with coordinates')
  .addHelpText(
    'after',
    `
This command will prompt you for:
  • Place name (lowercase)
  • Latitude (-90 to 90)
  • Longitude (-180 to 180)
  • Optional note or description

Features:
  - Auto-incremented ID for each place
  - Coordinate validation
  - Slug-based filenames from place name
  - Support for places with apostrophes in names
  `
  )
  .action(async () => {
    await addPlace();
  });

place
  .command('list')
  .description('List places by ID')
  .option('-n, --number <count>', 'Number of places to show', '10')
  .addHelpText(
    'after',
    `
Examples:
  $ vanity place list        # Show first 10 places
  $ vanity place list -n 20  # Show first 20 places
  $ vanity place list -n 50  # Show first 50 places
  `
  )
  .action(options => {
    const limit = parseInt(options.number, 10);
    listPlaces(isNaN(limit) ? 10 : limit);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
