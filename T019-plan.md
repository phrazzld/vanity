# T019 Implementation Plan: Remove --skipLibCheck from build

## Implementation Strategy

Following **Simplicity First** and **Explicit is Better than Implicit** principles from DEVELOPMENT_PHILOSOPHY.md, I will systematically resolve each category of type errors:

### Phase 1: Pre-Implementation Testing

1. **Baseline Test**: Verify current build and type checking works with skipLibCheck enabled
2. **Error Cataloging**: Remove skipLibCheck temporarily and catalog all type errors
3. **Risk Assessment**: Identify which errors are fixable vs. require workarounds

### Phase 2: Image Type Conflicts Resolution

**Problem**: Duplicate `value` identifiers between Next.js image types and custom `src/types/images.d.ts`
**Solution**: Remove custom image types and rely on Next.js built-in types

- Remove `src/types/images.d.ts` file entirely
- Next.js provides `StaticImageData` type for imported images which is more feature-complete
- **Risk Mitigation**: Test all existing image imports to ensure they still work

### Phase 3: MDX JSX Namespace Resolution

**Problem**: `Cannot find namespace 'JSX'` in @types/mdx
**Solution**: Ensure proper JSX types are available

- Add explicit React types import or ensure JSX namespace is properly configured
- May need to update tsconfig.json to include React JSX types explicitly

### Phase 4: React Leaflet Module Resolution

**Problem**: `Cannot find module '@react-leaflet/core/lib/context'`
**Solution**: Verify dependency installation and type compatibility

- Check if @react-leaflet/core types are properly installed
- May need dependency update or explicit type installation

### Phase 5: Final Configuration Update

1. **Remove skipLibCheck**: Update tsconfig.json to remove `"skipLibCheck": true`
2. **Build Verification**: Ensure `npm run build` passes
3. **Type Check Verification**: Ensure `npm run typecheck` passes

## Test Strategy

### Pre-Change Testing

- [ ] Current build passes: `npm run build`
- [ ] Current type check passes: `npm run typecheck`
- [ ] Document baseline state

### Image Import Testing

- [ ] Test static image imports (png, jpg, svg) in components
- [ ] Verify image properties (src, height, width) are accessible
- [ ] Test Next.js Image component usage

### Component Integration Testing

- [ ] Test Map component functionality (uses react-leaflet)
- [ ] Test any MDX/Storybook components
- [ ] Verify no runtime errors in development

### Final Validation

- [ ] Full build passes without skipLibCheck
- [ ] All type checking passes
- [ ] No regression in existing functionality

## Expected File Changes

- **Remove**: `src/types/images.d.ts`
- **Modify**: `tsconfig.json` (remove skipLibCheck line)
- **Possible**: Add React JSX types configuration if needed
- **Possible**: Update dependencies if version mismatches found

## Success Criteria

1. ✅ `npm run build` completes successfully
2. ✅ `npm run typecheck` passes with zero errors
3. ✅ No behavioral regressions in image imports or components
4. ✅ skipLibCheck setting removed from tsconfig.json

## Rollback Plan

If unforeseen issues arise:

1. Restore `tsconfig.json` backup
2. Restore `src/types/images.d.ts` if removed
3. Re-enable skipLibCheck temporarily while investigating alternatives
