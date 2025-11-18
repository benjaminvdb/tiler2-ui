# Testing Strategy

This document outlines the recommended testing approach for the application, including test types, tooling, and implementation patterns.

## Current State

**As of January 2025:** This project currently has **no tests**.

This documentation provides a roadmap for implementing a comprehensive testing strategy when the team decides to add tests.

## Why Testing Matters

Testing provides:
- **Confidence** in refactoring and changes
- **Documentation** of expected behavior
- **Regression prevention** when adding features
- **Faster debugging** with isolated test cases
- **Better design** through testable code patterns

## Recommended Testing Approach

### Testing Pyramid

```
        /\
       /E2E\          Small number (10-20 tests)
      /------\
     /Integration\    Medium number (50-100 tests)
    /------------\
   /Unit Tests    \   Large number (200-500 tests)
  /----------------\
```

**Philosophy:**
- **70% Unit Tests** - Fast, isolated, test individual functions/components
- **20% Integration Tests** - Test feature workflows
- **10% E2E Tests** - Test critical user journeys

## Testing Tools

### 1. Unit Testing: Vitest

**Why Vitest:**
- Native Vite integration (same config, same transforms)
- Fast execution with watch mode
- Jest-compatible API (familiar syntax)
- Built-in code coverage
- TypeScript support out of the box

**Installation:**
```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

**Configuration:** `/home/user/tiler2-ui/vitest.config.ts`
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.config.{ts,js}",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/core": path.resolve(__dirname, "./src/core"),
    },
  },
});
```

**Setup file:** `/home/user/tiler2-ui/src/test/setup.ts`
```typescript
import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### 2. Component Testing: React Testing Library

**Why React Testing Library:**
- Tests user behavior, not implementation details
- Encourages accessible component design
- Integration with Vitest
- Community standard for React testing

**Example component test:**
```typescript
// src/features/thread/components/chat-input.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChatInput } from "./chat-input";

describe("ChatInput", () => {
  it("should render input field", () => {
    render(<ChatInput onSubmit={vi.fn()} />);
    const input = screen.getByPlaceholderText(/type a message/i);
    expect(input).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted", () => {
    const onSubmit = vi.fn();
    render(<ChatInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(/type a message/i);
    const submitButton = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith("Hello");
  });

  it("should disable submit when input is empty", () => {
    render(<ChatInput onSubmit={vi.fn()} />);
    const submitButton = screen.getByRole("button", { name: /send/i });
    expect(submitButton).toBeDisabled();
  });
});
```

### 3. E2E Testing: Playwright

**Why Playwright:**
- Fast and reliable cross-browser testing
- Auto-waiting for elements
- Network interception for API mocking
- Screenshot and video capture
- TypeScript support

**Installation:**
```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

**Configuration:** `/home/user/tiler2-ui/playwright.config.ts`
```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

**Example E2E test:**
```typescript
// e2e/chat-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Chat Flow", () => {
  test("should send message and receive response", async ({ page }) => {
    await page.goto("/");

    // Login (if auth is required)
    await page.click('button:has-text("Login")');
    // ... auth flow

    // Send message
    const input = page.locator('textarea[placeholder*="message"]');
    await input.fill("What is the weather?");
    await page.click('button[type="submit"]');

    // Wait for response
    await expect(page.locator('[data-message-type="ai"]').first())
      .toBeVisible({ timeout: 10000 });

    // Verify response appeared
    const aiMessage = page.locator('[data-message-type="ai"]').first();
    await expect(aiMessage).toContainText(/weather/i);
  });

  test("should upload image and display preview", async ({ page }) => {
    await page.goto("/");

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./test-fixtures/test-image.png");

    // Verify preview
    await expect(page.locator('img[alt*="preview"]')).toBeVisible();
  });
});
```

### 4. Integration Testing

Integration tests verify feature workflows using real (or mocked) API calls.

**Example:**
```typescript
// src/features/thread/thread-flow.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StreamProvider } from "@/core/providers/stream";
import { ThreadView } from "./thread-view";

// Mock API
vi.mock("@langchain/langgraph-sdk", () => ({
  Client: vi.fn(() => ({
    runs: {
      stream: vi.fn(() => ({
        async *[Symbol.asyncIterator]() {
          yield { event: "messages", data: [/* ... */] };
        },
      })),
    },
  })),
}));

describe("Thread Flow Integration", () => {
  it("should complete full message exchange", async () => {
    render(
      <StreamProvider apiUrl="http://test" assistantId="test">
        <ThreadView />
      </StreamProvider>
    );

    // Send message
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.submit(input.closest("form")!);

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/hello/i)).toBeInTheDocument();
    });
  });
});
```

## Test File Organization

### Directory Structure

```
/home/user/tiler2-ui/
├── src/
│   ├── features/
│   │   └── thread/
│   │       ├── components/
│   │       │   ├── chat-input.tsx
│   │       │   └── chat-input.test.tsx       # Unit test
│   │       └── thread-flow.test.tsx          # Integration test
│   ├── shared/
│   │   └── utils/
│   │       ├── format.ts
│   │       └── format.test.ts                # Unit test
│   └── test/
│       ├── setup.ts                          # Test setup
│       ├── mocks/                            # Shared mocks
│       └── fixtures/                         # Test data
├── e2e/
│   ├── chat-flow.spec.ts                     # E2E test
│   └── auth-flow.spec.ts                     # E2E test
└── vitest.config.ts
```

**Naming convention:**
- Unit/Integration: `*.test.tsx` or `*.test.ts`
- E2E: `*.spec.ts`

## Example Test Patterns

### Pattern 1: Testing Hooks

```typescript
// src/features/thread/hooks/use-thread.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useThread } from "./use-thread";

describe("useThread", () => {
  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useThread());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should add message", () => {
    const { result } = renderHook(() => useThread());

    act(() => {
      result.current.addMessage({
        type: "human",
        content: "Hello",
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("Hello");
  });
});
```

### Pattern 2: Testing with Context

```typescript
// src/features/auth/components/protected-route.test.tsx
import { render, screen } from "@testing-library/react";
import { Auth0Provider } from "@auth0/auth0-react";
import { describe, it, expect, vi } from "vitest";
import { ProtectedRoute } from "./protected-route";

const mockAuth0 = {
  isAuthenticated: false,
  isLoading: false,
  loginWithRedirect: vi.fn(),
};

vi.mock("@auth0/auth0-react", () => ({
  Auth0Provider: ({ children }) => children,
  useAuth0: () => mockAuth0,
}));

describe("ProtectedRoute", () => {
  it("should redirect when not authenticated", () => {
    render(<ProtectedRoute><div>Protected</div></ProtectedRoute>);
    expect(mockAuth0.loginWithRedirect).toHaveBeenCalled();
  });
});
```

### Pattern 3: Testing Async Operations

```typescript
// src/features/thread/services/message-service.test.ts
import { describe, it, expect, vi } from "vitest";
import { sendMessage } from "./message-service";

describe("sendMessage", () => {
  it("should send message and return response", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Success" }),
      })
    );
    global.fetch = mockFetch as any;

    const result = await sendMessage("Hello");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/messages"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "Hello" }),
      })
    );
    expect(result.message).toBe("Success");
  });
});
```

### Pattern 4: Testing Streaming

```typescript
// src/core/providers/stream/stream-provider.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTypedStream } from "./types";

describe("useTypedStream", () => {
  it("should handle streaming updates", async () => {
    const mockStream = {
      async *[Symbol.asyncIterator]() {
        yield { event: "messages", data: [{ type: "ai", content: "H" }] };
        yield { event: "messages", data: [{ type: "ai", content: "Hi" }] };
      },
    };

    const { result } = renderHook(() => useTypedStream({
      // ... config
    }));

    // Test streaming logic
  });
});
```

### Pattern 5: Snapshot Testing

```typescript
// src/shared/components/ui/button.test.tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("should match snapshot", () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

## Test Coverage Goals

### Coverage Targets

- **Overall:** 70%+ coverage
- **Critical paths:** 90%+ coverage
  - Authentication flow
  - Message sending/receiving
  - File upload handling
  - Error handling

### Running Coverage

```bash
# Generate coverage report
pnpm vitest run --coverage

# View HTML report
open coverage/index.html
```

## Testing Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// Bad - tests implementation
expect(component.state.isOpen).toBe(true);

// Good - tests behavior
expect(screen.getByRole("dialog")).toBeVisible();
```

### 2. Use Data Attributes for Test Selection

```typescript
// Component
<button data-testid="submit-button">Submit</button>

// Test
const submitButton = screen.getByTestId("submit-button");
```

### 3. Mock External Dependencies

```typescript
// Mock LangGraph SDK
vi.mock("@langchain/langgraph-sdk", () => ({
  Client: vi.fn(),
}));

// Mock Auth0
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ isAuthenticated: true }),
}));
```

### 4. Use Factories for Test Data

```typescript
// test/factories/message-factory.ts
export function createMessage(overrides = {}) {
  return {
    type: "human",
    content: "Test message",
    id: "msg_test_123",
    ...overrides,
  };
}

// Usage in tests
const message = createMessage({ content: "Custom content" });
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  cleanup(); // React Testing Library
  vi.clearAllMocks(); // Vitest
});
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:ci
      - run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:ci": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Migration Strategy

### Phase 1: Setup (Week 1)
- Install testing dependencies
- Configure Vitest and Playwright
- Set up test utilities and mocks
- Add CI/CD workflow

### Phase 2: Critical Paths (Weeks 2-3)
- Test authentication flow
- Test message sending/receiving
- Test file upload
- Test error handling

### Phase 3: Feature Coverage (Weeks 4-6)
- Test all features at 50%+ coverage
- Add integration tests
- Add E2E tests for user journeys

### Phase 4: Full Coverage (Ongoing)
- Reach 70%+ overall coverage
- Maintain coverage with new features
- Refine tests based on bugs found

## Related Documentation

- See [38-code-quality.md](/home/user/tiler2-ui/docs/38-code-quality.md) for quality tools
- See [39-debugging.md](/home/user/tiler2-ui/docs/39-debugging.md) for debugging strategies
- See [03-development-workflow.md](/home/user/tiler2-ui/docs/03-development-workflow.md) for workflow

---

**Next:** [38-code-quality.md](/home/user/tiler2-ui/docs/38-code-quality.md)
