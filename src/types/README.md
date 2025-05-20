# Types Directory

This directory contains shared TypeScript type definitions for the application.

## Purpose

- Centralize type definitions that are used across multiple components
- Ensure consistent typing throughout the application
- Provide a single source of truth for entity types

## Directory Structure

- `index.ts` - Central export point for all type definitions
- `reading.ts` - Type definitions for Reading entities
- `quote.ts` - Type definitions for Quote entities

## Usage

Import types from this directory using the path alias:

```typescript
import type { Reading, Quote } from '@/types';
```

## Guidelines

- Keep type definitions focused and specific to their entity
- Use interfaces for object types that may be extended
- Use JSDoc comments to document complex types
- Don't include runtime logic in type definition files
