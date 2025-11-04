# CLAUDE.md

Operational guidance for Claude Code in the Vanity repository.

## Core Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run dev:log      # Dev with structured logging to logs/dev.log
npm test             # Run tests (single test: npm test -- -t "pattern")
npm run lint         # ESLint check
npm run typecheck    # TypeScript validation
npm run build        # Production build
```

## Content Management CLI

```bash
# Quotes - Auto-incremented IDs in /content/quotes/[ID].md
npm run vanity -- quote add         # Opens $EDITOR for quote + author
npm run vanity -- quote list -n 20  # List recent quotes

# Readings - Slug-based in /content/readings/[slug].md
npm run vanity -- reading add       # Interactive prompts (title, author, status, audiobook)
npm run vanity -- reading update    # Mark finished, add thoughts, or delete
npm run vanity -- reading list -n 5 # List recent readings

# Images auto-optimized to 400x600 WebP in public/images/readings/
```

## Code Conventions (Repository-Specific)

- **Component organization**: Feature-focused (`/quotes`, `/readings`) not technical layers
- **State management**: Zustand for UI, native fetch for data (no React Query)
- **Testing pattern**: Mock external APIs only, test via user interactions
- **File placement**: Test files in `__tests__` folders alongside implementation
- **Error handling**: Detailed messages with context, never silent failures
- **TypeScript**: Strict mode, explicit types, avoid `any`, destructure props

## Logging Architecture

```typescript
// Production code uses structured logging
import { logger } from '@/lib/logger';
logger.info('Event occurred', { module: 'readings', data });

// Exemptions documented in edge-cases-decisions.md:
// - Storybook files (*.stories.*)
// - Demo components (*Demo.tsx)
// - Development utilities (extract-data.js, seed-database.js)
```

## Security Pipeline

```bash
npm run security:audit  # High/critical vulnerabilities only
npm run security:scan   # Filtered with scripts/audit-filter.ts allowlist

# Allowlist in scripts/allowed-vulnerabilities.json
# CI enforces security checks on all PRs
```

## Content Structure

```
content/
├── quotes/[ID].md         # YAML: author, id | Body: quote text
└── readings/[slug].md     # YAML: title, author, finished (ISO date/null), audiobook (bool)

Reading states:
- Currently reading: finished: null
- Finished: finished: "2023-06-15T00:00:00.000Z"
- Audiobook indicator: audiobook: true (shows 🎧)
```

## Analytics & Observability

**Vercel Analytics**: Tracks pageviews and traffic sources

- Components: `<Analytics />` and `<SpeedInsights />` in `src/app/layout.tsx`
- Zero configuration needed (auto-detects production environment)
- Data visible in Vercel dashboard → Analytics tab

**Core Web Vitals Monitoring**:

- LCP (Largest Contentful Paint): Target ≤2.5s
- INP (Interaction to Next Paint): Target ≤200ms
- CLS (Cumulative Layout Shift): Target ≤0.1
- Tracked automatically via Speed Insights component

**Privacy**:

- GDPR-compliant (no cookies, no PII)
- First-party tracking only (`/_vercel/insights`)
- No consent banner required

**Free Tier Limits**: 2,500 events/month (sufficient for personal site)

## Testing Strategy

```bash
npm run test:coverage       # Full coverage report
npm run test:snapshot       # Snapshot tests only
UPDATE_SNAPSHOTS=true npm test  # Update snapshots

# Test categories:
# - Component behavior (user interactions)
# - API routes (data serving)
# - Accessibility (jest-axe)
# - Utilities (pure functions)
```

## Environment Variables

No environment variables are required for the application. The only optional environment variable is:

```bash
EDITOR or VISUAL             # CLI editor preference (default: vi)
```

## CI/CD Workflow

GitHub Actions runs on push/PR:

1. Lint → Type check → Test → Build → Storybook build
2. Security scan with allowlist filtering
3. Branch naming enforced: feature/_, fix/_, docs/_, refactor/_

## Key Project Decisions

- **No database**: All content in markdown files
- **No auth**: Public personal site
- **Simplified reading status**: Two states (reading/finished) vs three
- **Static generation**: API routes serve parsed markdown
- **Accessibility first**: WCAG 2.1 AA compliance required
- **Keyboard navigation**: Full support with focus management utilities

## Development Patterns

- Use `Task` tool for complex multi-file operations
- Batch parallel operations when searching/reading files
- Check README.md for standard info before asking
- Follow existing patterns in neighboring files
- Never assume library availability - check package.json
- Maintain existing file organization and naming
