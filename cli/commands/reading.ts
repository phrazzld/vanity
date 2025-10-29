import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { previewReading } from '../lib/preview';
import { getReadings } from '../../src/lib/data';
import { processReadingCoverImage } from '../lib/reading-image';
import { getNextRereadFilename, getMostRecentReading } from '../lib/reading-reread';
import { sanitizeSlug, validateDateInput, validateDateForPrompt } from '../lib/reading-validation';
import {
  promptBasicReadingInfo,
  promptReadingMetadata,
  promptCoverImage,
  promptRereadAction,
} from '../lib/reading-prompts';
import {
  readReadingFrontmatter,
  writeReadingFrontmatter,
  createReadingFrontmatter,
} from '../lib/reading-frontmatter';
import type {
  DateInputPrompt,
  ImageFilePrompt,
  ContinueWithoutImagePrompt,
  ReadingFrontmatter,
  ConfirmDeletePrompt,
} from '../types';

const READINGS_DIR = join(process.cwd(), 'content', 'readings');
const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'readings');

/**
 * Adds a new reading interactively using inquirer prompts
 */
export async function addReading(): Promise<void> {
  console.log(chalk.cyan("📚 Let's add a new reading...\n"));

  try {
    // Gather input from user
    const basicInfo = await promptBasicReadingInfo();
    const { finished, finishedDate, audiobook, favorite } = await promptReadingMetadata();
    const slug = sanitizeSlug(basicInfo.title);

    // Process cover image if provided
    let coverImage: string | null = null;
    const coverImageResult = await promptCoverImage();

    if (coverImageResult.choice === 'url') {
      coverImage = coverImageResult.value;
    } else if (coverImageResult.choice === 'local' && coverImageResult.value) {
      const imageResult = await handleLocalImageProcessing(coverImageResult.value, slug);
      if (imageResult === null) return; // User cancelled after image error
      coverImage = imageResult || null; // Empty string becomes null (no image)
    }

    // Show preview and handle existing readings
    console.log(previewReading(basicInfo.title, basicInfo.author, finished));

    const { filename, filepath, finalCoverImage } = await handleExistingReadings(
      slug,
      basicInfo.title,
      coverImage
    );

    if (!filename) return; // User cancelled

    // Create and save reading
    const frontmatter = createReadingFrontmatter(basicInfo.title, basicInfo.author, finishedDate, {
      coverImage: finalCoverImage || undefined,
      audiobook,
      favorite,
    });

    await ensureDirectoryExists(READINGS_DIR);
    await writeReadingFrontmatter(filepath, frontmatter);

    console.log(chalk.green(`\n✅ Reading "${basicInfo.title}" saved to ${filename}`));
  } catch (error) {
    handleAddReadingError(error);
  }
}

/**
 * Process local image file with error handling
 *
 * @returns Image path on success, empty string to continue without image, null if user cancels
 *
 * Note: This function uses three return values to distinguish user intent:
 * - Success: Returns full image path (e.g., "/images/readings/slug.webp")
 * - Continue without image: Returns empty string (user chose to proceed despite processing failure)
 * - Cancel: Returns null (user chose to cancel reading creation entirely)
 */
async function handleLocalImageProcessing(imagePath: string, slug: string): Promise<string | null> {
  console.log(chalk.gray('Optimizing image...'));
  try {
    const coverImage = await processReadingCoverImage(imagePath, slug, IMAGES_DIR);
    console.log(chalk.green('✓ Image optimized and saved'));
    return coverImage;
  } catch (imageError) {
    const errorMessage = imageError instanceof Error ? imageError.message : String(imageError);
    console.error(chalk.red('✖ Failed to process image:'), errorMessage);

    const { continueWithoutImage } = await inquirer.prompt<ContinueWithoutImagePrompt>([
      {
        type: 'confirm',
        name: 'continueWithoutImage',
        message: 'Continue without cover image?',
        default: true,
      },
    ]);

    if (!continueWithoutImage) {
      console.log(chalk.yellow('✖ Reading creation cancelled.'));
      return null;
    }

    console.log(chalk.yellow('⚠ Continuing without cover image'));
    return ''; // Empty string signals: continue without image
  }
}

/**
 * Handle existing reading detection and reread logic
 * Returns filename, filepath, and potentially renamed cover image
 */
async function handleExistingReadings(
  slug: string,
  title: string,
  coverImage: string | null
): Promise<
  | { filename: string; filepath: string; finalCoverImage: string | null }
  | { filename: null; filepath: null; finalCoverImage: null }
> {
  const existingReading = await getMostRecentReading(slug, READINGS_DIR);

  if (!existingReading) {
    // No existing reading - use default filename
    const filename = `${slug}.md`;
    const filepath = join(READINGS_DIR, filename);
    return { filename, filepath, finalCoverImage: coverImage };
  }

  // Show warning about existing reading
  const message =
    existingReading.count === 1
      ? chalk.yellow(
          `⚠️  '${title}' already tracked (${
            existingReading.date
              ? `finished ${new Date(existingReading.date).toLocaleDateString()}`
              : 'currently reading'
          }).`
        )
      : chalk.yellow(
          `⚠️  '${title}' already tracked (${existingReading.count} previous readings).`
        );

  console.log('\n' + message);

  // Ask user what to do
  const action = await promptRereadAction(
    title,
    existingReading.count,
    existingReading.date,
    getNextRereadFilename(slug, READINGS_DIR)
  );

  if (action === 'cancel') {
    console.log(chalk.yellow('✖ Reading creation cancelled.'));
    return { filename: null, filepath: null, finalCoverImage: null };
  }

  if (action === 'update') {
    // Update existing file
    const filename = `${slug}.md`;
    const filepath = join(READINGS_DIR, filename);
    return { filename, filepath, finalCoverImage: coverImage };
  }

  // Create reread with new filename
  const filename = getNextRereadFilename(slug, READINGS_DIR);
  const filepath = join(READINGS_DIR, filename);

  // Rename image file if needed
  const finalCoverImage = await renameImageForReread(slug, filename, coverImage);

  return { filename, filepath, finalCoverImage };
}

/**
 * Rename processed image to match reread filename
 */
async function renameImageForReread(
  baseSlug: string,
  rereadFilename: string,
  coverImage: string | null
): Promise<string | null> {
  if (!coverImage || !coverImage.startsWith('/images/readings/')) {
    return coverImage;
  }

  const rereadSlug = rereadFilename.replace('.md', '');
  const originalPath = join(IMAGES_DIR, `${baseSlug}.webp`);
  const newOutputPath = join(IMAGES_DIR, `${rereadSlug}.webp`);

  if (!existsSync(originalPath)) {
    return coverImage;
  }

  try {
    const { renameSync } = await import('fs');
    renameSync(originalPath, newOutputPath);
    return `/images/readings/${rereadSlug}.webp`;
  } catch {
    console.warn(chalk.yellow('⚠️  Could not rename image for reread, using original path'));
    return coverImage;
  }
}

/**
 * Ensure directory exists, creating if necessary
 */
async function ensureDirectoryExists(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(chalk.red('✖ Failed to create directory:'), error);
      process.exit(1);
    }
  }
}

/**
 * Handle errors during reading creation
 */
function handleAddReadingError(error: unknown): void {
  if (error instanceof Error && error.message.includes('prompt')) {
    console.log(chalk.yellow('\n✖ Reading creation cancelled.'));
  } else {
    console.error(chalk.red('✖ Error adding reading:'), error);
    process.exit(1);
  }
}

/**
 * Lists recent readings with formatting
 * @param limit Number of readings to show (default 10)
 */
export function listReadings(limit: number = 10): void {
  try {
    const readings = getReadings();
    const recentReadings = readings.slice(0, limit);

    if (recentReadings.length === 0) {
      console.log(chalk.yellow('No readings found.'));
      return;
    }

    console.log(
      chalk.cyan(`\n📚 Recent Readings (showing ${recentReadings.length} of ${readings.length})\n`)
    );

    recentReadings.forEach((reading, index) => {
      const status = reading.finishedDate
        ? chalk.green('✓') + ' ' + new Date(reading.finishedDate).toLocaleDateString()
        : chalk.yellow('○ Reading');

      console.log(chalk.bold(reading.title));
      console.log(chalk.gray('   by ') + reading.author);
      console.log(chalk.gray('   ') + status);

      if (reading.favorite) {
        console.log(chalk.gray('   ⭐ Favorite'));
      }

      if (index < recentReadings.length - 1) {
        console.log();
      }
    });

    const finishedCount = readings.filter(r => r.finishedDate).length;
    const readingCount = readings.length - finishedCount;

    console.log(
      chalk.gray(
        `\nTotal: ${readings.length} books (${finishedCount} finished, ${readingCount} reading)`
      )
    );
  } catch (error) {
    console.error(chalk.red('✖ Error listing readings:'), error);
    process.exit(1);
  }
}

/**
 * Update the cover image for a reading
 */
async function updateCoverImage(
  currentReading: {
    slug: string;
    title: string;
    author: string;
    finishedDate: string | null;
    coverImageSrc: string | null;
    audiobook: boolean;
    favorite: boolean;
  },
  updatedFrontmatter: ReadingFrontmatter
): Promise<void> {
  const currentCover = updatedFrontmatter.coverImage || 'None';
  console.log(chalk.gray(`Current cover: ${currentCover}`));

  const { imageAction } = await inquirer.prompt<{ imageAction: string }>([
    {
      type: 'list',
      name: 'imageAction',
      message: 'How would you like to update the cover image?',
      choices: [
        { name: '🔗 Provide a URL', value: 'url' },
        { name: '📁 Upload local file', value: 'local' },
        { name: '🔍 Search online (automatic)', value: 'search' },
        { name: '🗑️  Remove cover image', value: 'remove' },
        { name: '❌ Cancel', value: 'cancel' },
      ],
    },
  ]);

  if (imageAction === 'cancel') {
    return;
  }

  if (imageAction === 'remove') {
    delete updatedFrontmatter.coverImage;
    console.log(chalk.green('✓ Removed cover image'));
    return;
  }

  if (imageAction === 'url') {
    const { imageUrl } = await inquirer.prompt<{ imageUrl: string }>([
      {
        type: 'input',
        name: 'imageUrl',
        message: 'Image URL:',
        validate: input => {
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
    updatedFrontmatter.coverImage = imageUrl;
    console.log(chalk.green('✓ Updated cover image URL'));
  } else if (imageAction === 'local') {
    const { imagePath } = await inquirer.prompt<ImageFilePrompt>([
      {
        type: 'input',
        name: 'imagePath',
        message: 'Path to image file:',
        validate: input => {
          if (!input.trim()) return 'Path is required';
          return true;
        },
      },
    ]);

    console.log(chalk.gray('Optimizing image...'));

    try {
      updatedFrontmatter.coverImage = await processReadingCoverImage(
        imagePath,
        currentReading.slug,
        IMAGES_DIR
      );
      console.log(chalk.green('✓ Image optimized and saved'));
    } catch (imageError) {
      const errorMessage = imageError instanceof Error ? imageError.message : String(imageError);
      console.error(chalk.red('✖ Failed to process image:'), errorMessage);
    }
  } else if (imageAction === 'search') {
    console.log(chalk.cyan('🔍 Searching for book cover online...'));
    const coverUrl = await searchBookCover();

    if (coverUrl) {
      updatedFrontmatter.coverImage = coverUrl;
      console.log(chalk.green(`✓ Found and set cover image: ${coverUrl}`));
    } else {
      console.log(chalk.yellow('⚠️  No cover image found online'));
    }
  }
}

/**
 * Update multiple fields at once
 */
async function updateMultipleFields(
  currentReading: {
    slug: string;
    title: string;
    author: string;
    finishedDate: string | null;
    coverImageSrc: string | null;
    audiobook: boolean;
    favorite: boolean;
  },
  updatedFrontmatter: ReadingFrontmatter,
  content: string
): Promise<string> {
  const { fieldsToUpdate } = await inquirer.prompt<{ fieldsToUpdate: string[] }>([
    {
      type: 'checkbox',
      name: 'fieldsToUpdate',
      message: 'Select fields to update:',
      choices: [
        { name: 'Title', value: 'title' },
        { name: 'Author', value: 'author' },
        { name: 'Cover Image', value: 'cover' },
        { name: 'Audiobook Status', value: 'audiobook' },
        { name: 'Favorite Status', value: 'favorite' },
        { name: 'Finished Date', value: 'finished' },
      ],
    },
  ]);

  let updatedContent = content;

  for (const field of fieldsToUpdate) {
    if (field === 'title') {
      const { newTitle } = await inquirer.prompt<{ newTitle: string }>([
        {
          type: 'input',
          name: 'newTitle',
          message: 'New title:',
          default: currentReading.title ?? '',
          validate: input => (input.trim() ? true : 'Title is required'),
        },
      ]);
      updatedFrontmatter.title = newTitle.trim();
    } else if (field === 'author') {
      const { newAuthor } = await inquirer.prompt<{ newAuthor: string }>([
        {
          type: 'input',
          name: 'newAuthor',
          message: 'New author:',
          default: currentReading.author ?? '',
          validate: input => (input.trim() ? true : 'Author is required'),
        },
      ]);
      updatedFrontmatter.author = newAuthor.trim();
    } else if (field === 'cover') {
      await updateCoverImage(currentReading, updatedFrontmatter);
    } else if (field === 'audiobook') {
      const currentStatus = updatedFrontmatter.audiobook || false;
      const { isAudiobook } = await inquirer.prompt<{ isAudiobook: boolean }>([
        {
          type: 'confirm',
          name: 'isAudiobook',
          message: 'Is this an audiobook?',
          default: currentStatus,
        },
      ]);
      updatedFrontmatter.audiobook = isAudiobook;
    } else if (field === 'favorite') {
      const currentStatus = updatedFrontmatter.favorite || false;
      const { isFavorite } = await inquirer.prompt<{ isFavorite: boolean }>([
        {
          type: 'confirm',
          name: 'isFavorite',
          message: 'Mark as favorite?',
          default: currentStatus,
        },
      ]);
      updatedFrontmatter.favorite = isFavorite;
    } else if (field === 'finished') {
      const { dateInput } = await inquirer.prompt<DateInputPrompt>([
        {
          type: 'input',
          name: 'dateInput',
          message: 'Finished date (YYYY-MM-DD, or empty for unfinished):',
          default: currentReading.finishedDate
            ? new Date(currentReading.finishedDate).toISOString().split('T')[0]
            : '',
          validate: validateDateForPrompt,
        },
      ]);
      updatedFrontmatter.finished = dateInput ? validateDateInput(dateInput) : null;
    }
  }

  console.log(chalk.green(`✓ Updated ${fieldsToUpdate.length} field(s)`));
  return updatedContent;
}

/**
 * Search for book cover online using APIs
 */
async function searchBookCover(): Promise<string | null> {
  // For now, return null - this will be implemented in Phase 2
  // Will integrate with Google Books API and OpenLibrary
  console.log(chalk.gray('(Online search will be implemented in next phase)'));
  return null;
}

/**
 * Select a reading to update from the list
 * Returns null if no readings available or user cancels
 */
async function selectReadingToUpdate(): Promise<{
  filepath: string;
  currentReading: ReturnType<typeof getReadings>[number];
  frontmatter: ReadingFrontmatter;
  content: string;
} | null> {
  const readings = getReadings();

  // Filter to show unfinished first, then recent finished
  const unfinishedReadings = readings.filter(r => !r.finishedDate);
  const finishedReadings = readings.filter(r => r.finishedDate).slice(0, 10);

  if (unfinishedReadings.length === 0 && finishedReadings.length === 0) {
    console.log(chalk.yellow('No readings found to update.'));
    return null;
  }

  // Build selection choices
  const choices = [
    ...unfinishedReadings.map(r => ({
      name: chalk.yellow(`○ ${r.title} - ${r.author} (currently reading)`),
      value: r.slug,
    })),
    ...finishedReadings.map(r => ({
      name: chalk.green(
        `✓ ${r.title} - ${r.author} (finished ${r.finishedDate ? new Date(r.finishedDate).toLocaleDateString() : 'Unknown'})`
      ),
      value: r.slug,
    })),
  ];

  const { selectedSlug } = await inquirer.prompt<{ selectedSlug: string }>([
    {
      type: 'list',
      name: 'selectedSlug',
      message: 'Which reading would you like to update?',
      choices,
      pageSize: 15,
    },
  ]);

  // Load the reading file
  const filepath = join(READINGS_DIR, `${selectedSlug}.md`);

  if (!existsSync(filepath)) {
    console.error(chalk.red(`✖ Reading file not found: ${selectedSlug}.md`));
    return null;
  }

  const { frontmatter, content } = await readReadingFrontmatter(filepath);
  const currentReading = readings.find(r => r.slug === selectedSlug);

  if (!currentReading) {
    console.error(chalk.red('✖ Could not find reading data'));
    return null;
  }

  return { filepath, currentReading, frontmatter, content };
}

/**
 * Display current reading information
 */
function displayCurrentReadingInfo(reading: ReturnType<typeof getReadings>[number]): void {
  console.log(chalk.cyan('\n📖 Current Reading:'));
  console.log(chalk.gray(`   Title: ${reading.title}`));
  console.log(chalk.gray(`   Author: ${reading.author}`));

  if (reading.finishedDate) {
    console.log(
      chalk.gray(`   Status: Finished on ${new Date(reading.finishedDate).toLocaleDateString()}`)
    );
  } else {
    console.log(chalk.gray(`   Status: Currently reading`));
  }
}

/**
 * Prompt user for update action
 */
async function promptUpdateAction(
  reading: ReturnType<typeof getReadings>[number]
): Promise<string> {
  const { updateAction } = await inquirer.prompt<{ updateAction: string }>([
    {
      type: 'list',
      name: 'updateAction',
      message: 'What would you like to update?',
      choices: [
        ...(reading.finishedDate
          ? []
          : [
              { name: 'Mark as finished (today)', value: 'finish_today' },
              { name: 'Mark as finished (custom date)', value: 'finish_custom' },
            ]),
        { name: '📖 Update title', value: 'title' },
        { name: '✍️  Update author', value: 'author' },
        { name: '🖼️  Update cover image', value: 'cover' },
        { name: '🎧 Toggle audiobook status', value: 'audiobook' },
        { name: '⭐ Toggle favorite status', value: 'favorite' },
        { name: '🔄 Update multiple fields', value: 'multiple' },
        { name: '🗑️  Delete reading', value: 'delete' },
        { name: '❌ Cancel', value: 'cancel' },
      ],
    },
  ]);

  return updateAction;
}

/**
 * Handle reading deletion with confirmation
 */
async function handleDeleteReading(
  filepath: string,
  reading: ReturnType<typeof getReadings>[number]
): Promise<void> {
  const { confirmDelete } = await inquirer.prompt<ConfirmDeletePrompt>([
    {
      type: 'confirm',
      name: 'confirmDelete',
      message: chalk.yellow(
        `⚠️  Are you sure you want to delete "${reading.title}"? This cannot be undone.`
      ),
      default: false,
    },
  ]);

  if (!confirmDelete) {
    console.log(chalk.yellow('✖ Deletion cancelled.'));
    return;
  }

  try {
    unlinkSync(filepath);
    console.log(chalk.green(`\n✅ Successfully deleted "${reading.title}" by ${reading.author}`));
  } catch (error) {
    console.error(
      chalk.red('✖ Failed to delete file:'),
      error instanceof Error ? error.message : String(error)
    );
    console.log(chalk.gray(`  Attempted to delete: ${filepath}`));
    process.exit(1);
  }
}

/**
 * Apply the selected update action to frontmatter/content
 */
async function applyUpdateAction(
  action: string,
  frontmatter: ReadingFrontmatter,
  content: string,
  reading: ReturnType<typeof getReadings>[number]
): Promise<{ updatedFrontmatter: ReadingFrontmatter; updatedContent: string }> {
  let updatedFrontmatter = { ...frontmatter };
  let updatedContent = content;

  if (action === 'finish_today') {
    updatedFrontmatter.finished = new Date().toISOString();
    console.log(chalk.green(`✓ Marked as finished today (${new Date().toLocaleDateString()})`));
  } else if (action === 'finish_custom') {
    const { dateInput } = await inquirer.prompt<DateInputPrompt>([
      {
        type: 'input',
        name: 'dateInput',
        message: 'When did you finish? (MM/DD/YYYY):',
        validate: (input: string) => validateDateForPrompt(input),
      },
    ]);

    updatedFrontmatter.finished = validateDateInput(dateInput);
    const date = new Date(updatedFrontmatter.finished);
    console.log(chalk.green(`✓ Marked as finished on ${date.toLocaleDateString()}`));
  } else if (action === 'title') {
    const { newTitle } = await inquirer.prompt<{ newTitle: string }>([
      {
        type: 'input',
        name: 'newTitle',
        message: 'New title:',
        default: reading.title ?? '',
        validate: input => (input.trim() ? true : 'Title is required'),
      },
    ]);
    updatedFrontmatter.title = newTitle.trim();
    console.log(chalk.green(`✓ Updated title to "${newTitle.trim()}"`));
  } else if (action === 'author') {
    const { newAuthor } = await inquirer.prompt<{ newAuthor: string }>([
      {
        type: 'input',
        name: 'newAuthor',
        message: 'New author:',
        default: reading.author ?? '',
        validate: input => (input.trim() ? true : 'Author is required'),
      },
    ]);
    updatedFrontmatter.author = newAuthor.trim();
    console.log(chalk.green(`✓ Updated author to "${newAuthor.trim()}"`));
  } else if (action === 'cover') {
    await updateCoverImage(reading, updatedFrontmatter);
  } else if (action === 'audiobook') {
    const currentStatus = frontmatter.audiobook || false;
    updatedFrontmatter.audiobook = !currentStatus;
    console.log(
      chalk.green(
        `✓ ${updatedFrontmatter.audiobook ? 'Marked as audiobook' : 'Removed audiobook status'}`
      )
    );
  } else if (action === 'favorite') {
    const currentStatus = frontmatter.favorite || false;
    updatedFrontmatter.favorite = !currentStatus;
    console.log(
      chalk.green(
        `✓ ${updatedFrontmatter.favorite ? 'Marked as favorite' : 'Removed favorite status'}`
      )
    );
  } else if (action === 'multiple') {
    updatedContent = await updateMultipleFields(reading, updatedFrontmatter, content);
  }

  return { updatedFrontmatter, updatedContent };
}

/**
 * Preview changes and confirm with user
 */
async function previewAndConfirmChanges(
  originalFrontmatter: ReadingFrontmatter,
  updatedFrontmatter: ReadingFrontmatter,
  originalContent: string,
  updatedContent: string
): Promise<boolean> {
  const hasChanges =
    JSON.stringify(originalFrontmatter) !== JSON.stringify(updatedFrontmatter) ||
    originalContent !== updatedContent;

  if (!hasChanges) {
    return true; // No changes to confirm
  }

  console.log(chalk.cyan('\n📝 Preview of changes:'));

  // Show frontmatter changes
  const frontmatterChanges = [];

  if (originalFrontmatter.title !== updatedFrontmatter.title) {
    frontmatterChanges.push(`  Title: ${originalFrontmatter.title} → ${updatedFrontmatter.title}`);
  }

  if (originalFrontmatter.author !== updatedFrontmatter.author) {
    frontmatterChanges.push(
      `  Author: ${originalFrontmatter.author} → ${updatedFrontmatter.author}`
    );
  }

  if (originalFrontmatter.coverImage !== updatedFrontmatter.coverImage) {
    const oldCover = originalFrontmatter.coverImage || 'None';
    const newCover = updatedFrontmatter.coverImage || 'None';
    frontmatterChanges.push(`  Cover: ${oldCover} → ${newCover}`);
  }

  if (originalFrontmatter.audiobook !== updatedFrontmatter.audiobook) {
    frontmatterChanges.push(
      `  Audiobook: ${originalFrontmatter.audiobook || false} → ${updatedFrontmatter.audiobook}`
    );
  }

  if (originalFrontmatter.finished !== updatedFrontmatter.finished) {
    const oldDate = originalFrontmatter.finished
      ? new Date(originalFrontmatter.finished).toLocaleDateString()
      : 'Not finished';
    const newDate = updatedFrontmatter.finished
      ? new Date(updatedFrontmatter.finished).toLocaleDateString()
      : 'Not finished';
    frontmatterChanges.push(`  Finished: ${oldDate} → ${newDate}`);
  }

  if (frontmatterChanges.length > 0) {
    console.log(chalk.gray(frontmatterChanges.join('\n')));
  }

  if (originalContent !== updatedContent) {
    console.log(chalk.gray('  Thoughts: Updated'));
  }

  // Confirm save
  const { confirmSave } = await inquirer.prompt<{ confirmSave: boolean }>([
    {
      type: 'confirm',
      name: 'confirmSave',
      message: 'Save these changes?',
      default: true,
    },
  ]);

  return confirmSave;
}

/**
 * Update an existing reading (mark as finished, toggle favorite, etc.)
 */
export async function updateReading() {
  try {
    // Select reading to update
    const selection = await selectReadingToUpdate();
    if (!selection) return;

    const { filepath, currentReading, frontmatter, content } = selection;

    // Show current reading info
    displayCurrentReadingInfo(currentReading);

    // Ask what to update
    const updateAction = await promptUpdateAction(currentReading);
    if (updateAction === 'cancel') {
      console.log(chalk.yellow('✖ Update cancelled.'));
      return;
    }

    // Handle delete separately (no file write needed)
    if (updateAction === 'delete') {
      await handleDeleteReading(filepath, currentReading);
      return;
    }

    // Apply the update
    const { updatedFrontmatter, updatedContent } = await applyUpdateAction(
      updateAction,
      frontmatter,
      content,
      currentReading
    );

    // Preview and confirm changes
    const shouldSave = await previewAndConfirmChanges(
      frontmatter,
      updatedFrontmatter,
      content,
      updatedContent
    );

    if (!shouldSave) {
      console.log(chalk.yellow('✖ Changes discarded.'));
      return;
    }

    // Save updated reading
    await writeReadingFrontmatter(filepath, updatedFrontmatter, updatedContent);
    console.log(
      chalk.green(`\n✅ Successfully updated "${updatedFrontmatter.title || currentReading.title}"`)
    );
  } catch (error) {
    console.error(chalk.red('✖ Error updating reading:'), error);
    process.exit(1);
  }
}
