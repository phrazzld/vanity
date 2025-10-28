import inquirer from 'inquirer';
import { validateDateInput, validateDateForPrompt } from './reading-validation';
import type {
  BasicReadingInfo,
  ImageChoicePrompt,
  ImageUrlPrompt,
  ImageFilePrompt,
} from '../types';

/**
 * Prompt for basic reading information (title and author)
 *
 * @returns Object with title and author
 */
export async function promptBasicReadingInfo(): Promise<BasicReadingInfo> {
  return inquirer.prompt<BasicReadingInfo>([
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
}

/**
 * Prompt for reading metadata (finished status, date, audiobook, favorite)
 *
 * @returns Object with finished, finishedDate, audiobook, and favorite flags
 */
export async function promptReadingMetadata(): Promise<{
  finished: boolean;
  finishedDate: string | null;
  audiobook: boolean;
  favorite: boolean;
}> {
  // Ask if finished
  const { finished } = await inquirer.prompt<{ finished: boolean }>([
    {
      type: 'confirm',
      name: 'finished',
      message: 'Have you finished this book?',
      default: false,
    },
  ]);

  // If finished, get the date
  let finishedDate: string | null = null;
  if (finished) {
    const { dateInput } = await inquirer.prompt<{ dateInput: string }>([
      {
        type: 'input',
        name: 'dateInput',
        message: 'When did you finish? (YYYY-MM-DD or press Enter for today):',
        default: new Date().toISOString().split('T')[0],
        validate: validateDateForPrompt,
      },
    ]);
    finishedDate = validateDateInput(dateInput);
  }

  // Ask about audiobook
  const { audiobook } = await inquirer.prompt<{ audiobook: boolean }>([
    {
      type: 'confirm',
      name: 'audiobook',
      message: 'Is this an audiobook?',
      default: false,
    },
  ]);

  // Ask about favorite
  const { favorite } = await inquirer.prompt<{ favorite: boolean }>([
    {
      type: 'confirm',
      name: 'favorite',
      message: 'Mark as favorite?',
      default: false,
    },
  ]);

  return {
    finished,
    finishedDate,
    audiobook,
    favorite,
  };
}

/**
 * Prompt for cover image choice and details
 *
 * @returns Object with choice ('url', 'local', or 'skip') and value (URL or path, or null)
 */
export async function promptCoverImage(): Promise<{
  choice: 'url' | 'local' | 'skip';
  value: string | null;
}> {
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
    return { choice: 'url', value: imageUrl };
  } else if (imageChoice === 'local') {
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
    return { choice: 'local', value: imagePath };
  }

  return { choice: 'skip', value: null };
}

/**
 * Prompt for action when a reading already exists (reread or update)
 *
 * @param title - Book title
 * @param existingCount - Number of existing readings
 * @param lastDate - ISO date string of most recent reading, or null
 * @param nextFilename - Suggested filename for reread
 * @returns Action chosen: 'reread', 'update', or 'cancel'
 */
export async function promptRereadAction(
  _title: string,
  _existingCount: number,
  _lastDate: string | null,
  nextFilename: string
): Promise<'reread' | 'update' | 'cancel'> {
  const { action } = await inquirer.prompt<{ action: 'reread' | 'update' | 'cancel' }>([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        {
          name: `Add as reread (creates ${nextFilename})`,
          value: 'reread' as const,
        },
        {
          name: 'Update most recent entry',
          value: 'update' as const,
        },
        {
          name: 'Cancel',
          value: 'cancel' as const,
        },
      ],
      default: 'reread',
    },
  ]);

  return action;
}
