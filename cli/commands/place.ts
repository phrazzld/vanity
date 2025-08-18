import { writeFile, mkdir, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import slugify from 'slugify';
import matter from 'gray-matter';
import { getPlaces } from '../../src/lib/data';
import type {
  BasicPlaceInfo,
  PlaceCoordinatesPrompt,
  PlaceHasNote,
  PlaceNoteInput,
  PlaceConfirm,
  PlaceOverwrite,
} from '../types';

const PLACES_DIR = join(process.cwd(), 'content', 'places');

/**
 * Gets the next available place ID by finding the max existing ID
 */
async function getNextPlaceId(): Promise<number> {
  try {
    const files = await readdir(PLACES_DIR);
    const ids = await Promise.all(
      files
        .filter(f => f.endsWith('.md'))
        .map(async f => {
          const content = await readFile(join(PLACES_DIR, f), 'utf8');
          const { data } = matter(content);
          return parseInt(data.id);
        })
    );
    const validIds = ids.filter(n => !isNaN(n));

    return validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
  } catch {
    return 1;
  }
}

/**
 * Adds a new place interactively using inquirer prompts
 */
export async function addPlace(): Promise<void> {
  console.log(chalk.cyan("📍 Let's add a new place...\n"));

  try {
    // Basic place info
    const basicInfo = await inquirer.prompt<BasicPlaceInfo>([
      {
        type: 'input',
        name: 'name',
        message: 'Place name:',
        validate: input => (input.trim() ? true : 'Name is required'),
        filter: input => input.trim().toLowerCase(),
      },
    ]);

    // Coordinates prompts
    const coordinates = await inquirer.prompt<PlaceCoordinatesPrompt>([
      {
        type: 'input',
        name: 'lat',
        message: 'Latitude (e.g., 37.7749):',
        validate: input => {
          const num = parseFloat(input);
          if (isNaN(num)) return 'Please enter a valid number';
          if (num < -90 || num > 90) return 'Latitude must be between -90 and 90';
          return true;
        },
        filter: input => parseFloat(input),
      },
      {
        type: 'input',
        name: 'lng',
        message: 'Longitude (e.g., -122.4194):',
        validate: input => {
          const num = parseFloat(input);
          if (isNaN(num)) return 'Please enter a valid number';
          if (num < -180 || num > 180) return 'Longitude must be between -180 and 180';
          return true;
        },
        filter: input => parseFloat(input),
      },
    ]);

    // Optional note prompt
    const { hasNote } = await inquirer.prompt<PlaceHasNote>([
      {
        type: 'confirm',
        name: 'hasNote',
        message: 'Would you like to add a note or description?',
        default: true,
      },
    ]);

    let note: string | undefined;
    if (hasNote) {
      const { noteInput } = await inquirer.prompt<PlaceNoteInput>([
        {
          type: 'input',
          name: 'noteInput',
          message: 'Note/description:',
          validate: input => (input.trim() ? true : 'Note cannot be empty if provided'),
        },
      ]);
      note = noteInput.trim();
    }

    // Get next ID
    const nextId = await getNextPlaceId();

    // Show preview
    console.log('\n' + chalk.cyan('📋 Place Preview:'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.bold(basicInfo.name));
    console.log(chalk.gray('ID: ') + nextId);
    console.log(chalk.gray('Coordinates: ') + `${coordinates.lat}, ${coordinates.lng}`);
    if (note) console.log(chalk.gray('Note: ') + note);
    console.log(chalk.gray('─'.repeat(40)) + '\n');

    // Confirm save
    const { confirm } = await inquirer.prompt<PlaceConfirm>([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Save this place?',
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('✖ Place creation cancelled.'));
      return;
    }

    // Generate filename and create content
    const slug = slugify(basicInfo.name, { lower: true, strict: true });
    const filename = `${slug}.md`;
    const filepath = join(PLACES_DIR, filename);

    // Check if file already exists
    if (existsSync(filepath)) {
      const { overwrite } = await inquirer.prompt<PlaceOverwrite>([
        {
          type: 'confirm',
          name: 'overwrite',
          message: chalk.yellow(`⚠️  ${filename} already exists. Overwrite?`),
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('✖ Place creation cancelled.'));
        return;
      }
    }

    // Create the place file content
    const frontmatter = {
      id: nextId.toString(),
      name: basicInfo.name,
      lat: coordinates.lat,
      lng: coordinates.lng,
      ...(note && { note }),
    };

    const fileContent = matter.stringify('', frontmatter);

    // Ensure places directory exists
    try {
      if (!existsSync(PLACES_DIR)) {
        await mkdir(PLACES_DIR, { recursive: true });
      }
    } catch (dirError) {
      console.error(chalk.red('✖ Failed to create places directory:'), dirError);
      process.exit(1);
    }

    // Write the file
    try {
      await writeFile(filepath, fileContent);
      console.log(chalk.green(`\n✅ Place "${basicInfo.name}" saved to ${filename}`));
      console.log(chalk.gray(`   ID: ${nextId}`));
      console.log(chalk.gray(`   Coordinates: ${coordinates.lat}, ${coordinates.lng}`));
    } catch (writeError) {
      console.error(chalk.red('✖ Failed to save place file:'), writeError);
      console.log(chalk.gray(`  Attempted to write to: ${filepath}`));
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('prompt')) {
      console.log(chalk.yellow('\n✖ Place creation cancelled.'));
    } else {
      console.error(chalk.red('✖ Error adding place:'), error);
      process.exit(1);
    }
  }
}

/**
 * Lists places with formatting
 * @param limit Number of places to show (default 10)
 */
export function listPlaces(limit: number = 10): void {
  try {
    const places = getPlaces();
    const limitedPlaces = places.slice(0, limit);

    if (limitedPlaces.length === 0) {
      console.log(chalk.yellow('No places found.'));
      return;
    }

    console.log(chalk.cyan(`\n📍 Places (showing ${limitedPlaces.length} of ${places.length})\n`));

    limitedPlaces.forEach((place, index) => {
      console.log(chalk.bold(`[${place.id.padStart(2, '0')}] ${place.name}`));
      console.log(chalk.gray(`     ${place.lat}, ${place.lng}`));
      if (place.note) {
        const truncatedNote =
          place.note.length > 60 ? place.note.substring(0, 57) + '...' : place.note;
        console.log(chalk.gray('     ') + chalk.italic(truncatedNote));
      }

      if (index < limitedPlaces.length - 1) {
        console.log();
      }
    });

    console.log(chalk.gray(`\nTotal places: ${places.length}`));
  } catch (error) {
    console.error(chalk.red('✖ Error listing places:'), error);
    process.exit(1);
  }
}
