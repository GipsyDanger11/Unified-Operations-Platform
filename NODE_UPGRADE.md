# Node.js Upgrade Instructions

## Current Issue
You're using Node.js 22.11.0, but Vite requires Node.js version 22.12+ or 20.19+.

## Solution: Upgrade Node.js

### Option 1: Using Node Version Manager (nvm) - Recommended

If you have nvm installed:

```bash
# Install latest Node.js 22.x
nvm install 22

# Use the new version
nvm use 22

# Verify version
node --version
```

### Option 2: Download from Official Website

1. Visit https://nodejs.org/
2. Download the **LTS version** (currently 22.12+)
3. Run the installer
4. Restart your terminal
5. Verify: `node --version`

### Option 3: Using Chocolatey (Windows)

```bash
choco upgrade nodejs
```

## After Upgrading

Once you've upgraded Node.js, run:

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Start the frontend
npm run dev
```

## Quick Fix (Temporary)

If you can't upgrade immediately, you can try using the `--ignore-engines` flag:

```bash
npm run dev --ignore-engines
```

**Note:** This is not recommended as it may cause compatibility issues.
