import { existsSync, readdirSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

/**
 * Find all existing readings for a given slug (base and numbered versions)
 *
 * Searches the readings directory for files matching the slug pattern.
 * Returns files sorted with base file first, then numbered versions in order.
 *
 * @param baseSlug - The base slug to search for (e.g., "1984")
 * @param readingsDir - Directory containing reading markdown files
 * @returns Array of filenames matching the slug pattern
 *
 * @example
 * // For slug "1984" with files: 1984.md, 1984-02.md, 1984-03.md
 * findExistingReadings("1984", dir) // => ["1984.md", "1984-02.md", "1984-03.md"]
 */
export function findExistingReadings(baseSlug: string, readingsDir: string): string[] {
  if (!existsSync(readingsDir)) return [];

  const files = readdirSync(readingsDir);
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
 *
 * Determines the appropriate filename for a new reread entry.
 * If no existing files, returns base filename.
 * If existing files found, returns next numbered version with zero-padding.
 *
 * @param baseSlug - The base slug for the reading
 * @param readingsDir - Directory containing reading markdown files
 * @returns Next available filename with .md extension
 *
 * @example
 * // No existing files
 * getNextRereadFilename("1984", dir) // => "1984.md"
 *
 * // Base file exists
 * getNextRereadFilename("1984", dir) // => "1984-02.md"
 *
 * // Multiple rereads exist (1984.md, 1984-02.md)
 * getNextRereadFilename("1984", dir) // => "1984-03.md"
 */
export function getNextRereadFilename(baseSlug: string, readingsDir: string): string {
  const existingFiles = findExistingReadings(baseSlug, readingsDir);

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
 *
 * Retrieves metadata from the most recent reading entry for a given slug.
 * Parses frontmatter to extract finished date and counts total readings.
 *
 * @param baseSlug - The base slug to search for
 * @param readingsDir - Directory containing reading markdown files
 * @returns Object with date and count, or null if no readings exist
 *
 * @example
 * // Returns { date: "2024-01-15T00:00:00.000Z", count: 3 }
 * await getMostRecentReading("1984", dir)
 *
 * // Returns { date: null, count: 1 } for currently reading
 * await getMostRecentReading("dune", dir)
 */
export async function getMostRecentReading(
  baseSlug: string,
  readingsDir: string
): Promise<{ date: string | null; count: number } | null> {
  const existingFiles = findExistingReadings(baseSlug, readingsDir);
  if (existingFiles.length === 0) return null;

  // Read the most recent file to get its date
  const mostRecentFile = existingFiles[existingFiles.length - 1];
  if (!mostRecentFile) return null;

  const filepath = join(readingsDir, mostRecentFile);

  try {
    const content = await readFile(filepath, 'utf8');
    const { data } = matter(content);
    // Handle both Date objects and string dates from frontmatter
    const finishedValue: unknown = data.finished;
    let dateString: string | null = null;
    if (finishedValue) {
      dateString =
        finishedValue instanceof Date ? finishedValue.toISOString() : String(finishedValue);
    }
    return {
      date: dateString,
      count: existingFiles.length,
    };
  } catch {
    // If file read fails, return count without date
    return { date: null, count: existingFiles.length };
  }
}
