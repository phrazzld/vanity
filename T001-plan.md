# T001: Apply Prettier Formatting to 8 Files - Plan

## Objective

Fix the CI failure on PR #22 by applying Prettier formatting to the 8 files that are causing the formatting check to fail.

## Affected Files (from CI logs)

1. src/app/admin/readings/page.tsx
2. src/app/api/auth/[...nextauth]/route.ts
3. src/app/api/logger-test/route.ts
4. src/app/api/quotes/route.ts
5. src/app/api/readings/route.ts
6. src/app/context/ThemeContext.tsx
7. src/app/error.tsx
8. src/auth.ts

## Implementation Steps

1. Checkout the `plan/infrastructure-ci-cd` branch
2. Pull latest changes from remote
3. Install dependencies with `npm ci`
4. Run `npm run format` to apply Prettier formatting to all files
5. Stage only the 8 affected files that were shown in the CI logs
6. Commit with the message "style: apply Prettier formatting to 8 files"
7. Push the commit to remote

## Validation

- Verify that `npm run format:check` passes locally before committing
- Ensure pre-commit hooks pass
- Check that the GitHub Actions "Build and Test" workflow passes after pushing
