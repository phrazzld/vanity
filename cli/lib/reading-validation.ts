import slugify from 'slugify';

/**
 * Validates and normalizes a date input string
 *
 * Accepts various date formats and normalizes to ISO 8601.
 * Validates that the date is parseable and not in the future.
 *
 * @param dateInput - Date string in YYYY-MM-DD or ISO format
 * @returns ISO 8601 date string
 * @throws Error if date is invalid or in the future
 *
 * @example
 * validateDateInput("2024-01-15") // => "2024-01-15T00:00:00.000Z"
 * validateDateInput("invalid") // throws Error
 */
export function validateDateInput(dateInput: string): string {
  if (!dateInput || !dateInput.trim()) {
    throw new Error('Date is required');
  }

  const date = new Date(dateInput);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    throw new Error('Please enter a valid date (YYYY-MM-DD)');
  }

  // Check if date is not in the future
  if (date > new Date()) {
    throw new Error('Date cannot be in the future');
  }

  return date.toISOString();
}

/**
 * Generates a URL-safe slug from a title
 *
 * Creates a lowercase, hyphenated slug suitable for filenames and URLs.
 * Removes special characters and normalizes spaces.
 *
 * @param title - Book title or text to slugify
 * @returns URL-safe slug
 *
 * @example
 * sanitizeSlug("Don't Make Me Think") // => "dont-make-me-think"
 * sanitizeSlug("1984") // => "1984"
 * sanitizeSlug("War & Peace") // => "war-and-peace"
 */
export function sanitizeSlug(title: string): string {
  if (!title || !title.trim()) {
    throw new Error('Title is required for slug generation');
  }

  return slugify(title, { lower: true, strict: true });
}

/**
 * Validates a date input for use in inquirer prompts
 *
 * Returns true if valid, or an error message string if invalid.
 * This format is compatible with inquirer's validate function.
 *
 * @param input - Date string to validate
 * @returns true if valid, error message if invalid
 *
 * @example
 * // In inquirer prompt
 * validate: validateDateForPrompt
 */
export function validateDateForPrompt(input: string): true | string {
  if (!input || !input.trim()) {
    return true; // Allow empty (optional date)
  }

  try {
    validateDateInput(input);
    return true;
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid date';
  }
}
