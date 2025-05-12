# Contributing to Vanity

Thank you for your interest in contributing to the Vanity project! This guide outlines the contribution process, standards, and expectations to ensure a smooth and productive experience for everyone involved.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Pull Request Process](#pull-request-process)
- [Quality Expectations](#quality-expectations)
- [Commit Guidelines](#commit-guidelines)
- [Release Process](#release-process)
- [Community Guidelines](#community-guidelines)

## Introduction

Vanity is a personal website built with Next.js, featuring a collection of readings, travel map, and quotes with a minimalist design aesthetic. The project emphasizes type safety, accessibility, and maintainable code architecture.

This document provides guidelines and instructions for contributing to the project. It covers the entire process from setting up your development environment to getting your changes merged.

## Getting Started

### Prerequisites and Setup

For detailed setup instructions, please refer to our [Development Setup Guide](docs/DEVELOPMENT_SETUP.md), which covers:

- Required software and tools
- Repository setup
- Environment configuration
- Database setup
- Running the application locally

### Key Project Resources

- [README.md](README.md): Project overview
- [DEVELOPMENT_PHILOSOPHY.md](docs/DEVELOPMENT_PHILOSOPHY.md): Core development principles
- [STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md): State management approach
- [ACCESSIBILITY.md](docs/ACCESSIBILITY.md): Accessibility guidelines

## Development Workflow

### Step-by-Step Process

1. **Identify a Task**: Pick an issue from the issue tracker or a task from the project board. If you want to work on something that's not listed, please create an issue first to discuss it.

2. **Setup Your Environment**: Ensure your local development environment is properly set up according to the [Development Setup Guide](docs/DEVELOPMENT_SETUP.md).

3. **Create a Branch**: Create a new branch following our [branch naming conventions](#branch-naming-conventions).

4. **Implement Changes**: Make your changes, following our [quality expectations](#quality-expectations) and [development philosophy](docs/DEVELOPMENT_PHILOSOPHY.md).

5. **Test Your Changes**: Run tests to ensure your changes don't break existing functionality:

   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

6. **Commit Your Changes**: Follow our [commit guidelines](#commit-guidelines).

7. **Create a Pull Request**: Submit a PR for review, following our [pull request process](#pull-request-process).

8. **Address Feedback**: Make any necessary changes based on code review feedback.

9. **Merge**: Once approved, your PR will be merged into the main branch.

### Local Development Workflow

1. **Run the Development Server**:

   ```bash
   npm run dev
   ```

2. **View Logs** (if needed):

   ```bash
   npm run logs:watch
   ```

3. **Run Tests in Watch Mode** (for TDD):

   ```bash
   npm run test:watch
   ```

4. **Use Storybook** for component development:
   ```bash
   npm run storybook
   ```

## Branch Naming Conventions

Branches should follow a consistent naming pattern based on the type of change:

- **Feature Branches**: `feature/description-of-feature`

  - Example: `feature/dark-mode-toggle`

- **Bug Fix Branches**: `fix/description-of-bug`

  - Example: `fix/pagination-calculation`

- **Documentation Branches**: `docs/what-was-documented`

  - Example: `docs/api-endpoints`

- **Refactoring Branches**: `refactor/what-was-refactored`

  - Example: `refactor/auth-flow`

- **Testing Branches**: `test/what-was-tested`

  - Example: `test/keyboard-navigation`

- **Performance Branches**: `perf/what-was-optimized`

  - Example: `perf/image-loading`

- **Planning Branches**: `plan/what-was-planned`

  - Example: `plan/infrastructure-ci-cd`

- **Release Branches**: `release/vX.Y.Z`

  - Example: `release/v1.2.0`

- **Hotfix Branches**: `hotfix/description`
  - Example: `hotfix/critical-auth-bug`

**Guidelines**:

- Use lowercase with hyphens to separate words
- Be concise but descriptive
- Include issue number if applicable (e.g., `feature/user-profile-#123`)

## Pull Request Process

### Creating a Pull Request

1. **Push your branch** to the repository:

   ```bash
   git push -u origin your-branch-name
   ```

2. **Create a new PR** via the GitHub web interface.

3. **Fill out the PR template** completely, including:
   - Clear description of changes
   - Link to related issue(s)
   - Screenshot/video for UI changes
   - Test plan or results
   - Checklist of completed items

### PR Requirements

- **Title**: Use the same format as [commit messages](#commit-guidelines)

  - Example: `feat(ui): add dark mode toggle to settings page`

- **Description**: Provide context, reasoning, and details about implementation choices.

- **Size**: Keep PRs focused and reasonably sized (ideally < 500 lines of code).

- **Tests**: Include appropriate tests for new functionality and bug fixes.

- **Documentation**: Update relevant documentation for significant changes.

### Review Process

1. **CI Checks**: All automated checks must pass before review.

2. **Code Review**: At least one project maintainer will review your code.

3. **Feedback**: Address any feedback or questions raised during review.

4. **Approval**: Once approved, a maintainer will merge your PR.

### Merging Guidelines

- PRs are merged using the "Squash and merge" strategy to maintain a clean commit history.
- The PR title and description will be used for the squashed commit message.
- Branch should be deleted after merging.

## Quality Expectations

### Code Style and Formatting

- Follow the **TypeScript** coding standards outlined in [DEVELOPMENT_PHILOSOPHY_APPENDIX_TYPESCRIPT.md](docs/DEVELOPMENT_PHILOSOPHY_APPENDIX_TYPESCRIPT.md).
- Adhere to the **frontend** development guidelines in [DEVELOPMENT_PHILOSOPHY_APPENDIX_FRONTEND.md](docs/DEVELOPMENT_PHILOSOPHY_APPENDIX_FRONTEND.md).
- Run formatting before committing:
  ```bash
  npm run format
  ```
- Run linting to catch issues:
  ```bash
  npm run lint
  ```

### Testing Requirements

- **Unit Tests**: Required for utility functions and isolated logic.
- **Component Tests**: Required for all React components using React Testing Library.
- **Integration Tests**: Required for API routes and data flow.
- **Coverage**: Maintain or improve existing test coverage. New code should have ≥85% coverage.
- **Test Approach**: Focus on behavior, not implementation. Test from the user's perspective.
- **Approach**: Follow the testing strategy outlined in [DEVELOPMENT_PHILOSOPHY.md](docs/DEVELOPMENT_PHILOSOPHY.md#testing-strategy).

### Documentation Requirements

- **Code Comments**: Explain _why_, not _how_. Use JSDoc for public APIs and complex functions.
- **README Updates**: Update README.md for significant feature additions or changes.
- **API Documentation**: Document new or changed API endpoints.
- **Component Documentation**: Create/update Storybook stories for UI components.

### Accessibility Standards

- All features must meet **WCAG 2.1 AA** compliance standards.
- Run accessibility checks on UI components:
  ```bash
  npm run test-storybook
  ```
- Ensure keyboard navigation works properly.
- Follow guidelines in [ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

### Performance Considerations

- Optimize component rendering using React best practices.
- Minimize bundle size by avoiding unnecessary dependencies.
- Use appropriate data fetching strategies (SSR, SSG, ISR, or client-side based on use case).
- Follow guidelines in responsive design documentation for mobile performance.

### Security Considerations

- Validate all user inputs thoroughly.
- Never expose sensitive information in client-side code.
- Follow secure coding practices outlined in [DEVELOPMENT_PHILOSOPHY.md](docs/DEVELOPMENT_PHILOSOPHY.md#security-considerations).
- Handle authentication and authorization properly.

## Commit Guidelines

The project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. See [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md) for detailed guidelines.

### Key Points

- **Format**: `<type>([scope]): <description>`

  - Example: `feat(api): add endpoint for user preferences`

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

- **Scope**: Component or area affected (e.g., `ui`, `api`, `auth`, `db`)

- **Subject**:

  - Use imperative, present tense (e.g., "add" not "added")
  - Don't capitalize first letter
  - No period at the end

- **Body**: Optional. Explain motivation for the change and contrasts with previous behavior.

- **Footer**: Optional. Reference issues and breaking changes.

### Pre-commit Hooks

The project uses Husky and commitlint to enforce commit message format. Commits that don't follow the convention will be rejected automatically.

## Release Process

### Version Numbering

The project follows [Semantic Versioning](https://semver.org/) (SemVer) with automated version determination based on commit types:

- **Patch Version (0.0.x)**: Automatically incremented for `fix:` commits
- **Minor Version (0.x.0)**: Automatically incremented for `feat:` commits
- **Major Version (x.0.0)**: Automatically incremented for commits with `BREAKING CHANGE:` or `feat!:`

### Release Creation

Releases are created automatically using standard-version, which:

1. Bumps the version in package.json based on commit types
2. Generates/updates the CHANGELOG.md file
3. Creates a git tag for the new version

To create a release manually:

```bash
npm run release        # Automatic version determination
npm run release:patch  # Force patch release
npm run release:minor  # Force minor release
npm run release:major  # Force major release
```

To preview what the next version would look like without making changes:

```bash
npm run release:dry-run
```

### Deployment Process

Deployment to production occurs after a successful release through the CI/CD pipeline. The process includes:

1. Running the full test suite
2. Building the application
3. Deploying to the staging environment
4. Running smoke tests
5. Deploying to production

## Community Guidelines

### Code of Conduct

All contributors are expected to adhere to the project's code of conduct, which promotes a respectful and inclusive environment.

### Communication Channels

- **Issues**: Use GitHub Issues for bug reports, feature requests, and discussions.
- **Pull Requests**: Use GitHub Pull Requests for code contributions and reviews.
- **Discussions**: Use GitHub Discussions for general questions and ideas.

### Issue Reporting Guidelines

When creating an issue, please:

1. Search existing issues to avoid duplicates.
2. Use the provided issue template.
3. Include clear steps to reproduce for bugs.
4. Add relevant information: browser, OS, screenshot/video if applicable.
5. Label the issue appropriately.

---

Thank you for contributing to Vanity! Your efforts help make this project better for everyone.
