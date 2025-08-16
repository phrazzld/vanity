import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawnSync } from 'child_process';

/**
 * Opens a temporary file in the user's preferred editor
 * @param initialContent Initial content for the file
 * @param extension File extension for syntax highlighting
 * @returns The edited content or null if cancelled
 */
export async function openEditor(
  initialContent: string = '',
  extension: string = '.md'
): Promise<string | null> {
  const editor = process.env.EDITOR || process.env.VISUAL || 'vi';
  const tmpFile = join(tmpdir(), `vanity-${Date.now()}${extension}`);

  try {
    // Write initial content to temp file
    writeFileSync(tmpFile, initialContent);

    // Open editor and wait for it to close
    const result = spawnSync(editor, [tmpFile], {
      stdio: 'inherit',
      shell: true,
    });

    if (result.error) {
      throw result.error;
    }

    // Read the edited content
    const editedContent = readFileSync(tmpFile, 'utf-8');

    // Clean up temp file
    unlinkSync(tmpFile);

    // Return null if content is unchanged or empty
    if (editedContent.trim() === initialContent.trim() || editedContent.trim() === '') {
      return null;
    }

    return editedContent;
  } catch (error) {
    // Clean up on error
    try {
      unlinkSync(tmpFile);
    } catch {}

    const editorError = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to open editor '${editor}': ${editorError}. Try setting EDITOR environment variable.`
    );
  }
}
