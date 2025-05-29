# T019 Task Analysis

## Task ID

T019

## Title

Remove --skipLibCheck from build

## Original Ticket Text

**T019 · Chore · P2: Remove --skipLibCheck from build**

- **Action:**
  1. Remove skipLibCheck from build processes
  2. Fix any type errors that arise
- **Done-when:**
  1. Build passes without skipLibCheck flag
- **Depends-on:** [T018]

## Implementation Approach Analysis Prompt

This task requires removing the `skipLibCheck: true` setting from TypeScript configuration and resolving any type errors that arise. Based on initial testing, removing this flag causes multiple TypeScript errors across:

1. **MDX Types**: JSX namespace errors in @types/mdx
2. **Next.js Image Types**: Duplicate identifier 'value' errors in Next.js global types
3. **Project Image Types**: Duplicate identifier 'value' errors in src/types/images.d.ts
4. **React Leaflet**: Module resolution errors for @react-leaflet/core/lib/context

The challenge is that DEVELOPMENT_PHILOSOPHY_APPENDIX_TYPESCRIPT.md actually recommends `skipLibCheck: true` for compilation speed, creating tension with the task requirement. However, the core philosophy emphasizes strict type checking and no suppressions except in rare cases.

**Context for Analysis:**

- Current tsconfig.json has `skipLibCheck: true` on line 6
- Only main tsconfig.json has this setting (verified via grep)
- Errors span multiple third-party library type definitions
- Some errors involve duplicate type declarations between Next.js and project types
- May require dependency updates, type declaration fixes, or namespace resolution
