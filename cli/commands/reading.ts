import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, statSync, readdirSync } from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import slugify from 'slugify';
import sharp from 'sharp';
import matter from 'gray-matter';
import { openEditor } from '../lib/editor';
import { previewReading } from '../lib/preview';
import { getReadings } from '../../src/lib/data';
import type {
  BasicReadingInfo,
  FinishedPrompt,
  DateInputPrompt,
  ImageChoicePrompt,
  ImageUrlPrompt,
  ImageFilePrompt,
  ThoughtsPrompt,
  AudiobookPrompt,
  ContinueWithoutImagePrompt,
  ReadingActionPrompt,
  ReadingFrontmatter,
} from '../types';

const READINGS_DIR = join(process.cwd(), 'content', 'readings');
const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'readings');

/**
 * Find all existing readings for a given slug (base and numbered versions)
 */
function findExistingReadings(baseSlug: string): string[] {
  if (!existsSync(READINGS_DIR)) return [];

  const files = readdirSync(READINGS_DIR);
  const pattern = new RegExp(`^${baseSlug}(-\\d+)?\\.md$`);

  return files
    .filter(file => pattern.test(file))
    .sort((a, b) => {
      // Sort base file first, then numbered versions
      const aNum = a.match(/-(\d+)\.md$/)?.[1];
      const bNum = b.match(/-(\d+)\.md$/)?.[1];
      if (!aNum && !bNum) return 0;
      if (!aNum) return -1;
      if (!bNum) return 1;
      return parseInt(aNum) - parseInt(bNum);
    });
}

/**
 * Get the next available filename for a reread
 */
function getNextRereadFilename(baseSlug: string): string {
  const existingFiles = findExistingReadings(baseSlug);

  if (existingFiles.length === 0) {
    return `${baseSlug}.md`;
  }

  // Find the highest number suffix
  let maxNum = 1; // Start at 1 since base file exists
  for (const file of existingFiles) {
    const match = file.match(/-(\d+)\.md$/);
    if (match && match[1]) {
      maxNum = Math.max(maxNum, parseInt(match[1]));
    }
  }

  return `${baseSlug}-${String(maxNum + 1).padStart(2, '0')}.md`;
}

/**
 * Get information about the most recent reading
 */
async function getMostRecentReading(
  baseSlug: string
): Promise<{ date: string | null; count: number } | null> {
  const existingFiles = findExistingReadings(baseSlug);
  if (existingFiles.length === 0) return null;

  // Read the most recent file to get its date
  const mostRecentFile = existingFiles[existingFiles.length - 1];
  if (!mostRecentFile) return null;

  const filepath = join(READINGS_DIR, mostRecentFile);

  try {
    const content = await readFile(filepath, 'utf8');
    const { data } = matter(content);
    return {
      date: (data.finished as string | null) || null,
      count: existingFiles.length,
    };
  } catch {
    return { date: null, count: existingFiles.length };
  }
}

/**
 * Adds a new reading interactively using inquirer prompts
 */
export async function addReading(): Promise<void> {
  console.log(chalk.cyan("📚 Let's add a new reading...\n"));

  try {
    // Title and author prompts
    const basicInfo = await inquirer.prompt<BasicReadingInfo>([
      {
        type: 'input',
        name: 'title',
        message: 'Book title:',
        validate: input => (input.trim() ? true : 'Title is required'),
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author:',
        validate: input => (input.trim() ? true : 'Author is required'),
      },
    ]);

    // Finished prompt
    const { finished } = await inquirer.prompt<FinishedPrompt>([
      {
        type: 'confirm',
        name: 'finished',
        message: 'Have you finished this book?',
        default: false,
      },
    ]);

    // Date prompt if finished
    let finishedDate: string | null = null;
    if (finished) {
      const { dateInput } = await inquirer.prompt<DateInputPrompt>([
        {
          type: 'input',
          name: 'dateInput',
          message: 'When did you finish? (YYYY-MM-DD or press Enter for today):',
          default: new Date().toISOString().split('T')[0],
          validate: input => {
            if (!input) return true;
            const date = new Date(input);
            return !isNaN(date.getTime()) ? true : 'Please enter a valid date (YYYY-MM-DD)';
          },
        },
      ]);
      finishedDate = new Date(dateInput).toISOString();
    }

    // Audiobook prompt
    const { audiobook } = await inquirer.prompt<AudiobookPrompt>([
      {
        type: 'confirm',
        name: 'audiobook',
        message: 'Is this an audiobook?',
        default: false,
      },
    ]);

    // Cover image prompt
    const { imageChoice } = await inquirer.prompt<ImageChoicePrompt>([
      {
        type: 'list',
        name: 'imageChoice',
        message: 'Add a cover image?',
        choices: [
          { name: '🔗 URL - Provide an image URL', value: 'url' },
          { name: '📁 Local - Upload a local image file', value: 'local' },
          { name: '⏭️  Skip - No cover image', value: 'skip' },
        ],
      },
    ]);

    let coverImage: string | null = null;
    const slug = slugify(basicInfo.title, { lower: true, strict: true });

    if (imageChoice === 'url') {
      const { imageUrl } = await inquirer.prompt<ImageUrlPrompt>([
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
      coverImage = imageUrl;
    } else if (imageChoice === 'local') {
      const { imagePath } = await inquirer.prompt<ImageFilePrompt>([
        {
          type: 'input',
          name: 'imagePath',
          message: 'Path to image file:',
          validate: input => {
            if (!input.trim()) return 'Path is required';

            // Check if file exists
            if (!existsSync(input)) return 'File not found';

            // Validate file extension
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
            const ext = input.toLowerCase().match(/\.[^.]+$/)?.[0];
            if (!ext || !allowedExtensions.includes(ext)) {
              return `Invalid image format. Allowed: ${allowedExtensions.join(', ')}`;
            }

            // Check file size (max 10MB)
            const stats = statSync(input);
            const fileSizeInMB = stats.size / (1024 * 1024);
            if (fileSizeInMB > 10) {
              return `File too large (${fileSizeInMB.toFixed(1)}MB). Maximum size: 10MB`;
            }

            // Check for directory traversal attempts
            if (input.includes('..') || input.includes('~')) {
              return 'Invalid path. Please use absolute or relative paths without .. or ~';
            }

            return true;
          },
        },
      ]);

      // Ensure images directory exists
      if (!existsSync(IMAGES_DIR)) {
        await mkdir(IMAGES_DIR, { recursive: true });
      }

      // Optimize and save image
      // Note: We'll update the path later if this is a reread
      const tempOutputPath = join(IMAGES_DIR, `${slug}.webp`);
      console.log(chalk.gray('Optimizing image...'));

      try {
        await sharp(imagePath)
          .resize(400, 600, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 80 })
          .toFile(tempOutputPath);

        coverImage = `/images/readings/${slug}.webp`;
        console.log(chalk.green('✓ Image optimized and saved'));
      } catch (imageError) {
        console.error(chalk.red('✖ Failed to process image:'), imageError);
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

    // Thoughts prompt
    const { addThoughts } = await inquirer.prompt<ThoughtsPrompt>([
      {
        type: 'confirm',
        name: 'addThoughts',
        message: 'Would you like to add your thoughts about this book?',
        default: false,
      },
    ]);

    let thoughts = '';
    if (addThoughts) {
      console.log(chalk.gray('\nOpening editor for your thoughts...'));
      const thoughtsTemplate = `# Your thoughts on "${basicInfo.title}" by ${basicInfo.author}
# Lines starting with # will be ignored
# Write your thoughts below:

`;
      const thoughtsContent = await openEditor(thoughtsTemplate, '.md');
      if (thoughtsContent) {
        thoughts = thoughtsContent
          .split('\n')
          .filter(line => !line.startsWith('#'))
          .join('\n')
          .trim();
      }
    }

    // Show preview
    console.log(previewReading(basicInfo.title, basicInfo.author, finished, thoughts || undefined));

    // Check for existing readings and handle rereads
    let filename = `${slug}.md`;
    let filepath = join(READINGS_DIR, filename);

    const existingReading = await getMostRecentReading(slug);

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

      const { action } = await inquirer.prompt<ReadingActionPrompt>([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            {
              name: `Add as reread (creates ${getNextRereadFilename(slug)})`,
              value: 'reread',
            },
            {
              name: 'Update most recent entry',
              value: 'update',
            },
            {
              name: 'Cancel',
              value: 'cancel',
            },
          ],
          default: 'reread',
        },
      ]);

      if (action === 'cancel') {
        console.log(chalk.yellow('✖ Reading creation cancelled.'));
        return;
      } else if (action === 'reread') {
        filename = getNextRereadFilename(slug);
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

    const fileContent = matter.stringify(thoughts, frontmatter);

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

      if (reading.thoughts && reading.thoughts.trim()) {
        const truncatedThoughts =
          reading.thoughts.length > 80
            ? reading.thoughts.substring(0, 77) + '...'
            : reading.thoughts;
        console.log(chalk.gray('   ') + chalk.italic(`"${truncatedThoughts}"`));
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
 * Update an existing reading (mark as finished, update thoughts, etc.)
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
          { name: 'Update thoughts', value: 'thoughts' },
          { name: 'Delete reading', value: 'delete' },
          { name: 'Cancel', value: 'cancel' },
        ],
      },
    ]);

    if (updateAction === 'cancel') {
      console.log(chalk.yellow('✖ Update cancelled.'));
      return;
    }

    let updatedFrontmatter = { ...frontmatter };
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
          validate: (input: string) => {
            const date = new Date(input);
            if (isNaN(date.getTime())) {
              return 'Please enter a valid date (MM/DD/YYYY)';
            }
            if (date > new Date()) {
              return 'Date cannot be in the future';
            }
            return true;
          },
        },
      ]);

      const date = new Date(dateInput);
      updatedFrontmatter.finished = date.toISOString();
      console.log(chalk.green(`✓ Marked as finished on ${date.toLocaleDateString()}`));
    } else if (updateAction === 'thoughts') {
      console.log(chalk.gray('\nOpening editor for your thoughts...'));
      const currentThoughts = content.trim();
      const thoughtsTemplate = `# Your thoughts on "${currentReading.title}" by ${currentReading.author}
# Lines starting with # will be ignored
# Current thoughts are shown below. Edit as needed:

${currentThoughts}`;

      const newThoughts = await openEditor(thoughtsTemplate, '.md');
      if (newThoughts) {
        updatedContent = newThoughts
          .split('\n')
          .filter(line => !line.startsWith('#'))
          .join('\n')
          .trim();
        console.log(chalk.green('✓ Updated thoughts'));
      }
    } else if (updateAction === 'delete') {
      // TODO: Task 8 will implement file deletion functionality
      // Temporarily disabled to fix TypeScript compilation
      console.log(
        chalk.yellow('⚠️ Delete functionality temporarily disabled - will be implemented in Task 8')
      );
    }

    // Write updated file
    const newContent = matter.stringify(updatedContent, updatedFrontmatter);
    await writeFile(filepath, newContent);

    console.log(chalk.green(`\n✅ Successfully updated "${currentReading.title}"`));
  } catch (error) {
    console.error(chalk.red('✖ Error updating reading:'), error);
    process.exit(1);
  }
}
