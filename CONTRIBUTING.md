# Contributing to [Project Name]

Thank you for considering contributing to this project! We appreciate your help in improving it. Before you begin, please take a moment to read through this guide to understand how to contribute effectively and in line with the project's best practices.

## How to Contribute

### 1. Fork the Repository
Start by forking this repository to your own GitHub account.

### 2. Clone the Repository to Your Local Machine
After forking, clone the repository to your local development environment:
```bash
git clone https://github.com/kimitrii/legion-backend.git
````

### 3. Create a Branch for Your Changes
Create a new branch for the changes you're going to make:
```bash
git checkout -b your-branch-name
````

Now, make your contribution!

### 4. Commit Message Format: Tags and How to Use Them

We use **Conventional Commits** for our commit messages. Here are the tags you should use when making commits:

#### 4.1 `feat:` (feature)
- **Usage:** When adding a new feature to the project.
- **Example:**  
  `feat: add user authentication system`

#### 4.2 `fix:` (fix)
- **Usage:** For bug fixes.
- **Example:**  
  `fix: resolve issue with login form validation`

#### 4.3 `docs:` (documentation)
- **Usage:** For changes or improvements to documentation.
- **Example:**  
  `docs: update README with installation instructions`

#### 4.4 `style:` (styling)
- **Usage:** For changes to the style or formatting of the code (e.g., indentation, spacing, semicolons), without changing functionality.
- **Example:**  
  `style: fix indentation in authentication.js`

#### 4.5 `refactor:` (refactor)
- **Usage:** For code changes that improve the design or structure without changing the external behavior.
- **Example:**  
  `refactor: simplify user service logic`

#### 4.6 `perf:` (performance)
- **Usage:** When improving the performance of the code.
- **Example:**  
  `perf: optimize image loading time by lazy loading images`

#### 4.7 `test:` (test)
- **Usage:** For adding or fixing tests (e.g., unit, integration, or UI tests).
- **Example:**  
  `test: add unit test for user registration`

#### 4.8 `chore:` (chore)
- **Usage:** For maintenance tasks or changes that don’t directly affect the functionality, such as dependency updates or development tool configurations.
- **Example:**  
  `chore: update npm dependencies`

#### 4.9 `ci:` (Continuous Integration)
- **Usage:** For changes related to the continuous integration pipeline, such as CI tool configurations or build scripts.
- **Example:**  
  `ci: add GitHub Actions workflow for automated testing`

#### 4.10 `build:` (build)
- **Usage:** For changes to build scripts or configurations.
- **Example:**  
  `build: update webpack config to include production optimizations`

#### 4.11 `revert:` (revert)
- **Usage:** For reverting a previous commit.
- **Example:**  
  `revert: undo changes to user authentication flow`

---

### 5 Testing Your Changes

- Before submitting your pull request, ensure your code passes all tests.
- Follow any setup instructions in the README or configuration files to ensure your environment is properly configured.
- For any new feature you contribute, ensure that appropriate tests are added to verify its functionality.
