# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Build: `npm run build`
- Dev: `npm run dev` or `npm run dev:log` (with logging)
- Test: `npm test` or `npm run test:watch` (watching mode)
- Single test: `npm test -- -t "test name pattern"`
- Coverage: `npm run test:coverage`
- Lint: `npm run lint`
- CLI: `npm run vanity` (see CLI section below)

## Code Style

- Follow strict TypeScript - use explicit types, avoid `any`
- Component organization: feature-focused (`/quotes`, `/readings`) not technical layers
- Use hooks for state management and data fetching
- File naming: PascalCase for components, camelCase for utilities
- Always destructure props in component parameters
- Component JSDoc: Include detailed block comments for components
- Prefer functional components with explicit return types
- Detailed error handling with meaningful error messages
- Test files: place in `__tests__` folders alongside implementation

## Testing

- Use React Testing Library with Jest
- Mock external APIs, not internal collaborators
- Cover happy path and error states
- Test components through user interactions, not implementation

## CLI Usage

The Vanity CLI tool manages quotes and readings content through interactive commands.

### Setup

```bash
# Run any CLI command
npm run vanity -- [command]

# Get help
npm run vanity -- --help
npm run vanity -- quote --help
npm run vanity -- reading --help
```

### Quote Management

```bash
# Add a new quote (opens $EDITOR for quote and author)
npm run vanity -- quote add

# List recent quotes (default: 10)
npm run vanity -- quote list
npm run vanity -- quote list -n 20  # Show 20 quotes
```

**Quote Storage:**

- Saved to `/content/quotes/[ID].md` with auto-incremented IDs
- Format: YAML frontmatter with `author` and `id` fields
- Quote text in markdown body

### Reading Management

```bash
# Add a new reading (interactive prompts)
npm run vanity -- reading add

# List recent readings (default: 10)
npm run vanity -- reading list
npm run vanity -- reading list -n 5  # Show 5 readings
```

**Reading Features:**

- Interactive prompts for title, author, finish status
- Cover image support (URL or local file)
- Local images optimized to 400x600 WebP
- Optional thoughts via $EDITOR
- Saved to `/content/readings/[slug].md`

### Environment

- Set `EDITOR` or `VISUAL` environment variable for preferred editor
- Default editor: `vi`
- Example: `export EDITOR=nvim`

### File Structure

```
content/
├── quotes/
│   ├── 0001.md
│   ├── 0002.md
│   └── ...
└── readings/
    ├── book-title.md
    └── ...

public/images/readings/
└── book-title.webp  # Optimized cover images
```

### Error Handling

- Invalid image paths are validated before processing
- File size limit: 10MB for images
- Supported image formats: .jpg, .jpeg, .png, .gif, .webp, .avif
- Falls back to vi if EDITOR not set
- Helpful error messages guide troubleshooting
