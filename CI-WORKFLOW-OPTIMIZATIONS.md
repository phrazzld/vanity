# CI Workflow Optimizations

This document outlines specific optimizations that can be implemented to improve CI performance and reduce execution time.

## Current Bottlenecks

Analysis of the existing CI workflow in `.github/workflows/ci.yml` reveals several potential bottlenecks:

1. **Sequential Execution**: All steps run sequentially, even when some could run in parallel
2. **Limited Caching**: Only npm dependencies are cached, not build artifacts
3. **Redundant Operations**: Some operations may be performed multiple times
4. **No Test Splitting**: Tests run as a single batch rather than in parallel

## Recommended Optimizations

### 1. Parallelization Improvements

```yaml
jobs:
  lint-and-typecheck:
    name: Lint and Type Check
    runs-on: ubuntu-latest
    steps:
      # Setup steps...

      - name: Lint and Type Check (Parallel)
        run: |
          npm run lint &
          lint_pid=$!
          npm run typecheck &
          typecheck_pid=$!
          wait $lint_pid
          lint_exit=$?
          wait $typecheck_pid
          typecheck_exit=$?
          if [ $lint_exit -ne 0 ] || [ $typecheck_exit -ne 0 ]; then
            exit 1
          fi
```

Alternatively, using GitHub Actions job matrix:

```yaml
jobs:
  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    strategy:
      matrix:
        task: [lint, typecheck, format-check]
      fail-fast: false
    steps:
      # Setup steps...
      - name: Run ${{ matrix.task }}
        run: npm run ${{ matrix.task }}
```

### 2. Enhanced Caching Strategy

```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: |
      .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', 'next.config.ts') }}-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', 'next.config.ts') }}-
      ${{ runner.os }}-nextjs-

- name: Cache Prisma generated client
  uses: actions/cache@v4
  with:
    path: node_modules/.prisma
    key: ${{ runner.os }}-prisma-${{ hashFiles('**/prisma/schema.prisma') }}
    restore-keys: |
      ${{ runner.os }}-prisma-
```

### 3. Conditional Step Execution

```yaml
- name: Check for code changes (not docs)
  id: code-changes
  run: |
    git diff --name-only ${{ github.event.before }} ${{ github.sha }} > changed_files.txt
    echo "::set-output name=changes::$(grep -v -E '\.md$|\.txt$|docs/' changed_files.txt | wc -l | xargs)"

- name: Build Storybook
  if: steps.code-changes.outputs.changes != '0'
  run: npm run build-storybook
```

### 4. Test Splitting

```yaml
jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
      fail-fast: false
    steps:
      # Setup steps...
      - name: Run tests (sharded)
        run: npm test -- --shard=${{ matrix.shard }}/${{ strategy.job-total }}
```

### 5. Optimized Dependency Installation

```yaml
- name: Install dependencies
  run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      echo "Installing only production + required dev dependencies for PR"
      npm ci --omit=optional --omit=dev
      npm install --no-save typescript eslint prettier jest @testing-library/react
    else
      echo "Installing all dependencies for main branch"
      npm ci
    fi
```

### 6. Selective Artifact Upload

```yaml
- name: Upload coverage report
  if: github.ref == 'refs/heads/main' || github.event_name == 'pull_request'
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/
    retention-days: 7
```

## Implementation Plan

1. **Phase 1 - Quick Wins**:

   - Implement enhanced caching for Next.js and Prisma
   - Add conditional step execution for documentation-only changes
   - Optimize artifact uploads

2. **Phase 2 - Structural Changes**:

   - Refactor workflow to use job parallelization
   - Split code quality checks into separate jobs
   - Implement test sharding

3. **Phase 3 - Advanced Optimizations**:
   - Configure dependency optimization
   - Implement incremental testing
   - Set up test result caching

## Expected Improvements

| Optimization           | Estimated Time Reduction | Implementation Complexity |
| ---------------------- | ------------------------ | ------------------------- |
| Enhanced Caching       | 1-2 minutes              | Low                       |
| Parallelization        | 2-3 minutes              | Medium                    |
| Conditional Execution  | 0.5-3 minutes            | Low                       |
| Test Splitting         | 2-5 minutes              | Medium                    |
| Optimized Dependencies | 0.5-1 minute             | Low                       |

With all optimizations implemented, we can expect to reduce CI execution time by approximately 30-50% for full runs and potentially 60-70% for documentation-only changes.
