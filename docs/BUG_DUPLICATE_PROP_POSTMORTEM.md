# Bug Postmortem: Duplicate Property in Style Object

## Issue Overview
A build failure occurred during Vercel deployment due to a TypeScript error in the ReadingCard component. The error prevented the application from being deployed, blocking the feature delivery.

## Root Cause
The bug was caused by a duplicate property (`width`) in a CSS-in-JS style object in `ReadingCard.tsx`. The style object contained:

```typescript
style={{
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  width: '4px',             // First declaration of width
  backgroundColor: statusColor,
  zIndex: 3,
  transition: 'width 0.3s ease',
  width: isHovered ? '6px' : '4px'  // Second declaration of width
}}
```

TypeScript doesn't allow duplicate keys in object literals. In JavaScript, the second property would silently override the first, but TypeScript catches this ambiguity as an error.

## Debugging Process
1. Identified the error from Vercel build logs, which pointed to line 121 in `ReadingCard.tsx`.
2. Examined the code and confirmed the presence of duplicate `width` properties in the style object.
3. Fixed the issue by removing the first, static `width` property and keeping only the conditional one for the hover effect.
4. Verified the fix by running TypeScript compiler checks and the full build process.

## Resolution
Removed the duplicate `width` property from the style object, maintaining the responsive behavior:

```typescript
style={{
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  backgroundColor: statusColor,
  zIndex: 3,
  transition: 'width 0.3s ease',
  width: isHovered ? '6px' : '4px'  // Only one width property
}}
```

## Recommendations to Prevent Similar Issues
1. **Developer Tools**: Configure IDE extensions to highlight duplicate object properties.
2. **Validation Steps**: Add TypeScript compilation check (`tsc --noEmit`) to CI/CD workflow to catch type errors before deployment.
3. **Code Review Guidelines**: Add specific checks for style objects in React components during code reviews.
4. **Knowledge Sharing**: Ensure team members understand TypeScript's strict object literal validation compared to JavaScript's lenient behavior.
5. **Testing**: Add a pre-merge build test to catch compilation errors before code reaches the main branch.

## Timeline
- Issue discovered: March 15, 2025, during Vercel deployment
- Issue resolved: March 15, 2025, with commit 0b6fd3d