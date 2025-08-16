# Architecture

**Vanity** is a static site built with Next.js 15, featuring markdown-based content management and a minimalist design philosophy.

## Core Principles

- **Static First**: No database, no server state, no authentication complexity
- **Content as Code**: All content stored as markdown files with YAML frontmatter
- **CLI-Driven**: Custom TypeScript CLI tools for content management
- **Simplicity**: Zero unnecessary abstractions or enterprise patterns

## Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.4 (strict mode)
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (server state) + Zustand (UI state)
- **Maps**: Leaflet/React-Leaflet (code-split for performance)

### Content Management

- **Storage**: Markdown files with YAML frontmatter in `/content/`
- **Parsing**: gray-matter for frontmatter extraction
- **CLI Tools**: Custom TypeScript CLI (`npm run vanity`)
- **Images**: WebP optimization for reading covers

### Build & Deployment

- **Build**: Next.js static generation
- **Testing**: Jest + React Testing Library (158 tests, 100% passing)
- **Linting**: ESLint + Prettier + TypeScript strict mode
- **Deployment**: Static files to Vercel

## Content Architecture

```
content/
├── quotes/           # 349+ quotes as numbered markdown files
│   ├── 0001.md      # YAML: author, id | Content: quote text
│   └── ...
├── readings/         # 200+ book reviews as slug-based files
│   ├── book-name.md # YAML: title, author, finished, coverImage | Content: thoughts
│   └── ...
├── places/           # 91 travel locations for interactive map
│   └── ...
└── projects/         # 9 personal projects showcase
    └── ...
```

### Content Format Examples

**Quote (`/content/quotes/0042.md`)**:

```markdown
---
author: 'Douglas Adams'
id: 42
---

The answer to life, the universe, and everything.
```

**Reading (`/content/readings/dune.md`)**:

```markdown
---
title: 'Dune'
author: 'Frank Herbert'
finished: '2024-03-15'
coverImage: 'https://covers.example.com/dune.jpg'
rating: 5
---

Epic space opera with incredible world-building...
```

## Application Structure

```
/
├── cli/                     # Content management CLI tools
│   ├── commands/            # CLI command implementations
│   ├── lib/                 # CLI utilities (editor integration)
│   └── types/               # CLI type definitions
├── content/                 # All markdown content
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes (serve static content)
│   │   ├── components/      # React components
│   │   ├── map/             # Interactive map page
│   │   ├── readings/        # Readings list page
│   │   └── projects/        # Projects showcase page
│   ├── lib/
│   │   ├── data.ts          # Markdown parsing functions
│   │   └── logger.ts        # Winston structured logging
│   ├── store/               # Zustand state management
│   └── types/               # TypeScript type definitions
└── public/images/           # Static assets (optimized WebP)
```

## Data Flow

1. **Content Creation**: CLI tools create/edit markdown files in `/content/`
2. **Build Time**: Next.js reads markdown files via `src/lib/data.ts`
3. **Runtime**: API routes serve parsed content as JSON
4. **Frontend**: Components fetch data via TanStack Query
5. **State**: UI state managed by Zustand, server state by TanStack Query

## Performance Optimizations

- **Code Splitting**: Map component dynamically loaded (140KB Leaflet only when needed)
- **Image Optimization**: All reading covers converted to WebP format
- **Bundle Size**: ~100KB shared chunk (much smaller than original 2MB assumption)
- **Static Generation**: No server dependencies enable static export capability

## Security

- **Content Security Policy**: Comprehensive CSP headers via `next.config.ts`
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **No Authentication**: Zero attack surface from auth systems
- **Static Files**: No server-side vulnerabilities

## Development Workflow

### Content Management

```bash
# Add new quote
npm run vanity -- quote add

# Add new reading
npm run vanity -- reading add

# List recent content
npm run vanity -- quote list -n 10
npm run vanity -- reading list -n 5
```

### Development

```bash
# Development with logging
npm run dev:log

# Testing
npm test
npm run test:coverage

# Quality checks
npm run lint
npm run typecheck
```

## Deployment Strategy

**Current**: Server-side rendering with API routes

- Deploy to Vercel with Node.js runtime
- API routes serve static content from markdown files
- Dynamic features like search and pagination work seamlessly

**Future**: Static export capability

- Enable `output: 'export'` in `next.config.js`
- Replace API calls with direct imports in components
- Deploy as pure static files (JAMstack)

## Design Philosophy

> "It's done when there's nothing left to remove, not when there's nothing left to add." - John Carmack

Every architectural decision prioritizes:

1. **Simplicity**: No unnecessary abstractions
2. **Maintainability**: Clear separation of concerns
3. **Performance**: Minimal bundle, optimized assets
4. **Developer Experience**: Type-safe, well-tested, documented

## Anti-Patterns Avoided

- ❌ Enterprise patterns for personal site
- ❌ Database for static content
- ❌ Authentication for public content
- ❌ Complex state management for simple data
- ❌ Over-engineering for unknown future requirements

## Simplification Opportunities

The architecture continues to evolve toward simplicity:

- **Winston Logging**: 44 files import enterprise logging - consider `console.log` for development
- **TanStack Query**: Complex caching for static files - plain `fetch` might suffice
- **Interactive Map**: 140KB dependency for 91 locations - evaluate usage analytics

---

_This is the complete architecture. No databases, no microservices, no enterprise patterns. Just markdown, TypeScript, and the web platform._
