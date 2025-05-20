# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Build: `npm run build`
- Dev: `npm run dev` or `npm run dev:log` (with logging)
- Test: `npm test` or `npm run test:watch` (watching mode)
- Single test: `npm test -- -t "test name pattern"`
- Coverage: `npm run test:coverage`
- Lint: `npm run lint`
- Database: `npx prisma generate` (update client), `npx prisma migrate deploy` (apply migrations)

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
