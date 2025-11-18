# Development Workflow

This guide covers the day-to-day development workflow, scripts, and best practices for working on the Tiler2 UI project.

## Daily Development Workflow

### 1. Start Development Environment

```bash
# Start the dev server
pnpm dev
```

This command:
- Starts Vite dev server on `http://localhost:3000`
- Enables Hot Module Replacement (HMR)
- Watches for file changes
- Provides fast refresh for React components

**Output:**
```
VITE v6.0.11  ready in 543 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 2. Make Changes

Edit files in `/src` directory. Changes are immediately reflected in the browser thanks to HMR.

**File changes trigger:**
- **TypeScript/JSX files:** Fast refresh (preserves component state)
- **CSS files:** Hot update (no page reload)
- **Config files:** Full reload required

### 3. Check Code Quality

Before committing, run quality checks:

```bash
# Type checking (fastest)
pnpm check

# Linting
pnpm lint

# Formatting
pnpm format:check
```

**Fix issues automatically:**

```bash
# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### 4. Test Changes

**Manual Testing:**
1. Test in browser at `http://localhost:3000`
2. Test authentication flow
3. Test chat functionality
4. Test on mobile viewport (Chrome DevTools → Toggle device toolbar)

**Automated Testing:** Currently no automated tests. See [Testing Strategy](./37-testing-strategy.md) for recommendations.

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add user profile dropdown"

# Push to branch
git push -u origin feature/user-profile
```

**Commit message format:** Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

---

## Available Scripts

### Development

#### `pnpm dev`

Starts the development server with hot module replacement.

**Usage:**
```bash
pnpm dev
```

**Options:**
```bash
# Expose to network (access from other devices)
pnpm dev --host

# Use different port
pnpm dev --port 3001
```

**When to use:** Daily development work

---

#### `pnpm check`

Runs TypeScript type checking without emitting files. Fast and recommended for frequent checks.

**Usage:**
```bash
pnpm check
```

**Output example:**
```bash
$ tsc --noEmit
# No output = success
# Errors displayed if type issues found
```

**When to use:** Before committing, during development

---

#### `pnpm lint`

Runs ESLint to check for code quality issues.

**Usage:**
```bash
pnpm lint
```

**Output example:**
```bash
✖ 3 problems (2 errors, 1 warning)
  2 errors and 0 warnings potentially fixable with the `--fix` option.
```

**When to use:** Before committing, in CI/CD

---

#### `pnpm lint:fix`

Automatically fixes ESLint issues where possible.

**Usage:**
```bash
pnpm lint:fix
```

**What it fixes:**
- Missing semicolons
- Unused imports
- Inconsistent spacing
- Fixable rule violations

**What it doesn't fix:**
- Logic errors
- Unused variables (removes them)
- Type errors

**When to use:** After making changes, before committing

---

#### `pnpm format`

Formats code using Prettier.

**Usage:**
```bash
pnpm format
```

**What it formats:**
- TypeScript/JavaScript files
- CSS files
- JSON files
- Markdown files
- Tailwind class names (sorted)

**When to use:** Before committing, or set up auto-format on save in your editor

---

#### `pnpm format:check`

Checks if code is properly formatted without modifying files.

**Usage:**
```bash
pnpm format:check
```

**Output:**
```bash
Checking formatting...
All matched files use Prettier code style!
```

**When to use:** In CI/CD to enforce formatting

---

### Build

#### `pnpm build`

Creates a production build in the `/dist` directory.

**Usage:**
```bash
pnpm build
```

**Build process:**
1. Runs TypeScript type checking (`tsc`)
2. Builds with Vite
3. Minifies JavaScript and CSS
4. Generates source maps
5. Uploads source maps to Sentry (if configured)

**Output:**
```bash
vite v6.0.11 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     12.34 kB │ gzip:  3.45 kB
dist/assets/index-def456.js     234.56 kB │ gzip: 78.90 kB
✓ built in 12.34s
```

**When to use:** Before deployment, to verify build success

---

#### `pnpm preview`

Previews the production build locally.

**Usage:**
```bash
pnpm build
pnpm preview
```

**Server:** `http://localhost:4173`

**When to use:** Testing production build before deployment

---

#### `pnpm analyze`

Generates a visual bundle size analysis.

**Usage:**
```bash
pnpm analyze
```

**Output:** Opens `stats.html` in browser showing:
- Bundle size breakdown
- Largest dependencies
- Code splitting effectiveness
- Duplicate code detection

**When to use:**
- Investigating large bundle sizes
- Optimizing performance
- Identifying unnecessary dependencies

---

### Code Quality

#### `pnpm knip`

Detects dead code, unused dependencies, and exports.

**Usage:**
```bash
pnpm knip
```

**What it finds:**
- Unused files
- Unused dependencies in `package.json`
- Unused exports
- Unreachable code

**When to use:** Periodic cleanup, before major releases

---

## Git Workflow

### Branch Strategy

**Main branches:**
- `main` - Production-ready code
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-name`
- Hotfixes: `hotfix/issue-name`

### Creating a Feature Branch

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create and checkout feature branch
git checkout -b feature/user-settings

# Make changes, commit, push
git add .
git commit -m "feat: add user settings page"
git push -u origin feature/user-settings
```

### Pull Request Workflow

1. **Create PR** on GitHub
2. **CI checks run** automatically:
   - Format check
   - Lint check
   - Spelling check
3. **Code review** by team member
4. **Address feedback** if needed
5. **Merge** once approved and checks pass

### Pre-commit Checklist

Before committing, ensure:

- [ ] Code is formatted (`pnpm format`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Type checking passes (`pnpm check`)
- [ ] Manual testing completed
- [ ] No console errors in browser
- [ ] Commit message follows conventional commits format

---

## Editor Setup

### Visual Studio Code (Recommended)

**Extensions:**
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- TypeScript and JavaScript Language Features (built-in)

**Settings (`.vscode/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

**Keyboard shortcuts:**
- Format document: `Shift + Alt + F`
- Auto fix: `Cmd/Ctrl + .`
- Quick fix: `Cmd/Ctrl + .`
- Go to definition: `F12`
- Find references: `Shift + F12`

### WebStorm / IntelliJ IDEA

**Settings:**
1. Preferences → Languages & Frameworks → JavaScript → Prettier
   - Enable: "On save"
   - Enable: "On code reformat"
2. Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Enable: "Automatic ESLint configuration"
   - Enable: "Run eslint --fix on save"

### Vim / Neovim

Use coc.nvim or built-in LSP with:
- `typescript-language-server`
- `eslint-language-server`
- `prettier` via `null-ls` or `conform.nvim`

---

## Debugging

### Browser DevTools

**Chrome/Edge DevTools:**
1. Open DevTools: `F12` or `Cmd/Ctrl + Shift + I`
2. Enable React DevTools extension
3. Use Sources tab for breakpoints
4. Console for errors and logs

**React DevTools:**
- Install: [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- Features: Component tree, props inspection, state inspection, profiler

### VSCode Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

**Usage:**
1. Start dev server (`pnpm dev`)
2. Press `F5` in VSCode
3. Set breakpoints in editor
4. Debug with full IDE support

### Common Debug Scenarios

**Debugging API calls:**
```typescript
// Add console logs in http-client.ts
console.log("Request:", { url, method, data });
```

**Debugging state changes:**
```typescript
// Use useEffect to log state
useEffect(() => {
  console.log("State changed:", state);
}, [state]);
```

**Debugging renders:**
```typescript
// Use React DevTools Profiler
// Or add console.log in render
console.log("Rendering MyComponent", props);
```

---

## Performance Optimization Workflow

### Measuring Performance

1. **Build production bundle:**
   ```bash
   pnpm build
   pnpm analyze
   ```

2. **Check bundle size:**
   - Open `stats.html`
   - Identify large dependencies
   - Look for duplicates

3. **Run Lighthouse:**
   - Chrome DevTools → Lighthouse
   - Run audit on production build
   - Target: 90+ scores

### Optimization Techniques

1. **Code splitting:**
   - Use dynamic imports: `const Component = lazy(() => import("./Component"))`
   - Adjust `manualChunks` in `vite.config.ts`

2. **Dependency optimization:**
   - Remove unused dependencies
   - Replace large libraries with smaller alternatives
   - Use tree-shaking friendly imports

3. **Asset optimization:**
   - Compress images (use WebP)
   - Lazy load images
   - Use CDN for large assets

See [Performance Optimization](./22-performance.md) for detailed strategies.

---

## Common Workflows

### Adding a New Feature

1. Create feature branch
2. Create feature directory in `/src/features`
3. Implement components, hooks, services
4. Add exports in feature's `index.ts`
5. Update documentation
6. Test manually
7. Create PR

### Fixing a Bug

1. Create fix branch
2. Reproduce the bug locally
3. Add debug logs to identify root cause
4. Implement fix
5. Verify fix resolves issue
6. Check for regressions
7. Create PR with reproduction steps

### Refactoring Code

1. Create refactor branch
2. Run `pnpm check` and `pnpm lint` before changes (establish baseline)
3. Make refactoring changes
4. Ensure tests still pass (or functionality unchanged)
5. Run `pnpm check` and `pnpm lint` after changes
6. Create PR with explanation of refactoring benefits

### Updating Dependencies

```bash
# Check for outdated packages
pnpm outdated

# Update specific package
pnpm update package-name

# Update all packages (use with caution)
pnpm update

# After updating, verify:
pnpm install
pnpm check
pnpm lint
pnpm build
```

**IMPORTANT:** Test thoroughly after dependency updates, especially major versions.

---

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration.

**Workflow file:** `.github/workflows/ci.yml`

**Jobs:**
1. **Format Check** - Runs `pnpm format:check`
2. **Lint** - Runs `pnpm lint`
3. **Spelling** - Runs codespell on README and source code

**Triggers:**
- Push to `main`
- Pull requests
- Manual dispatch

**Status:** Check GitHub Actions tab for build status

---

## Troubleshooting

### Dev Server Won't Start

**Issue:** Error starting dev server

**Solutions:**
1. Check port 3000 isn't in use: `lsof -i :3000` (Mac/Linux)
2. Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
3. Clear Vite cache: `rm -rf node_modules/.vite`

### HMR Not Working

**Issue:** Changes not reflected in browser

**Solutions:**
1. Hard refresh: `Cmd/Ctrl + Shift + R`
2. Restart dev server
3. Check browser console for errors
4. Disable browser extensions

### Type Errors After Dependency Update

**Issue:** TypeScript errors after updating packages

**Solutions:**
1. Delete `node_modules` and reinstall
2. Restart TypeScript server in editor
3. Check for breaking changes in package changelogs
4. Update type definitions: `pnpm update @types/*`

### Build Fails in CI But Works Locally

**Issue:** CI build fails but local build succeeds

**Solutions:**
1. Ensure all environment variables are set in CI
2. Check Node.js version matches (CI uses 18.x)
3. Clear local cache and rebuild: `pnpm clean && pnpm build`
4. Check for platform-specific code (Windows vs Linux)

---

**Next:** [Architecture Overview](./04-architecture.md)
