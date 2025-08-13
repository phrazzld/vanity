# TODO: The Carmack Cut - Database to Markdown Migration

*"The best code is no code. The best abstraction is no abstraction. Ship the spike."*

## Hour 1: Data Liberation (Get it out, get it done)

- [ ] **Export all quotes to JSON** - Run: `psql $DATABASE_URL -c "SELECT json_agg(row_to_json(q)) FROM \"Quote\" q" > /tmp/quotes.json` and verify 500+ quotes exported
  - Context: Direct PostgreSQL export, no ORM overhead
  - Success: File exists with valid JSON array

- [ ] **Export all readings to JSON** - Run: `psql $DATABASE_URL -c "SELECT json_agg(row_to_json(r)) FROM \"Reading\" r" > /tmp/readings.json` and verify 500+ readings exported
  - Context: Same approach, get the data out raw
  - Success: File exists with valid JSON array

- [ ] **Create content directories** - Run: `mkdir -p content/quotes content/readings public/images` 
  - Context: Simple flat structure, no year folders needed yet
  - Success: Directories exist

- [ ] **Write 30-line migration script** - Create `scripts/migrate-now.js` that reads JSON and writes markdown files:
  ```javascript
  // Read JSON, loop, write files with frontmatter using template literals
  // No dependencies except fs and built-in JSON
  // quotes: content/quotes/{id}.md with ---\nauthor: {author}\n---\n{text}
  // readings: content/readings/{slug}.md with ---\ntitle: {title}\nauthor: {author}\nfinished: {date}\n---\n{thoughts}
  ```
  - Context: One-time script, doesn't need to be pretty
  - Success: Script runs without errors, creates 1000+ markdown files

- [ ] **Download book cover images** - Write 10-line script to wget all coverImageSrc URLs to public/images/
  ```bash
  # Extract URLs from readings.json, wget each to public/images/
  # Update markdown files to reference local paths
  ```
  - Context: Keep images local, no CDN complexity
  - Success: Images downloaded, paths updated in markdown

## Hour 2: Code Simplification (Delete until it hurts)

- [ ] **Create dead-simple data.js** - Write 15-line file that reads markdown with gray-matter:
  ```javascript
  // getQuotes(): readdir('./content/quotes'), map through gray-matter, return array
  // getReadings(): readdir('./content/readings'), map through gray-matter, return array
  // That's it. No async, no validation, no types.
  ```
  - Context: fs.readFileSync is fine for 1000 files at build time
  - Success: Functions return arrays of data

- [ ] **Update quotes page to use static data** - Replace useQuotesList hook with direct import:
  ```javascript
  // In app/quotes/page.tsx or wherever:
  import { getQuotes } from '@/lib/data';
  const quotes = getQuotes(); // At module level or in component
  ```
  - Context: Server components can read files directly
  - Success: Quotes display without database

- [ ] **Update readings page to use static data** - Same as quotes:
  ```javascript
  import { getReadings } from '@/lib/data';
  const readings = getReadings();
  ```
  - Context: No need for API routes or client fetching
  - Success: Readings display without database

- [ ] **Gut the API routes** - Replace route.ts files with 5-line stubs:
  ```javascript
  // GET returns static JSON, POST/PUT/DELETE return 405 Method Not Allowed
  import { getQuotes } from '@/lib/data';
  export async function GET() { return Response.json(getQuotes()); }
  ```
  - Context: Keep routes for backward compatibility, but make them trivial
  - Success: API routes work but do nothing complex

## Hour 3: The Great Deletion (Remove the cruft)

- [ ] **Delete all Prisma files** - Run: `rm -rf prisma/ && npm uninstall @prisma/client prisma`
  - Context: No database = no ORM needed
  - Success: prisma folder gone, packages removed from package.json

- [ ] **Delete database connection code** - Run: `rm src/lib/db.ts src/lib/prisma.ts src/lib/api/*.ts`
  - Context: All database abstraction layers, gone
  - Success: No files importing PrismaClient

- [ ] **Delete admin interface entirely** - Run: `rm -rf src/app/admin`
  - Context: Edit markdown in VS Code like a developer
  - Success: No admin routes exist

- [ ] **Delete authentication system** - Run: `rm -rf src/auth.ts src/app/api/auth && npm uninstall next-auth`
  - Context: No admin = no auth needed
  - Success: No auth code or dependencies

- [ ] **Remove database environment variables** - Delete from .env.local:
  - DATABASE_URL
  - DATABASE_URL_UNPOOLED  
  - ADMIN_USERNAME
  - ADMIN_PASSWORD
  - Context: No secrets needed for static files
  - Success: .env.local has no database or auth variables

- [ ] **Update package.json scripts** - Remove all prisma commands, add simple build:
  ```json
  "build": "next build",
  "dev": "next dev"
  ```
  - Context: No build:data needed, Next.js handles everything
  - Success: npm run build works without database

## Hour 4: Ship It (Make it real)

- [ ] **Test locally with no database** - Run: `npm run dev` and click through every page
  - Context: Ensure everything works with static files
  - Success: All quotes and readings visible, no errors

- [ ] **Commit the carnage** - Run: `git add -A && git commit -m "Carmack Cut: Delete 2000 lines, save $228/year"`
  - Context: One atomic commit for the entire migration
  - Success: Git diff shows massive red (deletions)

- [ ] **Push to preview branch** - Run: `git push origin carmack-cut`
  - Context: Test on Vercel preview before main
  - Success: Preview URL works without database

- [ ] **Remove Neon from Vercel** - Go to Vercel dashboard, disconnect Neon integration
  - Context: Stop the bleeding of $19/month
  - Success: No database in Vercel integrations

- [ ] **Merge and celebrate** - PR to main, merge, close laptop
  - Context: You just deleted 80% of your codebase and it still works
  - Success: Production running on markdown files

## Optional Future Improvements (Only if actually needed)

- [ ] **Add 10-line build script IF performance degrades** - Generate JSON at build time:
  ```javascript
  // Only if reading 1000 files becomes slow
  // fs.writeFileSync('./public/data/quotes.json', JSON.stringify(getQuotes()))
  ```

- [ ] **Add 5-line validation IF data corruption happens** - Check required fields:
  ```javascript
  // Only if bad data breaks the site
  // if (!quote.author || !quote.text) console.warn('Bad quote:', quote);
  ```

- [ ] **Add VS Code snippet IF editing becomes tedious** - Create .vscode/snippets.json:
  ```json
  // Only if you're adding quotes daily
  // "quote": { "prefix": "quote", "body": ["---", "author: $1", "---", "$2"] }
  ```

## The Carmack Metrics

**Before:**
- 2000+ lines of code
- $228/year database cost
- 5+ dependencies
- Complex deployment
- 10+ second deploys

**After:**
- <200 lines of code
- $0/year database cost
- 1 dependency (gray-matter)
- Git push deployment
- Instant local development

**Time to complete: 4 hours maximum**
**Lines of code to write: <100**
**Lines of code to delete: >2000**

Remember: Every task you don't do is a feature. Every line you don't write is a bug you don't have.