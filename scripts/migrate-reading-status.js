#!/usr/bin/env node

/**
 * Migration Script: Reading Status Simplification
 *
 * This script migrates from a three-state reading system (reading/finished/dropped)
 * to a two-state system (reading/finished) by:
 * 1. Creating backups of dropped reading files
 * 2. Safely deleting dropped reading files from content directory
 * 3. Removing 'dropped' field from remaining reading frontmatter
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory paths
const readingsDir = path.join(process.cwd(), 'content/readings');
const backupDir = path.join(process.cwd(), 'archive/dropped-readings-backup');

// Color logging functions (following project patterns)
const chalk = {
  green: text => `\x1b[32m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  gray: text => `\x1b[90m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`,
};

/**
 * Ensures backup directory exists
 */
function ensureBackupDirectory() {
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log(chalk.green(`✓ Created backup directory: ${backupDir}`));
    } else {
      console.log(chalk.gray(`✓ Backup directory exists: ${backupDir}`));
    }
  } catch (error) {
    console.error(chalk.red('✖ Failed to create backup directory:'), error);
    process.exit(1);
  }
}

/**
 * Scans readings directory and identifies dropped reading files
 * @returns {Array} Array of dropped reading file objects
 */
function identifyDroppedReadings() {
  console.log(chalk.cyan('🔍 Scanning for dropped readings...'));

  try {
    if (!fs.existsSync(readingsDir)) {
      console.error(chalk.red(`✖ Readings directory not found: ${readingsDir}`));
      process.exit(1);
    }

    const files = fs.readdirSync(readingsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    const droppedFiles = [];

    console.log(chalk.gray(`  Scanning ${markdownFiles.length} markdown files...`));

    markdownFiles.forEach(file => {
      const filePath = path.join(readingsDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);

        if (data.dropped === true) {
          droppedFiles.push({
            filename: file,
            filepath: filePath,
            title: data.title || 'Unknown Title',
            author: data.author || 'Unknown Author',
          });
        }
      } catch (parseError) {
        console.warn(chalk.yellow(`⚠️  Could not parse ${file}:`, parseError.message));
      }
    });

    return droppedFiles;
  } catch (error) {
    console.error(chalk.red('✖ Error scanning readings directory:'), error);
    process.exit(1);
  }
}

/**
 * Creates backup copies of dropped reading files
 * @param {Array} droppedFiles Array of dropped reading file objects
 */
function createBackups(droppedFiles) {
  if (droppedFiles.length === 0) {
    console.log(chalk.gray('  No backups needed.'));
    return;
  }

  console.log(chalk.cyan(`📦 Creating backups of ${droppedFiles.length} dropped readings...`));

  droppedFiles.forEach(({ filename, filepath, title, author }) => {
    try {
      const backupPath = path.join(backupDir, filename);
      fs.copyFileSync(filepath, backupPath);
      console.log(chalk.green(`  ✓ Backed up: ${title} by ${author}`));
    } catch (error) {
      console.error(chalk.red(`  ✖ Failed to backup ${filename}:`), error.message);
      process.exit(1);
    }
  });
}

/**
 * Safely deletes dropped reading files from content directory
 * @param {Array} droppedFiles Array of dropped reading file objects
 */
function deleteDroppedFiles(droppedFiles) {
  if (droppedFiles.length === 0) {
    console.log(chalk.gray('  No files to delete.'));
    return;
  }

  console.log(chalk.cyan(`🗑️  Deleting ${droppedFiles.length} dropped reading files...`));

  droppedFiles.forEach(({ filename, filepath, title, author }) => {
    try {
      fs.unlinkSync(filepath);
      console.log(chalk.green(`  ✓ Deleted: ${title} by ${author}`));
    } catch (error) {
      console.error(chalk.red(`  ✖ Failed to delete ${filename}:`), error.message);
      // Don't exit here, continue with other files
    }
  });
}

/**
 * Removes 'dropped' field from remaining reading frontmatter
 */
function cleanupRemainingFrontmatter() {
  console.log(chalk.cyan('🧹 Cleaning up frontmatter in remaining files...'));

  try {
    const files = fs.readdirSync(readingsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    let updatedCount = 0;

    markdownFiles.forEach(file => {
      const filePath = path.join(readingsDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { data, content: markdownContent } = matter(content);

        // Only update if 'dropped' field exists
        if ('dropped' in data) {
          delete data.dropped;

          // Reconstruct the file with updated frontmatter
          const updatedContent = matter.stringify(markdownContent, data);
          fs.writeFileSync(filePath, updatedContent);
          updatedCount++;

          console.log(chalk.green(`  ✓ Cleaned frontmatter: ${file}`));
        }
      } catch (parseError) {
        console.warn(chalk.yellow(`  ⚠️  Could not process ${file}:`, parseError.message));
      }
    });

    console.log(chalk.green(`✓ Updated frontmatter in ${updatedCount} files`));
  } catch (error) {
    console.error(chalk.red('✖ Error cleaning frontmatter:'), error);
    process.exit(1);
  }
}

/**
 * Main migration function
 */
function main() {
  console.log(chalk.cyan('🚀 Starting Reading Status Migration'));
  console.log(
    chalk.gray(
      '   Migrating from three-state (reading/finished/dropped) to two-state (reading/finished)\n'
    )
  );

  try {
    // Step 1: Ensure backup directory exists
    ensureBackupDirectory();

    // Step 2: Identify dropped reading files
    const droppedFiles = identifyDroppedReadings();

    if (droppedFiles.length === 0) {
      console.log(chalk.green('✅ No dropped readings found. Migration complete!'));
      return;
    }

    console.log(chalk.yellow(`📋 Found ${droppedFiles.length} dropped readings:`));
    droppedFiles.forEach(({ title, author, filename }) => {
      console.log(chalk.gray(`   • ${title} by ${author} (${filename})`));
    });
    console.log('');

    // Step 3: Create backups
    createBackups(droppedFiles);
    console.log('');

    // Step 4: Delete dropped files
    deleteDroppedFiles(droppedFiles);
    console.log('');

    // Step 5: Clean up frontmatter in remaining files
    cleanupRemainingFrontmatter();
    console.log('');

    // Success summary
    console.log(chalk.green('✅ Reading Status Migration Complete!'));
    console.log(
      chalk.gray(`   • Backed up ${droppedFiles.length} dropped readings to: ${backupDir}`)
    );
    console.log(chalk.gray(`   • Deleted ${droppedFiles.length} dropped reading files`));
    console.log(chalk.gray(`   • Cleaned 'dropped' field from remaining frontmatter`));
    console.log(chalk.gray(`   • Reading status system simplified to: reading/finished`));
  } catch (error) {
    console.error(chalk.red('\n✖ Migration failed:'), error);
    console.error(
      chalk.gray('   Check the error above and ensure backups are safe before retrying.')
    );
    process.exit(1);
  }
}

// Execute migration if run directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  identifyDroppedReadings,
  createBackups,
  deleteDroppedFiles,
  cleanupRemainingFrontmatter,
};
