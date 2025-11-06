import { existsSync, readdirSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

/**
 * Information about a parsed reread slug
 */
export interface RereadSlugInfo {
  /** Base slug without numeric suffix */
  baseSlug: string;
  /** Sequence number (1 for base file, 2+ for rereads) */
  sequence: number;
}

/**
 * Map of base slugs to their associated filenames
 */
export type RereadMap = Map<string, string[]>;

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

/**
 * Parse a reading slug to extract base slug and sequence number
 *
 * Analyzes filename slugs to identify rereads based on numeric suffixes.
 * Base files (no suffix) have sequence 1, numbered files have their suffix value.
 *
 * @param slug - Filename without .md extension (e.g., "gatsby-02")
 * @returns Object with baseSlug and sequence, or null for invalid input
 *
 * @example
 * parseRereadSlug("gatsby") // => { baseSlug: "gatsby", sequence: 1 }
 * parseRereadSlug("gatsby-02") // => { baseSlug: "gatsby", sequence: 2 }
 * parseRereadSlug("how-to-read-a-book-03") // => { baseSlug: "how-to-read-a-book", sequence: 3 }
 */
export function parseRereadSlug(slug: string | null | undefined): RereadSlugInfo | null {
  if (!slug || typeof slug !== 'string') return null;

  const match = slug.match(/-(\d+)$/);

  if (!match) {
    // Base file without suffix
    return { baseSlug: slug, sequence: 1 };
  }

  // File with numeric suffix
  const baseSlug = slug.substring(0, match.index);
  const sequenceStr = match[1];
  if (!sequenceStr) return null;

  const sequence = parseInt(sequenceStr, 10);

  return { baseSlug, sequence };
}

/**
 * Build a map grouping reading files by their base slug
 *
 * Groups files like gatsby.md, gatsby-02.md, gatsby-03.md under the base slug "gatsby".
 * Files within each group are sorted with base file first, then by ascending sequence number.
 *
 * @param filenames - Array of markdown filenames (e.g., ["gatsby.md", "gatsby-02.md"])
 * @returns Map of base slugs to sorted arrays of filenames
 *
 * @example
 * buildRereadMap(["gatsby.md", "gatsby-02.md", "1984.md"])
 * // => Map { "gatsby" => ["gatsby.md", "gatsby-02.md"], "1984" => ["1984.md"] }
 */
export function buildRereadMap(filenames: string[]): RereadMap {
  const rereadMap: RereadMap = new Map();

  // Group files by base slug
  for (const filename of filenames) {
    const slug = filename.replace('.md', '');
    const parsed = parseRereadSlug(slug);

    if (!parsed) continue;

    const { baseSlug } = parsed;

    if (!rereadMap.has(baseSlug)) {
      rereadMap.set(baseSlug, []);
    }

    const files = rereadMap.get(baseSlug);
    if (files) {
      files.push(filename);
    }
  }

  // Sort files within each group
  for (const [, files] of rereadMap) {
    files.sort((a, b) => {
      const aNum = a.match(/-(\d+)\.md$/)?.[1];
      const bNum = b.match(/-(\d+)\.md$/)?.[1];
      if (!aNum && !bNum) return 0;
      if (!aNum) return -1;
      if (!bNum) return 1;
      return parseInt(aNum, 10) - parseInt(bNum, 10);
    });
  }

  return rereadMap;
}

/**
 * Compute the read count for a specific reading slug
 *
 * Determines which iteration of a book this represents (1st read, 2nd read, etc.)
 * by finding its position in the sorted group of related readings.
 *
 * @param slug - Filename without .md extension
 * @param rereadMap - Map from buildRereadMap()
 * @returns Read count (1 for first read, 2+ for rereads)
 *
 * @example
 * const map = buildRereadMap(["gatsby.md", "gatsby-02.md"]);
 * computeReadCount("gatsby", map) // => 1
 * computeReadCount("gatsby-02", map) // => 2
 */
export function computeReadCount(slug: string, rereadMap: RereadMap): number {
  const parsed = parseRereadSlug(slug);
  if (!parsed) return 1;

  const { baseSlug } = parsed;
  const files = rereadMap.get(baseSlug);

  if (!files || files.length === 0) return 1;

  // Find position of this slug in the sorted group
  const targetFilename = `${slug}.md`;
  const index = files.indexOf(targetFilename);

  // Return 1-indexed position (0 becomes 1, 1 becomes 2, etc.)
  return index !== -1 ? index + 1 : 1;
}

/**
 * Validate reread sequences and log warnings for issues
 *
 * Checks for common problems like missing base files or gaps in sequences.
 * Logs warnings but does not prevent processing (non-fatal validation).
 *
 * @param rereadMap - Map from buildRereadMap()
 *
 * @example
 * // Logs: "⚠️ gatsby: Found gatsby-04.md without gatsby-03.md (sequence gap)"
 * validateRereadSequences(map);
 */
export function validateRereadSequences(rereadMap: RereadMap): void {
  for (const [baseSlug, files] of rereadMap) {
    if (files.length === 1) continue;

    // Extract sequence numbers
    const sequences: number[] = [];
    for (const file of files) {
      const slug = file.replace('.md', '');
      const parsed = parseRereadSlug(slug);
      if (parsed) {
        sequences.push(parsed.sequence);
      }
    }

    sequences.sort((a, b) => a - b);

    // Check for missing base file
    if (sequences[0] !== 1) {
      console.warn(`⚠️ ${baseSlug}: Missing base file (starts at -0${sequences[0]})`);
    }

    // Check for sequence gaps
    for (let i = 1; i < sequences.length; i++) {
      const prev = sequences[i - 1];
      const curr = sequences[i];
      if (prev === undefined || curr === undefined) continue;

      const expected = prev + 1;
      const actual = curr;
      if (actual !== expected) {
        console.warn(
          `⚠️ ${baseSlug}: Expected -${String(expected).padStart(2, '0')} but found -${String(actual).padStart(2, '0')} (sequence gap)`
        );
      }
    }

    // Check for unusually high count (potential typo)
    if (sequences.length > 10) {
      console.warn(`⚠️ ${baseSlug}: ${sequences.length} rereads detected (verify this is correct)`);
    }
  }
}
