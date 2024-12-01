# Legion API Contributing Guide

Thank you for considering contributing to Legion API! We appreciate your help in improving it. Before you begin, please take a moment to read through this guide to understand how to contribute effectively and in line with the project's best practices.

- [Contributing](#contributing)  
   - [Reporting Security Vulnerability](#reporting-security-vulnerability)
   - [New Features or Bug Fixes](#new-features-or-bug-fixes)  
   - [Reviewing Pull Requests](#reviewing-pull-requests)  
   - [Writing / Improving Documentation](#writing--improving-documentation)  
- [Getting Started](#getting-started)  
   - [Requirements](#requirements)  
   - [Running Locally](#running-locally)  
- [Testing Guidelines](#testing-guidelines)  
   - [Running Tests](#running-tests)  
   - [Writing Tests](#writing-tests)  
   - [Database Migrations for Tests](#database-migrations-for-tests)  
- [Code Style](#code-style)  
- [Commit Guidelines](#commit-guidelines)  
   - [Commit Message](#commit-message)  
   - [Pre-commit Hooks](#pre-commit-hooks)  
 - [Pull Request](#pull-request)  
   - [Before Pull Request](#before-pull-request)  
   - [After Review](#after-review)  
   - [When Merging](#when-merging)  


# Contributing

## Reporting Security Vulnerability

If you discover a security vulnerability, please check out [SECURITY.md][]. 

## New features or bug fixes

Please make sure there is an open issue discussing your contribution before jumping into a Pull Request!
There are just a few situations (listed below) in which it is fine to submit PR without a corresponding issue:

- Documentation update
- Obvious bug fix
- Maintenance improvement

In all other cases please check if there's an open issue discussing the given proposal, if there is not, create an issue respecting all its template remarks.

Do not submit draft PRs. Submit only finalized and tested work which is ready for merge. If you have any doubts related to implementation work please discuss in the corresponding issue.

Once a PR has been reviewed and some changes are suggested, please ensure to **re-request review** after all new changes are pushed. It's the best and quietest way to inform maintainers that your work is ready to be checked again.

## Reviewing Pull Requests

Another really useful way to contribute to Legion API is to review other people's Pull Requests. Having feedback from multiple people is helpful and reduces the overall time to make a final decision about the Pull Request.

## Writing / improving documentation

Our documentation lives on GitHub in the [README.md][] file. Do you see a typo or other ways to improve it? Feel free to edit it and submit a Pull Request!

# Getting started

The steps below will give you a general idea of how to prepare your local environment for the Legion API.

### Requirements

-   **Node.js LTS v20** (or any later version)
-   (optional) **Docker Engine v17.12.0** with **Docker Compose v1.29.2** (or any later version)
-  **Cloudflare Account**
	- D1 Database ID
	- KV Data Storage ID 

### Running locally

1. Click the fork button in the top right to clone the [Legion API Repository](https://github.com/kimitrii/legion-api/fork)

2. Clone your fork using GitHub CLI, or HTTPS.

   ```bash
   git clone https://github.com/<YOUR_GITHUB_USERNAME>/legion-api.git # HTTPS
   gh repo clone <YOUR_GITHUB_USERNAME>/legion-api # GitHub CLI
   ```

3. Change into the ./legion-api directory.

   ```bash
   cd legion-api
   ```

4. Create a remote to keep your fork and local clone up-to-date.

   ```bash
   git remote add upstream https://github.com/kimitrii/legion-api.git # HTTPS
   gh repo sync kimitrii/legion-api # GitHub CLI
   ```

5. Create a new branch for your work.

   ```bash
   git checkout -b name-of-your-branch
   ```

6. In the root directory, create a file named `wrangler.toml` to bind Cloudflare used resources. Copy the contents from the `wrangler.toml.example` file, and make the following replacements:
	-   Replace `<your-project-name>` with your actual project name.
	-   Replace `<your-database-name>` with the name of your D1 database.
	-   Replace `<your-database-id>` with your D1 database ID.

7. Run the following to install the dependencies and start a local preview of your work.
7.1 You can run the following commands to run the project locally using **pnpm**:

   ```bash
   pnpm install # installs this project's dependencies
   pnpm dev # starts a development environment
   ```
   This will run the Legion API on your local machine, and you can access it directly on port `:8787`.
   
   7.2 Alternatively, the Legion API can also be run inside a Docker container with the following commands:
	```bash
   docker compose up -d
   ```
    This will build the container and start the application, and the application can be accessed via port `:8787`.

8. Perform your changes! 

## Testing Guidelines

### Running Tests
To ensure code quality and coverage:
```
pnpm test
```
This will execute all tests and provide a coverage report.

### Writing Tests

-   Create test files inside the `./tests` folder located at the root of the project.
-   The file structure inside `./tests` must mirror the structure of the codebase.
    -   For example, if you are testing `src/services/user.ts`, the corresponding test file should be located at `tests/services/user.test.ts`.


### Database Migrations for Tests
For tests that involve database (e.g., end-to-end tests using D1 in memory DB), you might need to apply migrations to set up the database schema.

In this case, you can use the following approach to apply migrations before running the tests:

```typescript
import { applyD1Migrations, env } from 'cloudflare:test'

beforeAll(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
})
```
### Coverage

We aim for a (near) 100% test coverage, so make sure your tests cover as much of your code as possible.

# Code Style

We aim for a clean, consistent code style. We're using [BiomeJs][] to confirm one code formatting style and helps us to stay away from obvious issues that can be picked via static analysis.

Ideally, you should have BiomeJs integrated into your code editor, which will help you not think about specific rules and be sure you submit the code that follows guidelines.

## Verifying linting style

```
pnpm lint
```

# Commit Guidelines

This project follows the [Conventional Commits][] specification.

We appreciate and prioritize Signed Commits. You can read more about [Commit Signing][] here.

## Commit Message

- Commit messages must include a "type" as described on [Conventional Commits][]
- Commit messages **must not** end with a period `.`

## Pre-commit Hooks

This project uses [Husky][] for Git pre-commit hooks, ensuring adherence to the [Commit Guidelines](#commit-guidelines) and maintaining a consistent [Code Style](#code-style).


# Pull Request

To ensure a smooth process and get your code merged, please follow these steps:

## Before Pull Request


- **Tests and Lint**: Ensure all tests (`pnpm test`) and lint checks (`pnpm lint`) pass locally. The CI will validate these checks automatically.
- **Fill Out the PR Template**: When you create a PR, a template will appear with sections for you to fill out:
   - **Changes Made**: include a description of what was modified in this PR. Also include any relevant motivation or context.
   - **Changes Type**: Choose the appropriate type of change:
     - Bug fix: If the PR fixes an existing bug.
     - New feature: If the PR introduces a new feature or enhancement.
     - Breaking change: If the PR introduces a change that breaks backward compatibility (e.g., API changes).
     - Documentation update: If the PR is only related to documentation.
   - **Checklist**: Confirm the following checklist:
     - The changes do not generate new error logs or warnings.
     - I have added tests that prove the fix or new feature works as expected.
     - Both new and existing tests pass locally.
- **Resolve Issues**:
   - If any check fails in the PR, fix the issue locally, commit the changes, and push to your fork again.
- **Request a Review**: All PRs require at least one approved review before being merged.

## After Review
If modifications are requested during the review, make the necessary changes, push the updates, and re-request a review.

## When merging

Once everything is approved and all discussions are approved, your contribution will be merged into the production API. Thank you for helping to improve **Legion**. We are stronger with you! 🎉


[Conventional Commits]: https://www.conventionalcommits.org/
[Commit Signing]: https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits
[Husky]: https://typicode.github.io/husky/
[BiomeJs]: https://biomejs.dev
[README.md]: https://github.com/kimitrii/legion-api/blob/main/README.md
[SECURITY.md]: https://github.com/kimitrii/legion-api/blob/main/SECURITY.md
