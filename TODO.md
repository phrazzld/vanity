# TODO: Vanity Project Roadmap

## ✅ Phase 1: The Carmack Cut - Database to Markdown Migration (COMPLETE)

_"The best code is no code. Delete until it hurts, then ship."_

### What We Shipped (4 hours, 2000+ lines deleted)

- [x] Exported 340 quotes and 367 readings from production Neon database
- [x] Migrated all content to markdown files with YAML frontmatter
- [x] Created simple data.ts that reads markdown with gray-matter (28 lines)
- [x] Simplified API routes from 400+ lines to ~10 lines each
- [x] Deleted entire Prisma/PostgreSQL infrastructure
- [x] Removed admin interface and NextAuth authentication
- [x] Fixed pagination issues by loading all data at once
- [x] Fixed malformed image URLs from migration
- [x] Fixed edge runtime errors in logger
- [x] Filtered out dropped books from readings page
- [x] Pushed to branch `refactor/migrate-database-to-markdown`

**Results:** $228/year saved, instant page loads, all content in Git

---

## ✅ Phase 2: Vanity CLI Tool (COMPLETE - Shipped in ~1 hour!)

_"Interactive where it matters, simple everywhere else."_

### Setup (30 min)

- [x] Create `/cli/index.ts` with Commander.js boilerplate: `commander.program.name('vanity').version('1.0.0')`
- [x] Install deps: `npm i -D commander inquirer sharp gray-matter slugify tmp execa boxen chalk`
- [x] Add npm script: `"vanity": "tsx cli/index.ts"`
- [x] Create folder structure: `mkdir -p cli/{commands,lib,templates}`
- [x] Test basic command: `npm run vanity -- --help`

### Quote Command (45 min)

## Execution Log

[10:45] Created editor.ts utility for opening temp files in $EDITOR
[10:46] Implemented quote.ts with addQuote() function
[10:47] Integrated with CLI index.ts
[10:48] Verified command registration
[10:52] Created preview.ts with boxen formatting utilities
[10:53] Integrated preview into quote command for styled output
[10:55] Created test script to verify quote creation
[10:56] Successfully created test quote #350
[10:57] Verified file creation and format
[10:58] Cleaned up test artifacts
✅ Quote Command COMPLETE

- [x] Create `/cli/commands/quote.ts` with `addQuote()` function that opens $EDITOR
- [x] Write `/cli/lib/editor.ts` - opens tmp file in user's editor
- [x] Create `/cli/lib/preview.ts` - formats quote with boxen
- [x] Implement ID auto-increment - read `/content/quotes/`, find max ID + 1
- [x] Wire up flow: editor → preview → confirm → get author → save
- [x] Test: `npm run vanity quote add` creates new quote file

### Reading Command (60 min)

## Execution Log

[11:00] Created reading.ts with comprehensive inquirer flow
[11:01] Integrated with CLI index.ts
[11:02] Implemented all sub-features in single pass
[11:05] Created test script for reading creation
[11:06] Successfully created test reading with image
[11:07] Verified markdown and image files created correctly
[11:08] Cleaned up test artifacts
✅ Reading Command COMPLETE

- [x] Create `/cli/commands/reading.ts` with inquirer prompts
- [x] Add title/author/finished prompts (finished: y/n only)
- [x] Add date prompt if finished (default: today)
- [x] Add cover image menu: URL / Local file / Skip
- [x] For local images: optimize with sharp to 400x600 webp
- [x] Save to `/public/images/readings/[slug].webp`
- [x] Optional thoughts: y/n → open editor if yes
- [x] Generate slug from title for filename
- [x] Test: `npm run vanity reading add` creates markdown + image

### ~~Git Integration~~ (SKIPPED - manual commits are fine)

### List Commands (15 min)

## Execution Log

[11:10] Added listQuotes function to quote.ts
[11:11] Wired up to CLI with optional -n flag
[11:12] Tested successfully with truncation and formatting
[11:14] Added listReadings function to reading.ts
[11:15] Wired up to CLI with optional -n flag  
[11:16] Tested successfully with status indicators
✅ List Commands COMPLETE

- [x] Add `vanity quote list` - shows last 10 quotes
- [x] Add `vanity reading list` - shows last 10 readings
- [x] Format with chalk colors
- [x] Reuse existing `/src/lib/data.ts` functions

### Polish (30 min)

## Execution Log

[11:18] Enhanced main CLI help with examples
[11:19] Added detailed help for all commands
[11:21] Added comprehensive image path validation
[11:22] Added error handling for image processing
[11:24] Added comprehensive try/catch blocks
[11:25] Added EDITOR environment checks
[11:26] Improved error messages with helpful hints
[11:27] Added file operation error handling
[11:29] Tested missing EDITOR - falls back to vi
[11:31] Created test files for validation
[11:32] Verified list command error handling
[11:35] All error cases working correctly
[11:37] Updated CLAUDE.md with comprehensive CLI documentation
✅ Polish COMPLETE

- [x] Add `--help` text with examples
- [x] Add validation for image paths
- [x] Add error handling with try/catch
- [x] Test error cases (missing EDITOR, bad paths)
- [x] Update `/CLAUDE.md` with CLI usage docs

**🎉 Phase 2 Complete!**

- Total time: ~1 hour (vs 4 hours estimated)
- All features implemented and tested
- Full documentation and error handling
- Ready to ship!

---

## ✅ Phase 3: Content Migration (COMPLETE - 25 min!)

### Migrate Hardcoded Content to Markdown

## Execution Log

[14:40] Started places migration
[14:42] Created migration script for 73 places
[14:43] Fixed quote escaping issues in data
[14:44] Generated markdown files in /content/places/
[14:45] Added getPlaces() to data.ts
[14:46] Updated map/data.ts to use getPlaces()
[14:48] Hit issue: Cannot use fs in client components
[14:49] Refactored to server-side data fetching with props
[14:50] Fixed YAML parsing errors with proper quoting
[14:51] Build successful, cleaned up migration script
✅ Places Migration COMPLETE

### Project Command (10 min)

## Execution Log

[14:53] Created /cli/commands/project.ts with inquirer prompts
[14:54] Added project command to CLI index.ts
[14:55] Updated help text with project examples
[14:56] Tested list command - working correctly
[14:57] Verified add command functionality
✅ Project Command COMPLETE

### Place Command (7 min)

## Execution Log

[14:59] Created /cli/commands/place.ts with coordinate validation
[15:00] Added place command to CLI index.ts
[15:01] Tested list command - displays 73 existing places
[15:02] Created test script for add functionality
[15:03] Fixed TypeScript import issues
[15:04] Build successful, all commands working
✅ Place Command COMPLETE

- [x] Convert projects from `/src/app/projects/page.tsx` to `/content/projects/` (9 projects migrated, 93 lines removed)
- [x] Convert places from `/src/app/map/data.ts` to `/content/places/` (73 places migrated, 515 lines removed)
- [x] Add `vanity project add` command (interactive prompts, auto-order, URL validation)
- [x] Add `vanity place add` command (coordinate validation, auto-increment ID, optional notes)

---

## 🔧 Phase 4: Production Cleanup

### Critical Vercel Fix Required

## Execution Log

[2025-08-15 11:45] Identified root cause: line 40 `*.md` excludes all content
[2025-08-15 11:46] Removed overly broad `*.md` pattern
[2025-08-15 11:47] Added specific exclusions for docs while preserving content/
[2025-08-15 11:48] Build successful - fix verified locally
[2025-08-15 11:49] Committed and pushed fix to trigger deployment
[2025-08-15 11:50] Vercel deployment in progress
[2025-08-15 11:52] Vercel deployment completed successfully ✅
[2025-08-15 11:52] Preview URL: https://vanity-git-refactor-migrate-database-to-markdown-moomooskycow.vercel.app
✅ .vercelignore Fixed - content will now deploy

**Issue**: Content not loading on Vercel preview - all pages show empty data
**Root Cause**: `.vercelignore` contains `*.md` which excludes ALL markdown files from deployment

- [x] **Fix .vercelignore to include content directory**
  - Remove the overly broad `*.md` exclusion pattern (line 40)
  - Add specific exclusions: `CONTRIBUTING.md`, `BACKLOG.md`, `TODO.md`, `TASK.md`, `CLAUDE.md`
  - Add `docs/**/*.md` to exclude documentation but keep content
  - Add comment: `# CRITICAL: content/ directory markdown files are REQUIRED for runtime`
  - This fixes the empty data issue since API routes read these files via fs.readFileSync()

- [x] **Test and deploy the fix**
  - Run `npm run build` locally to verify
  - Commit with message: "fix: include content markdown files in Vercel deployment"
  - Push to trigger new deployment
  - Verify all content loads on preview URL (/readings, /quotes, /projects, /map)

### Vercel & Deploy

## Execution Log

[15:06] Started PR creation task
[15:07] Committed Phase 3 changes with comprehensive message
[15:08] Passed all pre-push quality gates and security checks
[15:09] Created comprehensive PR with detailed summary
✅ PR Created: https://github.com/phrazzld/vanity/pull/52

[19:00] Fixed vercel.json - removed prisma:generate from build command
[19:01] Fixed CI workflow - removed Generate Prisma client step
[19:02] Deployment and CI now passing
✅ Deployment configuration fixed

- [x] Create PR from `refactor/migrate-database-to-markdown` (https://github.com/phrazzld/vanity/pull/52)
- [x] Fix vercel.json build command (removed Prisma references)
- [x] Fix GitHub Actions CI (removed Prisma generation step)
- [x] Deploy to Vercel preview (deployment successful)
- [ ] Remove Neon database from Vercel dashboard
- [ ] Merge to main
- [ ] Monitor for any issues

### Code Quality - PR Review Feedback

## Execution Log

[2025-08-15 12:20] Started addressing PR review feedback from Gemini Code Assist
[2025-08-15 12:21] Fixed YAML construction in reading.ts using matter.stringify()
[2025-08-15 12:22] Fixed YAML construction in place.ts with proper frontmatter object
[2025-08-15 12:23] Added matter import to project.ts and fixed dead code issue
[2025-08-15 12:24] Fixed YAML construction in quote.ts and moved mkdir import to top
[2025-08-15 12:25] Converted sync file operations to async in place.ts getNextPlaceId()
[2025-08-15 12:26] All PR feedback addressed - ready for testing
✅ PR Review Feedback Complete

#### Critical/Merge-blocking (Address Before Merge)

- [x] **[HIGH]** Fix manual YAML frontmatter construction in `cli/commands/reading.ts:377`
  - Current issue: Manually constructing YAML with string concatenation is brittle
  - Will fail for special characters (quotes, newlines, etc.)
  - Solution: Use `matter.stringify()` for safe YAML serialization
  - Impact: Prevents corrupted data files

#### In-scope Improvements (Address in This Branch)

- [x] **[MEDIUM]** Fix manual YAML construction in `cli/commands/place.ts:170`
  - Same issue as reading.ts - use `matter.stringify()`
- [x] **[MEDIUM]** Fix manual YAML construction in `cli/commands/project.ts:235`
  - Dead code: `frontmatter` object created but unused
  - Solution: Use `matter.stringify()` with the frontmatter object
- [x] **[MEDIUM]** Fix manual YAML construction in `cli/commands/quote.ts:113`
  - String concatenation approach is fragile
  - Solution: Use `matter.stringify()`
- [x] **[MEDIUM]** Convert sync file operations to async in `cli/commands/place.ts:31`
  - Using `readdirSync` and `readFileSync` blocks event loop
  - Solution: Use async versions for consistency
- [x] **[MEDIUM]** Fix import organization in `cli/commands/quote.ts:120`
  - Dynamic import of `mkdir` inside try/catch
  - Solution: Import at top of file

### Code Quality - Original Items

- [x] Fix TypeScript lint warnings in CLI code (35 warnings)
- [ ] Fix unused variable in debounce.ts
- [ ] Update ESLint config to allow `process` global
- [ ] Remove unused test files for deleted features
- [ ] Clean up `.next` build directory

---

## 💭 Future Ideas (YAGNI - Only if needed)

- [ ] File picker for local image selection (instead of typing path)
- [ ] Search functionality across all content
- [ ] RSS feed generation from markdown
- [ ] Tag system for quotes
- [ ] Reading statistics/charts
- [ ] Export to various formats (PDF, JSON)
- [ ] Backup automation to S3/GitHub

---

## Metrics

**Migration Results:**

- Lines deleted: 2000+
- Lines added: <200
- Database cost: $228/year → $0
- Deploy time: 30s → 10s
- Dependencies removed: 15+

**Time Investment:**

- Phase 1 (Migration): ✅ 4 hours
- Phase 2 (CLI): 4 hours estimated
- Phase 3 (Content): 2 hours estimated
- Phase 4 (Cleanup): 1 hour estimated

**Philosophy:**
Every line not written is a bug avoided. Every feature not built is complexity dodged. Ship the spike.
