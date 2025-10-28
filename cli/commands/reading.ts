import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import matter from 'gray-matter';
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
    // Get basic reading information
    const basicInfo = await promptBasicReadingInfo();

    // Get reading metadata (finished, date, audiobook, favorite)
    const { finished, finishedDate, audiobook, favorite } = await promptReadingMetadata();

    // Get cover image choice and details
    const slug = sanitizeSlug(basicInfo.title);
    const coverImageResult = await promptCoverImage();

    let coverImage: string | null = null;
    if (coverImageResult.choice === 'url') {
      coverImage = coverImageResult.value;
    } else if (coverImageResult.choice === 'local' && coverImageResult.value) {
      // Process local image
      console.log(chalk.gray('Optimizing image...'));
      try {
        coverImage = await processReadingCoverImage(coverImageResult.value, slug, IMAGES_DIR);
        console.log(chalk.green('✓ Image optimized and saved'));
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
          return;
        }
      }
    }

    // Show preview
    console.log(previewReading(basicInfo.title, basicInfo.author, finished));

    // Check for existing readings and handle rereads
    let filename = `${slug}.md`;
    let filepath = join(READINGS_DIR, filename);

    const existingReading = await getMostRecentReading(slug, READINGS_DIR);

    if (existingReading) {
      // Book already exists - offer reread options
      let message: string;
      if (existingReading.count === 1) {
        const dateStr = existingReading.date
          ? `finished ${new Date(existingReading.date).toLocaleDateString()}`
          : 'currently reading';
        message = chalk.yellow(`⚠️  '${basicInfo.title}' already tracked (${dateStr}).`);
      } else {
        message = chalk.yellow(
          `⚠️  '${basicInfo.title}' already tracked (${existingReading.count} previous readings).`
        );
      }

      console.log('\n' + message);

      const action = await promptRereadAction(
        basicInfo.title,
        existingReading.count,
        existingReading.date,
        getNextRereadFilename(slug, READINGS_DIR)
      );

      if (action === 'cancel') {
        console.log(chalk.yellow('✖ Reading creation cancelled.'));
        return;
      } else if (action === 'reread') {
        filename = getNextRereadFilename(slug, READINGS_DIR);
        filepath = join(READINGS_DIR, filename);

        // For rereads, if they selected a local image, we need to rename it
        if (coverImage && coverImage.startsWith('/images/readings/')) {
          const rereadSlug = filename.replace('.md', '');
          const newOutputPath = join(IMAGES_DIR, `${rereadSlug}.webp`);
          const originalPath = join(IMAGES_DIR, `${slug}.webp`);

          if (existsSync(originalPath)) {
            try {
              // Rename the file we just created to match the reread filename
              const { renameSync } = await import('fs');
              renameSync(originalPath, newOutputPath);
              coverImage = `/images/readings/${rereadSlug}.webp`;
            } catch {
              console.warn(
                chalk.yellow('⚠️  Could not rename image for reread, using original path')
              );
            }
          }
        }
      }
      // If 'update', we continue with the existing filepath
    }

    // Create the reading file content
    const frontmatter: ReadingFrontmatter = {
      title: basicInfo.title,
      author: basicInfo.author,
      finished: finishedDate || null,
    };

    if (coverImage) {
      frontmatter.coverImage = coverImage;
    }

    if (audiobook) {
      frontmatter.audiobook = audiobook;
    }

    if (favorite) {
      frontmatter.favorite = favorite;
    }

    const fileContent = matter.stringify('', frontmatter);

    // Ensure readings directory exists
    try {
      if (!existsSync(READINGS_DIR)) {
        await mkdir(READINGS_DIR, { recursive: true });
      }
    } catch (dirError) {
      console.error(chalk.red('✖ Failed to create readings directory:'), dirError);
      process.exit(1);
    }

    // Write the file
    try {
      await writeFile(filepath, fileContent);
      console.log(chalk.green(`\n✅ Reading "${basicInfo.title}" saved to ${filename}`));
    } catch (writeError) {
      console.error(chalk.red('✖ Failed to save reading file:'), writeError);
      console.log(chalk.gray(`  Attempted to write to: ${filepath}`));
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('prompt')) {
      console.log(chalk.yellow('\n✖ Reading creation cancelled.'));
    } else {
      console.error(chalk.red('✖ Error adding reading:'), error);
      process.exit(1);
    }
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
 * Update an existing reading (mark as finished, toggle favorite, etc.)
 */
export async function updateReading() {
  try {
    // Get all readings
    const readings = getReadings();

    // Filter to show only unfinished readings first, then recent finished ones
    const unfinishedReadings = readings.filter(r => !r.finishedDate);
    const finishedReadings = readings.filter(r => r.finishedDate).slice(0, 10);

    if (unfinishedReadings.length === 0 && finishedReadings.length === 0) {
      console.log(chalk.yellow('No readings found to update.'));
      return;
    }

    // Build choices for selection
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

    // Prompt for which reading to update
    const { selectedSlug } = await inquirer.prompt<{ selectedSlug: string }>([
      {
        type: 'list',
        name: 'selectedSlug',
        message: 'Which reading would you like to update?',
        choices,
        pageSize: 15,
      },
    ]);

    // Find the file for this reading
    const filename = `${selectedSlug}.md`;
    const filepath = join(READINGS_DIR, filename);

    if (!existsSync(filepath)) {
      console.error(chalk.red(`✖ Reading file not found: ${filename}`));
      return;
    }

    // Read current content
    const fileContent = await readFile(filepath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);
    // Type assertion for frontmatter from gray-matter
    const typedFrontmatter = frontmatter as ReadingFrontmatter;
    const currentReading = readings.find(r => r.slug === selectedSlug);

    if (!currentReading) {
      console.error(chalk.red('✖ Could not find reading data'));
      return;
    }

    // Show current status
    console.log(chalk.cyan('\n📖 Current Reading:'));
    console.log(chalk.gray(`   Title: ${currentReading.title}`));
    console.log(chalk.gray(`   Author: ${currentReading.author}`));
    if (currentReading.finishedDate) {
      console.log(
        chalk.gray(
          `   Status: Finished on ${new Date(currentReading.finishedDate).toLocaleDateString()}`
        )
      );
    } else {
      console.log(chalk.gray(`   Status: Currently reading`));
    }

    // Ask what to update
    const { updateAction } = await inquirer.prompt<{ updateAction: string }>([
      {
        type: 'list',
        name: 'updateAction',
        message: 'What would you like to update?',
        choices: [
          ...(currentReading.finishedDate
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

    if (updateAction === 'cancel') {
      console.log(chalk.yellow('✖ Update cancelled.'));
      return;
    }

    let updatedFrontmatter = { ...typedFrontmatter };
    let updatedContent = content;

    // Handle different update actions
    if (updateAction === 'finish_today') {
      updatedFrontmatter.finished = new Date().toISOString();
      console.log(chalk.green(`✓ Marked as finished today (${new Date().toLocaleDateString()})`));
    } else if (updateAction === 'finish_custom') {
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
    } else if (updateAction === 'title') {
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
      console.log(chalk.green(`✓ Updated title to "${newTitle.trim()}"`));
    } else if (updateAction === 'author') {
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
      console.log(chalk.green(`✓ Updated author to "${newAuthor.trim()}"`));
    } else if (updateAction === 'cover') {
      await updateCoverImage(currentReading, updatedFrontmatter);
    } else if (updateAction === 'audiobook') {
      const currentStatus = typedFrontmatter.audiobook || false;
      updatedFrontmatter.audiobook = !currentStatus;
      console.log(
        chalk.green(
          `✓ ${updatedFrontmatter.audiobook ? 'Marked as audiobook' : 'Removed audiobook status'}`
        )
      );
    } else if (updateAction === 'favorite') {
      const currentStatus = typedFrontmatter.favorite || false;
      updatedFrontmatter.favorite = !currentStatus;
      console.log(
        chalk.green(
          `✓ ${updatedFrontmatter.favorite ? 'Marked as favorite' : 'Removed favorite status'}`
        )
      );
    } else if (updateAction === 'multiple') {
      updatedContent = await updateMultipleFields(currentReading, updatedFrontmatter, content);
    } else if (updateAction === 'delete') {
      // Confirm deletion before proceeding
      const { confirmDelete } = await inquirer.prompt<ConfirmDeletePrompt>([
        {
          type: 'confirm',
          name: 'confirmDelete',
          message: chalk.yellow(
            `⚠️  Are you sure you want to delete "${currentReading.title}"? This cannot be undone.`
          ),
          default: false,
        },
      ]);

      if (!confirmDelete) {
        console.log(chalk.yellow('✖ Deletion cancelled.'));
        return;
      }

      // Delete the file
      try {
        unlinkSync(filepath);
        console.log(
          chalk.green(
            `\n✅ Successfully deleted "${currentReading.title}" by ${currentReading.author}`
          )
        );
        return; // Exit early, don't write file
      } catch (error) {
        console.error(
          chalk.red('✖ Failed to delete file:'),
          error instanceof Error ? error.message : String(error)
        );
        console.log(chalk.gray(`  Attempted to delete: ${filepath}`));
        process.exit(1);
      }
    }

    // Show preview of changes if any were made
    const hasChanges =
      JSON.stringify(typedFrontmatter) !== JSON.stringify(updatedFrontmatter) ||
      content !== updatedContent;

    if (hasChanges) {
      console.log(chalk.cyan('\n📝 Preview of changes:'));

      // Show frontmatter changes
      const frontmatterChanges = [];
      if (typedFrontmatter.title !== updatedFrontmatter.title) {
        frontmatterChanges.push(`  Title: ${typedFrontmatter.title} → ${updatedFrontmatter.title}`);
      }
      if (typedFrontmatter.author !== updatedFrontmatter.author) {
        frontmatterChanges.push(
          `  Author: ${typedFrontmatter.author} → ${updatedFrontmatter.author}`
        );
      }
      if (typedFrontmatter.coverImage !== updatedFrontmatter.coverImage) {
        const oldCover = typedFrontmatter.coverImage || 'None';
        const newCover = updatedFrontmatter.coverImage || 'None';
        frontmatterChanges.push(`  Cover: ${oldCover} → ${newCover}`);
      }
      if (typedFrontmatter.audiobook !== updatedFrontmatter.audiobook) {
        frontmatterChanges.push(
          `  Audiobook: ${typedFrontmatter.audiobook || false} → ${updatedFrontmatter.audiobook}`
        );
      }
      if (typedFrontmatter.finished !== updatedFrontmatter.finished) {
        const oldDate = typedFrontmatter.finished
          ? new Date(typedFrontmatter.finished).toLocaleDateString()
          : 'Not finished';
        const newDate = updatedFrontmatter.finished
          ? new Date(updatedFrontmatter.finished).toLocaleDateString()
          : 'Not finished';
        frontmatterChanges.push(`  Finished: ${oldDate} → ${newDate}`);
      }

      if (frontmatterChanges.length > 0) {
        console.log(chalk.gray(frontmatterChanges.join('\n')));
      }

      if (content !== updatedContent) {
        console.log(chalk.gray('  Thoughts: Updated'));
      }

      // Confirm before saving
      const { confirmSave } = await inquirer.prompt<{ confirmSave: boolean }>([
        {
          type: 'confirm',
          name: 'confirmSave',
          message: 'Save these changes?',
          default: true,
        },
      ]);

      if (!confirmSave) {
        console.log(chalk.yellow('✖ Changes discarded.'));
        return;
      }
    }

    // Write updated file
    const newContent = matter.stringify(updatedContent, updatedFrontmatter);
    await writeFile(filepath, newContent);

    console.log(
      chalk.green(`\n✅ Successfully updated "${updatedFrontmatter.title || currentReading.title}"`)
    );
  } catch (error) {
    console.error(chalk.red('✖ Error updating reading:'), error);
    process.exit(1);
  }
}
