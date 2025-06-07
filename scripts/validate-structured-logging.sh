#!/bin/bash
# T006 CI Integration: Prevent console.* reintroduction in operational code
# 
# This script validates that no console.* usage exists in operational code
# It allows legitimate usage in tests, stories, logger implementation, and CLI utilities

set -e

echo "🔍 Validating structured logging compliance..."

# Define acceptable files that can use console.*
ALLOWED_PATTERNS=(
  "__tests__/"
  "__mocks__/"
  ".test."
  ".spec."
  ".stories."
  "src/lib/logger.ts"
  "src/lib/audit-filter/"
  "scripts/"
  "test-"
  "jest.setup.js"
  "jest.config.js"
  ".config."
  "storybook"
)

# Function to check if a file should be excluded
should_exclude_file() {
  local file="$1"
  for pattern in "${ALLOWED_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      return 0  # true - should exclude
    fi
  done
  return 1  # false - should not exclude
}

# Find all console.* usage in TypeScript/JavaScript files
echo "Searching for console.* usage in operational code..."
VIOLATIONS=()

# Use ripgrep to find console usage
if command -v rg &> /dev/null; then
  # Get all console.* matches with file paths
  while IFS= read -r line; do
    if [[ -n "$line" ]]; then
      file_path=$(echo "$line" | cut -d: -f1)
      
      # Check if this file should be excluded
      if ! should_exclude_file "$file_path"; then
        VIOLATIONS+=("$line")
      fi
    fi
  done < <(rg --type ts --type js --type tsx --type jsx 'console\.' src/ 2>/dev/null || true)
else
  echo "❌ ripgrep (rg) not found. Please install ripgrep for console validation."
  exit 1
fi

# Report results
if [ ${#VIOLATIONS[@]} -eq 0 ]; then
  echo "✅ No console.* usage found in operational code"
  echo "📊 Structured logging compliance: PASSED"
  exit 0
else
  echo "❌ Found ${#VIOLATIONS[@]} console.* usage(s) in operational code:"
  echo
  for violation in "${VIOLATIONS[@]}"; do
    echo "  $violation"
  done
  echo
  echo "🔧 Please replace console.* calls with structured logging:"
  echo "   import { logger, createLogContext } from '@/lib/logger';"
  echo "   logger.info('message', createLogContext('module', 'function', { context }));"
  echo
  echo "📊 Structured logging compliance: FAILED"
  exit 1
fi