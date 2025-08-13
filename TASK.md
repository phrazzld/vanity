# TASK: Migrate from Neon Database to Markdown-Based Content System

## Executive Summary

Replace the Neon PostgreSQL database with a Git-based Markdown content system for managing quotes and readings. This "Gordian cut" eliminates ~80% of complexity while improving developer experience, reducing costs, and maintaining all necessary functionality.

**Key Decision**: Individual Markdown files with frontmatter, aggregated at build time.

## Current State Analysis

### What We Have Now

- **Neon PostgreSQL** managed database with preview branching
- **Prisma ORM** with migrations and type generation
- **Complex API routes** (416 lines just for quotes CRUD)
- **Enterprise logging** with correlation IDs and Winston
- **Authentication system** for admin operations
- **Two simple models**: Quotes (id, text, author) and Readings (id, title, author, date, etc.)

### The Problem

- **Massive overkill** for ~100 quotes and ~50 books
- **Monthly costs** ($19+/month = $228+/year)
- **Deployment complexity** with database branching
- **2000+ lines of code** for simple CRUD operations
- **External dependency** that can fail or change pricing

### Data Volume Reality Check

- **Current**: Likely <100 quotes, <50 readings
- **10-year projection**: ~1200 quotes, ~480 readings max
- **Update frequency**: 5-10 quotes/month, 2-4 books/month
- **Relationships**: Zero (no joins, no foreign keys)

## Target Architecture

### File Structure

```
/content/
  /quotes/
    /_template.md                 # Template for new quotes
    /001-da-vinci-simplicity.md   # Individual quote files
    /002-aurelius-power.md        # Named with ID and slug
    /003-feynman-learning.md
    ...
  /readings/
    /_template.md                 # Template for new readings
    /2024/
      /01-dune.md
      /02-neuromancer.md
    /2025/
      /01-foundation.md

/public/data/                    # Build-time generated
  quotes.json                     # Aggregated for client
  readings.json                   # Aggregated for client

/scripts/
  add-quote.ts                    # CLI for adding quotes
  add-reading.ts                  # CLI for adding readings
  build-data.ts                   # Build-time aggregation
  migrate-from-neon.ts            # One-time migration script
```

### Quote Markdown Format

```markdown
---
id: 1
author: Leonardo da Vinci
tags: [simplicity, design, philosophy]
source: Notebooks
created: 2024-01-15
---

Simplicity is the ultimate sophistication.
```

### Reading Markdown Format

```markdown
---
slug: dune
title: Dune
author: Frank Herbert
finished: 2024-01-15
rating: 5
coverImage: dune.jpg
dropped: false
tags: [science-fiction, classic, politics]
---

## Thoughts

The spice must flow! This book fundamentally changed how I think about resource scarcity,
politics, and the intersection of religion and power. Herbert's world-building is unmatched.

## Key Quotes

> "Fear is the mind-killer. Fear is the little-death that brings total obliteration."

> "The mystery of life isn't a problem to solve, but a reality to experience."

## What I Learned

- Ecology and politics are inseparable
- Water as currency is a fascinating concept
- The danger of prescience and predetermined futures
```

## Implementation Phases

### Phase 1: Setup & Migration Script [2 hours]

#### 1.1 Create Directory Structure

```bash
mkdir -p content/quotes
mkdir -p content/readings/2024 content/readings/2025
mkdir -p scripts
mkdir -p public/data
```

#### 1.2 Create Migration Script

```typescript
// scripts/migrate-from-neon.ts
import { PrismaClient } from '@prisma/client';
import matter from 'gray-matter';
import fs from 'fs/promises';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function migrateQuotes() {
  const quotes = await prisma.quote.findMany();

  for (const quote of quotes) {
    const slug = slugify(`${quote.author || 'unknown'}-${quote.text.slice(0, 20)}`).toLowerCase();

    const content = matter.stringify(quote.text, {
      id: quote.id,
      author: quote.author || 'Unknown',
      created: new Date().toISOString(),
      migrated: true,
    });

    const filename = `${quote.id.toString().padStart(3, '0')}-${slug}.md`;
    await fs.writeFile(`./content/quotes/${filename}`, content);
  }
}

async function migrateReadings() {
  const readings = await prisma.reading.findMany();

  for (const reading of readings) {
    const year = reading.finishedDate?.getFullYear() || 'undated';
    const month = reading.finishedDate?.getMonth() + 1 || 1;

    const content = matter.stringify(reading.thoughts || '', {
      slug: reading.slug,
      title: reading.title,
      author: reading.author,
      finished: reading.finishedDate?.toISOString(),
      coverImage: reading.coverImageSrc,
      dropped: reading.dropped,
      migrated: true,
    });

    const filename = `${month.toString().padStart(2, '0')}-${reading.slug}.md`;
    await fs.writeFile(`./content/readings/${year}/${filename}`, content);
  }
}
```

### Phase 2: Content Management Tools [3 hours]

#### 2.1 Add Quote Script

```typescript
// scripts/add-quote.ts
import inquirer from 'inquirer';
import matter from 'gray-matter';
import fs from 'fs/promises';
import slugify from 'slugify';

async function getNextId(): Promise<number> {
  const files = await fs.readdir('./content/quotes');
  const ids = files
    .filter(f => f.endsWith('.md'))
    .map(f => parseInt(f.split('-')[0]))
    .filter(n => !isNaN(n));
  return Math.max(0, ...ids) + 1;
}

async function addQuote() {
  const answers = await inquirer.prompt([
    {
      name: 'author',
      message: 'Author:',
      default: 'Unknown',
    },
    {
      name: 'text',
      message: 'Quote (opens editor):',
      type: 'editor',
    },
    {
      name: 'tags',
      message: 'Tags (comma-separated):',
      default: '',
    },
    {
      name: 'source',
      message: 'Source (book, article, etc.):',
      default: '',
    },
  ]);

  const id = await getNextId();
  const slug = slugify(`${answers.author}-${answers.text.slice(0, 30)}`).toLowerCase();

  const content = matter.stringify(answers.text.trim(), {
    id,
    author: answers.author,
    tags: answers.tags ? answers.tags.split(',').map(t => t.trim()) : [],
    source: answers.source || undefined,
    created: new Date().toISOString(),
  });

  const filename = `${id.toString().padStart(3, '0')}-${slug}.md`;
  await fs.writeFile(`./content/quotes/${filename}`, content);

  console.log(`✅ Created: content/quotes/${filename}`);
  console.log(`📝 Quote #${id} by ${answers.author}`);
}

addQuote().catch(console.error);
```

#### 2.2 Add Reading Script

```typescript
// scripts/add-reading.ts
import inquirer from 'inquirer';
import matter from 'gray-matter';
import fs from 'fs/promises';
import slugify from 'slugify';

async function addReading() {
  const answers = await inquirer.prompt([
    {
      name: 'title',
      message: 'Book Title:',
      validate: input => input.length > 0,
    },
    {
      name: 'author',
      message: 'Author:',
      validate: input => input.length > 0,
    },
    {
      name: 'finished',
      message: 'Date Finished (YYYY-MM-DD):',
      default: new Date().toISOString().split('T')[0],
    },
    {
      name: 'rating',
      message: 'Rating (1-5):',
      type: 'number',
      default: 3,
      validate: input => input >= 1 && input <= 5,
    },
    {
      name: 'thoughts',
      message: 'Thoughts (opens editor):',
      type: 'editor',
    },
    {
      name: 'tags',
      message: 'Tags (comma-separated):',
      default: '',
    },
  ]);

  const slug = slugify(answers.title).toLowerCase();
  const date = new Date(answers.finished);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const content = matter.stringify(answers.thoughts.trim(), {
    slug,
    title: answers.title,
    author: answers.author,
    finished: answers.finished,
    rating: answers.rating,
    tags: answers.tags ? answers.tags.split(',').map(t => t.trim()) : [],
    dropped: false,
  });

  const dir = `./content/readings/${year}`;
  await fs.mkdir(dir, { recursive: true });

  const filename = `${month.toString().padStart(2, '0')}-${slug}.md`;
  await fs.writeFile(`${dir}/${filename}`, content);

  console.log(`✅ Created: ${dir}/${filename}`);
  console.log(`📚 "${answers.title}" by ${answers.author}`);
}

addReading().catch(console.error);
```

### Phase 3: Build-Time Data Aggregation [2 hours]

#### 3.1 Build Data Script

```typescript
// scripts/build-data.ts
import { glob } from 'glob';
import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';

interface Quote {
  id: number;
  text: string;
  author: string;
  tags?: string[];
  source?: string;
  created: string;
}

interface Reading {
  slug: string;
  title: string;
  author: string;
  finishedDate: string | null;
  coverImageSrc: string | null;
  thoughts: string;
  dropped: boolean;
  rating?: number;
  tags?: string[];
}

async function buildQuotes() {
  const files = await glob('./content/quotes/*.md');
  const quotes: Quote[] = [];

  for (const file of files.sort()) {
    if (file.includes('_template')) continue;

    const content = await fs.readFile(file, 'utf-8');
    const { data, content: text } = matter(content);

    quotes.push({
      id: data.id,
      text: text.trim(),
      author: data.author,
      tags: data.tags,
      source: data.source,
      created: data.created,
    });
  }

  await fs.writeFile('./public/data/quotes.json', JSON.stringify(quotes, null, 2));

  console.log(`✅ Built ${quotes.length} quotes`);
  return quotes;
}

async function buildReadings() {
  const files = await glob('./content/readings/**/*.md');
  const readings: Reading[] = [];

  for (const file of files.sort()) {
    if (file.includes('_template')) continue;

    const content = await fs.readFile(file, 'utf-8');
    const { data, content: thoughts } = matter(content);

    readings.push({
      slug: data.slug,
      title: data.title,
      author: data.author,
      finishedDate: data.finished || null,
      coverImageSrc: data.coverImage || null,
      thoughts: thoughts.trim(),
      dropped: data.dropped || false,
      rating: data.rating,
      tags: data.tags,
    });
  }

  // Sort by finished date (most recent first)
  readings.sort((a, b) => {
    if (!a.finishedDate) return 1;
    if (!b.finishedDate) return -1;
    return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
  });

  await fs.writeFile('./public/data/readings.json', JSON.stringify(readings, null, 2));

  console.log(`✅ Built ${readings.length} readings`);
  return readings;
}

async function buildData() {
  console.log('🔨 Building data from Markdown files...');

  await fs.mkdir('./public/data', { recursive: true });

  const [quotes, readings] = await Promise.all([buildQuotes(), buildReadings()]);

  // Generate stats
  const stats = {
    quotesCount: quotes.length,
    readingsCount: readings.length,
    booksThisYear: readings.filter(
      r => r.finishedDate && new Date(r.finishedDate).getFullYear() === new Date().getFullYear()
    ).length,
    lastUpdated: new Date().toISOString(),
  };

  await fs.writeFile('./public/data/stats.json', JSON.stringify(stats, null, 2));

  console.log('📊 Stats:', stats);
  console.log('✨ Data build complete!');
}

buildData().catch(console.error);
```

#### 3.2 Update package.json Scripts

```json
{
  "scripts": {
    "build": "npm run build:data && next build",
    "build:data": "tsx scripts/build-data.ts",
    "add:quote": "tsx scripts/add-quote.ts",
    "add:reading": "tsx scripts/add-reading.ts",
    "migrate:db": "tsx scripts/migrate-from-neon.ts"
  }
}
```

### Phase 4: Replace Data Layer [4 hours]

#### 4.1 New Data Access Layer

```typescript
// src/lib/data.ts
import quotesData from '@/public/data/quotes.json';
import readingsData from '@/public/data/readings.json';

export async function getQuotes() {
  return quotesData;
}

export async function getQuote(id: number) {
  return quotesData.find(q => q.id === id);
}

export async function getReadings() {
  return readingsData;
}

export async function getReading(slug: string) {
  return readingsData.find(r => r.slug === slug);
}

// For development/admin - writes directly to Markdown
export async function createQuote(data: { text: string; author: string }) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot modify data in production');
  }

  // Use the add-quote script logic
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  await execAsync(`npm run add:quote`, {
    input: JSON.stringify(data),
  });

  // Rebuild data
  await execAsync('npm run build:data');
}
```

#### 4.2 Simplify API Routes

```typescript
// src/app/api/quotes/route.ts (reduced from 416 lines to ~30)
import { getQuotes, getQuote } from '@/lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const quote = await getQuote(parseInt(id));
    return quote
      ? NextResponse.json(quote)
      : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const quotes = await getQuotes();
  return NextResponse.json(quotes);
}

// POST/PUT/DELETE only work in development
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Use GitHub to add quotes' }, { status: 405 });
  }
  // ... development-only implementation
}
```

### Phase 5: Clean Up [2 hours]

#### 5.1 Remove Dependencies

```bash
npm uninstall @prisma/client prisma
npm uninstall @neondatabase/serverless
```

#### 5.2 Delete Files

- `/prisma/` directory
- `/src/lib/db.ts`
- Complex API route implementations
- Database migration files

#### 5.3 Update Environment Variables

Remove from `.env.local`:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`

Update `.env.example` to reflect new setup

#### 5.4 Update Vercel Configuration

- Remove Neon integration
- Remove `prisma:generate` from build command
- Update environment variables

### Phase 6: Admin Interface Options [Optional, 3 hours]

#### Option A: GitHub-Based Admin

```typescript
// src/app/admin/add-quote/page.tsx
'use client';

import { Octokit } from '@octokit/rest';
import { useState } from 'react';

export default function AddQuotePage() {
  const [quote, setQuote] = useState({ text: '', author: '' });

  const handleSubmit = async () => {
    const octokit = new Octokit({
      auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
    });

    const id = Date.now(); // or fetch next ID
    const filename = `content/quotes/${id}-new.md`;
    const content = `---
id: ${id}
author: ${quote.author}
created: ${new Date().toISOString()}
---

${quote.text}`;

    await octokit.repos.createOrUpdateFileContents({
      owner: 'phrazzld',
      repo: 'vanity',
      path: filename,
      message: `Add quote by ${quote.author}`,
      content: Buffer.from(content).toString('base64'),
    });

    // Trigger Vercel rebuild
    await fetch('/api/revalidate');
  };

  // ... form UI
}
```

#### Option B: Local-Only Admin

Keep the admin interface but make it clear it only works locally:

```typescript
if (process.env.NODE_ENV === 'production') {
  return <div>Admin only works in development. Use GitHub to edit content.</div>;
}
```

## Benefits & Tradeoffs

### What We Gain

- **💰 Cost**: $0/month (save $228+/year)
- **🚀 Performance**: No network latency, instant reads
- **🛠 Simplicity**: ~80% less code (remove ~1500 lines)
- **📦 Dependencies**: Remove Prisma, Neon, database drivers
- **🔄 Version Control**: Every quote change tracked in Git
- **🎯 Deployment**: No database URLs, no migrations, just works
- **🔍 Searchability**: `grep` works, or use frontend search
- **✏️ Editing**: Any text editor works, no SQL needed
- **🔒 Backup**: It's in Git, forever

### What We Lose

- **Complex Queries**: No SQL (but we never used it)
- **Real-time Updates**: Need rebuild for new content
- **Concurrent Editing**: Git conflicts possible (rare)
- **Scale Beyond 10k Items**: Would need indexing

### Migration Checklist

- [ ] Backup current database
- [ ] Run migration script to export to Markdown
- [ ] Verify all content migrated correctly
- [ ] Set up build:data script in package.json
- [ ] Replace data access layer
- [ ] Simplify API routes
- [ ] Test locally with Markdown files
- [ ] Remove database dependencies
- [ ] Update environment variables
- [ ] Deploy to preview branch
- [ ] Test in production-like environment
- [ ] Disconnect Neon from Vercel
- [ ] Merge to main
- [ ] Celebrate massive simplification! 🎉

## Future Evolution Path

```
Year 1-3: Markdown files → Perfect
Year 3-5: Add search index → Still good
Year 5-7: Consider SQLite → If needed
Year 7+: Maybe PostgreSQL → If you have 10,000+ items
```

The beauty: Each evolution is an **addition**, not a rewrite.

## Quick Commands Reference

```bash
# One-time migration
npm run migrate:db

# Daily usage
npm run add:quote      # Interactive quote addition
npm run add:reading    # Interactive reading addition
npm run build:data     # Rebuild JSON from Markdown

# Development
npm run dev           # Auto-rebuilds data on file changes

# Deployment
git add content/
git commit -m "Add new quotes"
git push              # Vercel rebuilds automatically
```

## Success Metrics

- ✅ All quotes and readings migrated
- ✅ Build time < 1 second for data aggregation
- ✅ Zero database-related environment variables
- ✅ API routes < 50 lines each
- ✅ No external service dependencies for content
- ✅ Git repo size < 10MB with all content
- ✅ Monthly cost: $0

## Philosophy Alignment

This migration embodies:

- **Simplicity**: The right tool for the job
- **Pragmatism**: Markdown > Database for static content
- **Efficiency**: 80% less code for 100% functionality
- **Ownership**: Your data in your repo, forever
- **Evolution**: Start simple, grow as needed

---

_"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry_

This is our Gordian cut. 🗡️
