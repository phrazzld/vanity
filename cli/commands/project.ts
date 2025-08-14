import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import slugify from 'slugify';
import { getProjects } from '../../src/lib/data';

const PROJECTS_DIR = join(process.cwd(), 'content', 'projects');

/**
 * Adds a new project interactively using inquirer prompts
 */
export async function addProject(): Promise<void> {
  console.log(chalk.cyan("🚀 Let's add a new project...\n"));

  try {
    // Basic project info
    const basicInfo = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Project title:',
        validate: input => (input.trim() ? true : 'Title is required'),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        validate: input => (input.trim() ? true : 'Description is required'),
      },
    ]);

    // Tech stack prompt
    const { techStackInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'techStackInput',
        message: 'Tech stack (comma-separated, e.g., "react, typescript, tailwind"):',
        validate: input => (input.trim() ? true : 'At least one technology is required'),
      },
    ]);

    // Parse tech stack
    const techStack = techStackInput
      .split(',')
      .map((tech: string) => tech.trim().toLowerCase())
      .filter((tech: string) => tech.length > 0);

    // URLs prompts
    const { hasSiteUrl } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'hasSiteUrl',
        message: 'Does this project have a live site URL?',
        default: true,
      },
    ]);

    let siteUrl: string | undefined;
    if (hasSiteUrl) {
      const { url } = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Site URL:',
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
      siteUrl = url;
    }

    const { hasCodeUrl } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'hasCodeUrl',
        message: 'Does this project have a GitHub/code repository URL?',
        default: true,
      },
    ]);

    let codeUrl: string | undefined;
    if (hasCodeUrl) {
      const { url } = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Code repository URL:',
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
      codeUrl = url;
    }

    // Image handling
    const { imageChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'imageChoice',
        message: 'Project image:',
        choices: [
          { name: '📁 Use existing image from /public/images/projects/', value: 'existing' },
          { name: '⏭️  Skip - Use placeholder', value: 'skip' },
        ],
      },
    ]);

    let imageSrc = '/images/projects/placeholder.webp';
    if (imageChoice === 'existing') {
      const { imageName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'imageName',
          message: 'Image filename (e.g., "waves-01.webp"):',
          validate: input => (input.trim() ? true : 'Filename is required'),
        },
      ]);
      imageSrc = `/images/projects/${imageName}`;
    }

    // Alt text for image
    const altText = `${basicInfo.title} screenshot`;

    // Get next order number
    let order = 1;
    try {
      const projects = getProjects();
      if (projects.length > 0) {
        order = Math.max(...projects.map(p => p.order || 0)) + 1;
      }
    } catch {
      // If no projects exist yet, start at 1
    }

    // Show preview
    console.log('\n' + chalk.cyan('📋 Project Preview:'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.bold(basicInfo.title));
    console.log(chalk.gray(basicInfo.description));
    console.log(chalk.gray('Tech: ') + techStack.join(', '));
    if (siteUrl) console.log(chalk.gray('Site: ') + siteUrl);
    if (codeUrl) console.log(chalk.gray('Code: ') + codeUrl);
    console.log(chalk.gray('Order: ') + order);
    console.log(chalk.gray('─'.repeat(40)) + '\n');

    // Confirm save
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Save this project?',
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('✖ Project creation cancelled.'));
      return;
    }

    // Generate filename and create content
    const slug = slugify(basicInfo.title, { lower: true, strict: true });
    const filename = `${slug}.md`;
    const filepath = join(PROJECTS_DIR, filename);

    // Check if file already exists
    if (existsSync(filepath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: chalk.yellow(`⚠️  ${filename} already exists. Overwrite?`),
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('✖ Project creation cancelled.'));
        return;
      }
    }

    // Create the project file content
    const frontmatter: any = {
      title: basicInfo.title,
      description: basicInfo.description,
      techStack,
      imageSrc,
      altText,
      order,
    };

    if (siteUrl) {
      frontmatter.siteUrl = siteUrl;
    }

    if (codeUrl) {
      frontmatter.codeUrl = codeUrl;
    }

    const yamlLines = [
      '---',
      `title: ${basicInfo.title}`,
      `description: ${basicInfo.description}`,
      'techStack:',
      ...techStack.map((tech: string) => `  - ${tech}`),
    ];

    if (siteUrl) {
      yamlLines.push(`siteUrl: ${siteUrl}`);
    }

    if (codeUrl) {
      yamlLines.push(`codeUrl: ${codeUrl}`);
    }

    yamlLines.push(`imageSrc: ${imageSrc}`, `altText: ${altText}`, `order: ${order}`, '---');

    const fileContent = yamlLines.join('\n');

    // Ensure projects directory exists
    try {
      if (!existsSync(PROJECTS_DIR)) {
        await mkdir(PROJECTS_DIR, { recursive: true });
      }
    } catch (dirError) {
      console.error(chalk.red('✖ Failed to create projects directory:'), dirError);
      process.exit(1);
    }

    // Write the file
    try {
      await writeFile(filepath, fileContent);
      console.log(chalk.green(`\n✅ Project "${basicInfo.title}" saved to ${filename}`));
      console.log(chalk.gray(`   Order: ${order}`));
    } catch (writeError) {
      console.error(chalk.red('✖ Failed to save project file:'), writeError);
      console.log(chalk.gray(`  Attempted to write to: ${filepath}`));
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('prompt')) {
      console.log(chalk.yellow('\n✖ Project creation cancelled.'));
    } else {
      console.error(chalk.red('✖ Error adding project:'), error);
      process.exit(1);
    }
  }
}

/**
 * Lists projects with formatting
 * @param limit Number of projects to show (default 10)
 */
export function listProjects(limit: number = 10): void {
  try {
    const projects = getProjects();
    const recentProjects = projects.slice(0, limit);

    if (recentProjects.length === 0) {
      console.log(chalk.yellow('No projects found.'));
      return;
    }

    console.log(
      chalk.cyan(`\n🚀 Projects (showing ${recentProjects.length} of ${projects.length})\n`)
    );

    recentProjects.forEach((project, index) => {
      console.log(chalk.bold(project.title));
      console.log(chalk.gray('   ') + project.description);
      console.log(chalk.gray('   Tech: ') + project.techStack.join(', '));

      const links = [];
      if (project.siteUrl) links.push(chalk.blue('[site]'));
      if (project.codeUrl) links.push(chalk.blue('[code]'));
      if (links.length > 0) {
        console.log(chalk.gray('   ') + links.join(' '));
      }

      if (index < recentProjects.length - 1) {
        console.log();
      }
    });

    console.log(chalk.gray(`\nTotal projects: ${projects.length}`));
  } catch (error) {
    console.error(chalk.red('✖ Error listing projects:'), error);
    process.exit(1);
  }
}
