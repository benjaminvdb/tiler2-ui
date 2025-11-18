# Quick Start Guide

This guide will help you set up and run the Tiler2 UI application locally in under 10 minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** Version 18.x or higher ([Download](https://nodejs.org/))
- **pnpm:** Version 10.14.0 or higher ([Install](https://pnpm.io/installation))
- **Git:** For cloning the repository
- **Auth0 Account:** Free account at [auth0.com](https://auth0.com/) for authentication
- **LangGraph Server:** Running instance of LangGraph API (typically on port 2024)

### Verify Installation

```bash
node --version   # Should be 18.x or higher
pnpm --version   # Should be 10.14.0 or higher
git --version    # Any recent version
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/langchain-ai/agent-chat-ui.git
cd agent-chat-ui
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies including React, Vite, TypeScript, Tailwind CSS, and more.

**Expected time:** 1-2 minutes

### 3. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 4. Configure Auth0

You need to set up Auth0 for authentication. Follow these steps:

#### Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application (Single Page Application)
3. Note your **Domain** and **Client ID**
4. Configure application settings:
   - **Allowed Callback URLs:** `http://localhost:3000`
   - **Allowed Logout URLs:** `http://localhost:3000`
   - **Allowed Web Origins:** `http://localhost:3000`

#### Update .env.local

Edit `/home/user/tiler2-ui/.env.local` with your Auth0 credentials:

```bash
# Required: Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here

# Required: Application Base URL
VITE_APP_BASE_URL=http://localhost:3000

# Optional: LangGraph API URL (defaults to http://localhost:2024)
VITE_API_URL=http://localhost:2024

# Optional: Assistant/Graph ID (defaults to "assistant")
VITE_ASSISTANT_ID=assistant

# Optional: Auth0 API Audience (if using API authorization)
# VITE_AUTH0_AUDIENCE=your-api-audience

# Optional: Sentry Error Tracking
# VITE_SENTRY_DSN=your-sentry-dsn
```

**IMPORTANT:** Replace `your-tenant.auth0.com` and `your-client-id-here` with your actual Auth0 credentials.

### 5. Start LangGraph Server

The application requires a running LangGraph API server. Start your LangGraph server:

```bash
# Example (implementation-specific):
# cd /path/to/langgraph-server
# python -m uvicorn main:app --host 0.0.0.0 --port 2024
```

Verify the server is running by visiting `http://localhost:2024/health` in your browser.

### 6. Start Development Server

```bash
pnpm dev
```

The application will start on **http://localhost:3000**

**Expected output:**

```
  VITE v6.0.11  ready in 543 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 7. Open in Browser

Navigate to **http://localhost:3000** in your browser.

You should see:
1. A redirect to Auth0 login page
2. After login, redirect back to the application
3. The main chat interface with sidebar

## Verify Installation

### Test Authentication

1. Click "Log in" (if not automatically redirected)
2. Enter your credentials or sign up for a new account
3. After successful login, you should see your user avatar in the top-right corner

### Test Chat Functionality

1. Click "New Chat" or press `Cmd/Ctrl + Alt + C`
2. Type a message in the input box
3. Press Enter or click the send button
4. Verify you see a streaming response from the AI agent

### Test Workflows

1. Click "Workflows" or press `Cmd/Ctrl + Alt + W`
2. Verify you see a list of available workflows
3. Click on a workflow to start a new conversation with that workflow

## Common Setup Issues

### Issue: `pnpm: command not found`

**Solution:** Install pnpm globally:

```bash
npm install -g pnpm
```

### Issue: `Port 3000 is already in use`

**Solution:** Either stop the process using port 3000 or change the port in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3001, // Change to any available port
  },
});
```

### Issue: Auth0 login fails with "Callback URL mismatch"

**Solution:** Ensure your Auth0 application settings include `http://localhost:3000` in:
- Allowed Callback URLs
- Allowed Logout URLs
- Allowed Web Origins

### Issue: Cannot connect to LangGraph API

**Solution:** Verify:
1. LangGraph server is running on the correct port (default: 2024)
2. `VITE_API_URL` in `.env.local` matches your server URL
3. API is accessible at `http://localhost:2024/health`

### Issue: TypeScript errors in editor

**Solution:** Ensure your editor is using the workspace TypeScript version:
- **VSCode:** Press `Cmd/Ctrl + Shift + P` → "TypeScript: Select TypeScript Version" → "Use Workspace Version"

## Next Steps

Now that you have the application running, explore:

- [Configuration Guide](./02-configuration.md) - Learn about all configuration options
- [Development Workflow](./03-development-workflow.md) - Development practices and scripts
- [Architecture Overview](./04-architecture.md) - Understand the system architecture
- [Chat System](./08-chat-system.md) - Learn how the chat system works

## Quick Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm check            # Type checking (fast)
pnpm lint             # Lint code
pnpm format           # Format code

# Build
pnpm build            # Production build
pnpm preview          # Preview production build

# Quality
pnpm lint:fix         # Fix linting issues
pnpm format:check     # Check formatting
pnpm knip             # Detect dead code
pnpm analyze          # Analyze bundle size
```

## Development vs Production

### Development Mode (`pnpm dev`)

- Hot module replacement (HMR) enabled
- Source maps for debugging
- Fast refresh for React components
- Development-only warnings and checks
- Runs on http://localhost:3000

### Production Build (`pnpm build`)

- Minified and optimized code
- Code splitting for better performance
- Tree-shaking to remove unused code
- Production-ready bundle in `/dist` directory
- Requires deployment to a web server

## Support

If you encounter issues not covered here:

1. Check [Common Issues](./43-common-issues.md)
2. Review [FAQ](./44-faq.md)
3. Search existing GitHub issues
4. Create a new issue with detailed information

---

**Next:** [Configuration Guide](./02-configuration.md)
