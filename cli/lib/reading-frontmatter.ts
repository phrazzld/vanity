import { readFile, writeFile } from 'fs/promises';
import matter from 'gray-matter';
import type { ReadingFrontmatter } from '../types';

/**
 * Read and parse frontmatter from a reading markdown file
 *
 * @param filepath - Absolute path to markdown file
 * @returns Object with parsed frontmatter and markdown content
 * @throws Error if file cannot be read or parsed
 */
export async function readReadingFrontmatter(
  filepath: string
): Promise<{ frontmatter: ReadingFrontmatter; content: string }> {
  const fileContent = await readFile(filepath, 'utf-8');
  const { data, content } = matter(fileContent);

  // Type assertion for frontmatter from gray-matter
  const frontmatter = data as ReadingFrontmatter;

  return { frontmatter, content };
}

/**
 * Write frontmatter and content to a reading markdown file
 *
 * Creates properly formatted markdown with YAML frontmatter.
 * Fields are ordered alphabetically for consistency.
 *
 * @param filepath - Absolute path to markdown file
 * @param frontmatter - Reading frontmatter object
 * @param content - Markdown content (optional, defaults to empty)
 */
export async function writeReadingFrontmatter(
  filepath: string,
  frontmatter: ReadingFrontmatter,
  content: string = ''
): Promise<void> {
  const fileContent = matter.stringify(content, frontmatter);
  await writeFile(filepath, fileContent, 'utf-8');
}

/**
 * Update a specific field in frontmatter
 *
 * Creates a new frontmatter object with the updated field.
 * Does not mutate the original frontmatter.
 *
 * @param frontmatter - Original frontmatter object
 * @param field - Field key to update
 * @param value - New value for the field
 * @returns New frontmatter object with updated field
 */
export function updateFrontmatterField<K extends keyof ReadingFrontmatter>(
  frontmatter: ReadingFrontmatter,
  field: K,
  value: ReadingFrontmatter[K]
): ReadingFrontmatter {
  return {
    ...frontmatter,
    [field]: value,
  };
}

/**
 * Create a new reading frontmatter object with required fields
 *
 * @param title - Book title
 * @param author - Book author
 * @param finished - ISO date string or null
 * @param options - Optional fields (coverImage, audiobook, favorite)
 * @returns Complete frontmatter object
 */
export function createReadingFrontmatter(
  title: string,
  author: string,
  finished: string | null,
  options?: {
    coverImage?: string;
    audiobook?: boolean;
    favorite?: boolean;
  }
): ReadingFrontmatter {
  const frontmatter: ReadingFrontmatter = {
    title,
    author,
    finished: finished || null,
  };

  if (options?.coverImage) {
    frontmatter.coverImage = options.coverImage;
  }

  if (options?.audiobook) {
    frontmatter.audiobook = options.audiobook;
  }

  if (options?.favorite) {
    frontmatter.favorite = options.favorite;
  }

  return frontmatter;
}
