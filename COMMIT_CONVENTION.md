# Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This leads to more readable messages that are easy to follow when looking through the project history and enables automatic versioning and changelog generation.

## Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**. The header has a special format that includes a **type**, an optional **scope**, and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory, while the **scope**, **body**, and **footer** are optional.

## Type

The type must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (formatting, missing semi-colons, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Scope

The scope should be the name of the module affected (as perceived by the person reading the changelog generated from commit messages). Common scopes include:

- **ui**: User interface components
- **api**: API-related changes
- **auth**: Authentication and authorization
- **db**: Database-related changes
- **config**: Configuration changes
- **deps**: Dependency updates

## Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end

## Body

The body should include the motivation for the change and contrast this with previous behavior. It should explain the change, not the implementation details.

## Footer

The footer should contain information about Breaking Changes and reference GitHub issues that this commit closes.

## Examples

```
feat(ui): add search bar to readings list
```

```
fix(api): correct pagination issue in quotes endpoint

The pagination calculation was incorrectly returning the total count,
causing the UI to display the wrong number of pages.

Fixes #123
```

```
refactor(auth): simplify authentication flow

BREAKING CHANGE: `loginWithEmail` method has been removed, use `authenticate` instead
```

## Tools

This project uses the following tools to enforce commit message conventions:

- **commitlint**: Checks commit messages against the conventional commit format
- **husky**: Runs commitlint on commit-msg git hook

Commit messages that don't follow the convention will be rejected.
