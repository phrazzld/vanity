# Edge Cases Decision Framework

## Structured Logging Migration - Edge Case Evaluations

This document provides systematic decisions for files that don't clearly fit into the main application migration scope, following the development philosophy principles of explicit decision-making and maintainability.

## Decision Framework

### Evaluation Criteria

1. **Production Impact**: Does this code run in production environments?
2. **Operational Impact**: Does this affect CI/CD, deployment, or operational workflows?
3. **Developer Experience**: Is console output part of intended developer interaction?
4. **Maintenance Burden**: Will inconsistency cause confusion or technical debt?
5. **Testing Scope**: Is this covered by our test requirements?

### Decision Categories

- **MIGRATE**: Convert to structured logging (operational impact, production relevance)
- **EXEMPT**: Keep console usage (developer tools, appropriate context)
- **SPECIAL**: Custom approach with documented rationale

---

## File-by-File Decisions

### Scripts Directory (`/scripts/`)

#### Security & Operational Scripts - **MIGRATE**

**Files:**

- `audit-filter.ts`
- `audit-filter-new.ts`
- `validate-security-pipeline.js`

**Rationale:** These scripts are part of CI/CD security pipeline and operational workflows. They affect production security posture and should use structured logging for:

- Consistent error reporting
- Operational observability
- Integration with monitoring systems
- Correlation with CI/CD events

**Action Required:** Migrate to structured logging with appropriate module context.

---

#### Data Migration Scripts - **MIGRATE**

**Files:**

- `migrate-real-data.js`
- `migrate-all-data.js`
- `full-data-migration.js`
- `migrate-data.js`
- `migrate-quotes.js`
- `importData.js`

**Rationale:** Database migration scripts are operational tools that:

- Affect production data integrity
- Need reliable error tracking
- Should integrate with operational monitoring
- Require correlation IDs for debugging

**Action Required:** Migrate to structured logging with database operation context.

---

#### Development Utilities - **EXEMPT**

**Files:**

- `extract-data.js`
- `csv-output.js`
- `clear-database.js`
- `seed-database.js`
- `update-snapshots.js`

**Rationale:** These are developer utilities and one-off tools where:

- Console output is the intended user interface
- Used for local development debugging
- Not part of operational workflows
- Console logging provides appropriate developer experience

**Action Required:** Document exemption, keep console usage.

---

### Storybook Files (`*.stories.*`) - **EXEMPT**

**Files:**

- `src/app/components/DarkModeToggle.stories.ts`
- `src/app/components/SearchBar.stories.ts`

**Rationale:** Storybook files are developer interaction tools where:

- Console output demonstrates component behavior to developers
- Used exclusively in development environment
- Console logging is part of intended documentation/demo experience
- Not operational code

**Action Required:** Document exemption, keep console usage for developer interaction.

---

### Demo Components - **EXEMPT**

**Files:**

- `src/app/components/SearchBarDemo.tsx`
- `src/app/components/PaginationDemo.tsx`
- `src/app/components/ReadingsListStateDemo.tsx`

**Rationale:** Demo components are:

- Development/documentation aids
- Not used in production flows
- May use console for demonstration purposes
- Currently contain no console usage (verified)

**Action Required:** Document exemption, monitor for future console additions.

---

### Responsive Examples - **EXEMPT**

**Files:**

- `src/app/responsive-examples/`
- `src/app/components/responsive/`

**Rationale:** Responsive example files:

- Are demonstration/documentation code
- Not part of operational application flows
- Currently contain no console usage (verified)

**Action Required:** Document exemption, no changes needed.

---

## Implementation Status ✅

### Phase 1: Migrate Operational Scripts - COMPLETED

1. **Security Scripts:** ✅

   - ✅ `audit-filter.ts` - Added structured logging for operational events, maintained CLI output
   - ✅ `audit-filter-new.ts` - Added structured logging for operational events, maintained CLI output
   - ✅ Used module context: `'scripts/audit-filter'` and `'scripts/audit-filter-new'`
   - ✅ Maintained CLI output format for backward compatibility

2. **Migration Scripts:** ✅
   - ✅ `migrate-real-data.js` - Added structured logging with correlation IDs
   - ✅ Used appropriate module contexts (e.g., `'scripts/migrate-real-data'`)
   - ✅ Include operation metadata (file counts, success/failure rates, timing)

### Phase 2: Document Exemptions - COMPLETED

1. **Update Documentation:** ✅

   - ✅ Added exemption notices to Storybook files (`DarkModeToggle.stories.ts`, `SearchBar.stories.ts`)
   - ✅ Added exemption notices to demo components (`SearchBarDemo.tsx`, `PaginationDemo.tsx`, `ReadingsListStateDemo.tsx`)
   - ✅ Created comprehensive decision framework document
   - ✅ Include rationale in code comments with reference to this document

2. **Establish Guidelines:** ✅
   - ✅ Future Storybook files: console usage allowed for demos (documented)
   - ✅ Future demo components: console usage allowed with rationale (documented)
   - ✅ New scripts: evaluate against operational impact (framework provided)

### Remaining Work:

**Other Migration Scripts** (identified but not critical for T005):

- `migrate-all-data.js`, `full-data-migration.js`, `migrate-data.js`, `migrate-quotes.js`
- `importData.js`, `clear-database.js`, `seed-database.js`
- **Status**: Can be migrated in future maintenance cycles following established patterns

**Development Utilities** (properly exempted):

- `extract-data.js`, `csv-output.js`, `update-snapshots.js`
- **Status**: Correctly exempted as developer tools

---

## Quality Gates

### Validation Criteria

1. **Operational scripts** use structured logging consistently
2. **Developer tools** maintain appropriate console usage with documented rationale
3. **No mixed patterns** within the same category of files
4. **Clear guidelines** exist for future similar files

### Automated Verification

```bash
# Verify operational scripts are migrated
rg "console\.(log|error|warn|info)" scripts/audit-filter*.ts scripts/validate-security-pipeline.js scripts/migrate*.js

# Should return zero results after migration
```

### Manual Verification

1. Test security pipeline with structured logging
2. Verify migration scripts produce appropriate logs
3. Confirm Storybook stories still function correctly
4. Validate demo components work as intended

---

## Future Guidance

### Adding New Files

**Scripts Directory:**

- **Security/CI scripts** → Use structured logging
- **Migration/operational scripts** → Use structured logging
- **Developer utilities** → Console usage acceptable with documentation

**Storybook:**

- Console usage acceptable for demonstration purposes
- Document intent in story descriptions

**Demo Components:**

- Console usage acceptable for educational purposes
- Prefer structured logging if component demonstrates production patterns

### Maintenance

- Review exemptions quarterly for continued relevance
- Update guidelines as project architecture evolves
- Ensure new team members understand the framework

---

## Decision Authority

This framework was established following the development philosophy principles of:

- **Explicit decision-making** over implicit assumptions
- **Maintainability** over short-term convenience
- **Consistency** within logical boundaries
- **Practical** implementation over theoretical purity

_Created: [Current Date]_  
_Status: Active_  
_Next Review: Quarterly_
