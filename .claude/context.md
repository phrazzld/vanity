# Project Context

## Patterns

**[Component Creation from Existing]**: Find similar component → copy structure → simplify to requirements

- Pattern: Use pattern-scout to locate similar components in codebase first
- Copy established component structure rather than building from scratch
- Remove unnecessary complexity (e.g., image handling, complex state)
- Maintain semantic HTML patterns already established (article, h2, p, ul)
- Time savings: ~80% faster than ground-up development

**[Project Grid Layout]**: Multi-column responsive grid layout with card-based projects

```css
.projects-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8;
}
```

**[Project Card Component]**: Feature-rich project card with image, content, and links

```tsx
<article className="project-card">
  <div className="project-image-container">
    <Image src={imageSrc} alt={altText} fill />
  </div>
  <div className="project-content">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <ul className="tech-stack">{techStack.map(...)}</ul>
    </div>
    <div className="project-links">
      {siteUrl && <a href={siteUrl} className="content-link secondary-link">view site</a>}
      {codeUrl && <a href={codeUrl} className="content-link secondary-link">view code</a>}
    </div>
  </div>
</article>
```

**[Typography System Discovery]**: Pattern-scout is highly effective for finding existing typography systems

- Pattern: Always use pattern-scout to check globals.css for typography utilities
- Look for heading classes (.big-heading, .medium-heading) and base styles
- Button classes (btn, btn-primary) often exist but aren't always obvious
- Complete typography systems usually defined in globals.css with responsive breakpoints

```css
/* Discovered comprehensive typography system */
.big-heading {
  @apply text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight;
}
.medium-heading {
  @apply text-2xl md:text-3xl font-semibold mb-8 tracking-tight;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  @apply font-space-grotesk font-bold tracking-tight;
}
body {
  @apply font-inter leading-relaxed;
}
```

**[Link Hierarchy Discovery]**: Existing button and link classes provide complete hierarchy solution

- btn + btn-primary classes exist for primary actions
- content-link + secondary-link classes exist for secondary actions
- Pattern: Check for both button classes and content-link classes in globals.css
- Complete hierarchy often already implemented, just needs discovery

**[Task Batching Opportunity Recognition]**: Related UI tasks can often be combined efficiently

- Typography and link hierarchy tasks are natural pairs (both involve text styling)
- When implementing layout structure, check if visual hierarchy fits naturally
- Time savings: Completing two 3-minute tasks in 3 minutes total
- Pattern: Look for overlapping concerns when planning task execution

**[Tech Stack Bullet Implementation]**: div/span structure cleaner than ul/li for custom bullets

```tsx
// Preferred pattern: div/span with custom separators
<div className="tech-stack">
  {techStack.map((tech, index) => (
    <span key={tech}>
      {tech}
      {index < techStack.length - 1 && ' • '}
    </span>
  ))}
</div>

// Avoid: ul/li structure for custom bullet styling (React key issues)
```

**[Typography System]**: Consistent heading and text styling with responsive design

```css
/* Large page headings */
.big-heading {
  @apply text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight;
}

/* Section headings */
.medium-heading {
  @apply text-2xl md:text-3xl font-semibold mb-8 tracking-tight;
}

/* Base headings with Space Grotesk font */
h1,
h2,
h3,
h4,
h5,
h6 {
  @apply font-space-grotesk font-bold tracking-tight;
}

/* Responsive heading sizes */
h1 {
  @apply text-4xl md:text-5xl mb-6;
}
h2 {
  @apply text-3xl md:text-4xl mb-4;
}
h3 {
  @apply text-2xl md:text-3xl mb-3;
}
h4 {
  @apply text-xl md:text-2xl mb-2;
}

/* Body text with Inter font and good readability */
body {
  @apply font-inter leading-relaxed;
}
p {
  @apply mb-4;
}
```

**[Tech Stack Styling]**: Horizontal list with tag-style items

```css
.tech-stack {
  @apply list-none flex flex-wrap gap-2 mt-2 p-0;
}

.tech-stack li {
  @apply bg-muted dark:bg-muted text-muted-foreground py-1 px-2 rounded-md text-xs;
}
```

**[Link Hierarchy System]**: Primary and secondary link styles with underline animations

```css
/* Primary content links with animated underline */
.content-link {
  @apply relative no-underline text-foreground transition-colors duration-200;
}

.content-link::after {
  @apply content-[''] absolute left-0 -bottom-0.5 h-px w-full bg-foreground scale-x-0 origin-left transition-transform duration-200;
}

.content-link:hover::after {
  @apply scale-x-100;
}

/* Secondary links with dashed border */
.secondary-link {
  @apply text-sm border-b border-dashed border-foreground pb-0.5 transition-colors duration-200;
}

.secondary-link:hover {
  @apply border-solid border-foreground;
}
```

**[Reading Card Hover Pattern]**: Clean hover overlay with fade-in animation

```tsx
const [isHovered, setIsHovered] = useState(false);
// Simple hover state management with mouse/focus events
```

**[File Filtering with Hardcoded Arrays]**: Filter files by filename with predefined allowed list

```javascript
// Pattern 1: .md removal and includes check
const markdownFiles = files.filter(file => file.endsWith('.md'));
const allowedSlugs = [
  'anyzine',
  'brainrot-publishing',
  'chrondle',
  'scry',
  'superwire',
  'time-is-money',
  'whetstone',
  'wrap-it-up',
];
const filteredFiles = markdownFiles.filter(file => {
  const slug = file.replace('.md', '');
  return allowedSlugs.includes(slug);
});

// Pattern 2: Direct slug extraction in map/filter chain
const files = fs.readdirSync(dir);
const projects = files
  .filter(file => allowedSlugs.includes(file.replace('.md', '')))
  .map(file => {
    const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    return {
      slug: file.replace('.md', ''),
      ...data,
    };
  });
```

**[Alphabetical Sorting]**: Locale-aware alphabetical sorting with case-insensitive comparison

```typescript
// Pattern for proper alphabetical sorting
projects.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
readings.sort((a, b) => a.title.localeCompare(b.title));

// Better than: a.title > b.title (doesn't handle locale properly)
// localeCompare handles accents, special chars, and locale-specific rules
```

**[Gradual Field Removal Pattern]**: Transition strategy for removing data structure fields without breaking changes

```typescript
// Step 1: Make fields optional in interfaces
interface Project {
  title: string;
  description: string;
  imageSrc?: string;  // Made optional
  altText?: string;   // Made optional
}

// Step 2: Update consumers with conditional rendering
{imageSrc && (
  <div className="project-image-container">
    <Image src={imageSrc} alt={altText} fill />
  </div>
)}

// Step 3: Remove field usage from components
// Step 4: Remove fields from data files
// Step 5: Remove optional fields from interfaces
```

**[Optional Field Conditional Rendering]**: Handle optional fields gracefully in React components

```tsx
// Pattern for optional image fields
{
  imageSrc && <Image src={imageSrc} alt={altText} />;
}

// Pattern for optional link fields
{
  siteUrl && <a href={siteUrl}>view site</a>;
}

// Pattern for optional content sections
{
  description && <p className="description">{description}</p>;
}
```

## Bugs & Fixes

**[Hardcoded Lists Out of Sync]**: Hardcoded arrays can reference non-existent files → Always verify filesystem before implementing hardcoded filters

- Problem: Hardcoded array included 'chrondle', 'scry' but these .md files didn't exist
- Solution: Check actual directory contents first, then adapt hardcoded list to match reality
- Pattern: `fs.readdirSync(dir).map(f => f.replace('.md', ''))` to see what actually exists

**[Deployment Status Mismatch]**: Project files exist but aren't "deployed" (missing siteUrl) → Filter by deployment criteria, not just file existence

- Problem: Extra projects (brainstorm-press, studymode) had files but no siteUrl field
- Solution: Two-stage filtering: 1) file exists 2) has deployment properties

**[Field Removal Cross-File Dependencies]**: Removing data structure fields breaks CLI commands and other consumers

- Problem: Removed 'order' field from projects data structure but CLI still referenced it
- Solution: Always grep for field name across entire codebase before removal
- Pattern: `grep -r "fieldName" ./` to find all references
- Files affected: /cli/commands/project.ts, /cli/types/index.ts
- Learning: Data structure changes have wider impact than main application code

**[Required Field Breaking Change]**: Removing required interface fields causes immediate build failures

- Problem: ProjectCard component expected required imageSrc/altText but fields were removed
- Solution: Make fields optional first as transition strategy
- Pattern: interface Field?: Type instead of Field: Type for gradual removal

**[ul/li React Key Issues]**: Using ul/li for custom bullet separators causes React key warnings

- Problem: Mapping tech stack with ul/li and custom bullet characters creates key issues
- Solution: Use div/span structure with conditional separators for cleaner implementation
- Pattern: `{index < array.length - 1 && ' • '}` for custom separators

## Decisions

**[Component Template Strategy]**: Always look for existing similar components before creating new ones

- Faster development by reusing proven patterns
- Maintains UI/UX consistency across codebase
- ProjectCard.tsx is excellent template for card-style components
- Semantic HTML structure (article > div > h2, p, ul) well-established

**[Slug Extraction Standard]**: Use `file.replace('.md', '')` consistently for slug extraction from markdown filenames across project filtering utilities

**[Alphabetical Over Manual Ordering]**: Switched from manual order field to alphabetical sorting for better maintainability

- Removes need to manage order numbers when adding/removing projects
- More predictable and user-friendly sorting
- Uses localeCompare for proper locale-aware sorting

**[Transition Over Breaking Changes]**: Use gradual field removal pattern instead of immediate deletion

- Make fields optional first → Update consumers → Remove usage → Remove fields
- Allows components to handle transition gracefully without build failures
- More maintainable than coordinating simultaneous changes across files

**[Pattern-Scout for Typography Discovery]**: Always check globals.css with pattern-scout before implementing custom typography

- Comprehensive typography systems are usually already defined
- Button classes and link hierarchies often exist but aren't obvious
- Saves time and maintains consistency with existing design system

**[Task Batching for Efficiency]**: Combine related UI tasks when they have overlapping concerns

- Typography and link hierarchy naturally work together
- Look for shared components or CSS files that serve both requirements
- Can reduce total execution time by 50% or more

## Type Organization Insights

**[Scattered Interface Definitions]**: This codebase has no centralized type definitions

- Types are defined locally where consumed (e.g. ProjectCard component defines its own Project interface)
- No shared types/ directory or central type definitions
- Pattern for finding types: Use pattern-scout or ast-grep to locate interface definitions
- Consider: Centralizing common types if they become shared across multiple files

## Estimation Insights

**[Component Creation Accuracy]**: Template-based component creation is highly predictable

- 2-minute estimates are accurate when following existing patterns
- Pattern-scout eliminates discovery time
- Simplification from complex components is straightforward
- No debugging needed when following established semantic HTML patterns

**[Verification Buffer]**: Always add 2-3 minutes to estimates when hardcoded data is involved

- Simple filtering tasks: ~2-3 minutes base + verification time
- Hardcoded references require filesystem validation step
- Mismatches between spec and reality are common and add debugging time

**[Field Removal Complexity]**: Data structure changes take 2x longer than expected

- Base estimate: 2 minutes for simple field removal
- Reality: 4 minutes due to cross-file dependencies
- Buffer needed: +100% for grep verification and fixing references
- Pattern: Always grep for field references before removal

**[Gradual Refactoring Efficiency]**: Transition patterns are faster than breaking changes

- Making fields optional first prevents build failures
- Conditional rendering allows immediate component updates
- 3-minute execution when using transition strategy vs potential hours debugging breaking changes

**[Task Batching Efficiency]**: Related tasks completed together achieve significant time savings

- Two 3-minute tasks completed in 3 minutes total (50% time savings)
- Pattern recognition key: Typography and link hierarchy are natural pairs
- Look for shared files (globals.css) that serve multiple requirements
- Accurate time estimation when leveraging existing comprehensive systems
