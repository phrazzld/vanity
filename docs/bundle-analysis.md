# Bundle Size Analysis

Generated: 2025-08-18

## Current Bundle Metrics

### Total Bundle Size

- **Client JS Total**: 1.12 MB (uncompressed)
- **Estimated Gzipped**: ~336 KB (assuming 30% compression ratio)
- **Target Goal**: < 1MB uncompressed

### Per-Route Analysis

| Route                  | First Load JS | Status                |
| ---------------------- | ------------- | --------------------- |
| `/readings`            | 163 kB        | ⚠️ Largest route      |
| `/` (homepage)         | 156 kB        | Above average         |
| `/projects`            | 106 kB        | Average               |
| `/map`                 | 102 kB        | Average               |
| `/responsive-examples` | 102 kB        | Demo page (removable) |
| `/_not-found`          | 101 kB        | Average               |
| **Shared by all**      | 100 kB        | Base cost             |

### Chunk Breakdown

#### Largest JavaScript Chunks

1. **592-457adb7a76e22ede.js**: 204 KB - Application code
2. **framework-306aa0968ce8efc5.js**: 180 KB - React framework
3. **4bd1b696-cf72ae8a39fa05aa.js**: 172 KB (54.1 KB in report) - Shared chunks
4. **964-18e6fe9c33c989a7.js**: 164 KB (43.6 KB in report) - Shared chunks
5. **d0deef33.53a40f89e3d32118.js**: 148 KB - Additional app code
6. **main-1832c8f650f7d95c.js**: 116 KB - Next.js runtime
7. **polyfills-42372ed130431b0a.js**: 112 KB - Browser polyfills

### Key Observations

#### Current State

- **Total client bundle**: 1.12 MB uncompressed
- **Largest route** (`/readings`): 163 KB first load
- **Smallest route** (`/_not-found`): 101 KB first load
- **Shared code**: 100 KB loaded on all routes

#### Problem Areas

1. **Not meeting target**: Currently at 1.12 MB, target is < 1MB
2. **Large framework overhead**: 180 KB for React framework
3. **Polyfills**: 112 KB for browser compatibility
4. **Demo pages included**: `/responsive-examples` adds unnecessary weight

## Optimization Opportunities

### Quick Wins (High Impact, Low Effort)

1. **Remove demo pages** (`/responsive-examples`): Save ~102 KB
2. **Remove legacy components** (.v1, .v2 files): Potential 50-100 KB
3. **Tree-shake unused imports**: Estimated 10-20% reduction

### Medium Effort Optimizations

1. **Code splitting improvements**: Lazy load heavy components
2. **Optimize polyfills**: Use modern browser targets
3. **Extract common chunks**: Better chunk splitting strategy
4. **Remove TanStack Query remnants**: Complete cleanup

### Bundle Analysis Tools

To view interactive bundle analysis:

```bash
npm run analyze
# Opens at http://localhost:8888
```

## Baseline Metrics for Tracking

| Metric        | Current Value | Target   | Gap     |
| ------------- | ------------- | -------- | ------- |
| Total Bundle  | 1.12 MB       | < 1 MB   | -120 KB |
| Largest Route | 163 KB        | < 150 KB | -13 KB  |
| Shared Code   | 100 KB        | < 80 KB  | -20 KB  |
| Framework     | 180 KB        | N/A      | -       |
| Polyfills     | 112 KB        | < 50 KB  | -62 KB  |

## Recommendations

### Immediate Actions

1. ✅ Baseline documented (this analysis)
2. 🔄 Remove demo/development pages from production
3. 🔄 Clean up legacy component versions
4. 🔄 Complete state management consolidation

### Next Phase

1. Implement code splitting for `/readings` route
2. Optimize polyfills for modern browsers
3. Analyze and reduce shared chunk size
4. Consider dynamic imports for heavy components

### Monitoring

- Run bundle analysis after each optimization
- Track First Load JS for critical routes
- Monitor Lighthouse performance scores
- Set up size-limit CI checks

## Technical Notes

### Build Configuration

- Next.js 15.4.6
- Static export mode
- TypeScript with strict mode
- React 19 (latest)

### Bundle Composition

- **Application code**: ~40% of bundle
- **Framework (React/Next)**: ~30% of bundle
- **Polyfills**: ~10% of bundle
- **Shared utilities**: ~20% of bundle

### Next Steps

1. Complete parallel work streams (hooks extraction, component simplification)
2. Remove demo pages and legacy components
3. Re-run analysis to measure improvement
4. Implement code splitting if still over 1MB
