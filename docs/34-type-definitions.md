# Type Definitions

This document provides a comprehensive overview of TypeScript types and interfaces used throughout the application, focusing on type safety, code organization, and developer experience.

## Overview

The type system is organized into three categories:
1. **Global types** in `/home/user/tiler2-ui/src/shared/types/` - shared across the entire application
2. **Feature-specific types** - local to individual features
3. **Third-party types** - from LangGraph SDK, LangChain, and other libraries

## Global Types

### Core File: `/home/user/tiler2-ui/src/shared/types/index.ts`

This file contains all globally shared type definitions used across features.

#### Multimodal Content Types

```typescript
export type MultimodalContentBlock =
  | LangChainContentBlock.Multimodal.Image
  | LangChainContentBlock.Multimodal.File;

export type ContentBlock = MultimodalContentBlock;
export type ContentBlocks = ContentBlock[];
```

**Why:** These types align with LangChain's content block standard, ensuring interoperability with LangGraph and consistent handling of images and files.

#### Human-in-the-Loop Types

```typescript
export interface InterruptItem {
  id: string;
  type: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

export interface InterruptResponse {
  type: "response";
  args: string;
}
```

**Why:** Interrupts pause AI workflows and wait for user input. The `InterruptResponse` provides the structure for user decisions.

#### Thread and Message Types

```typescript
export interface ThreadState {
  threadId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ThreadMetadata {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface MessageMetadata {
  id: string;
  timestamp: string;
  threadId?: string;
  parentCheckpoint?: string;
}
```

**Why:** These types maintain thread state and synchronize with URL search params for browser history support.

#### Artifact Types

```typescript
export interface ArtifactContext {
  id?: string;
  type?: string;
  title?: string;
  content?: string;
  language?: string;
  [key: string]: unknown;
}
```

**Why:** Flexible artifact metadata for rendering code, documents, and other content in the side panel. Uses index signature for extensibility.

#### Tool Call Types

```typescript
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, JsonValue>;
  result?: JsonValue;
}
```

**Why:** Follows LangChain's ToolCall standard for compatibility with LLM tool calling conventions.

#### Utility Types

```typescript
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type NonEmptyArray<T> = [T, ...T[]];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type FieldValue =
  | string
  | number
  | boolean
  | FieldValue[]
  | { [key: string]: FieldValue };
```

**Why:**
- `JsonValue` ensures type-safe serialization without loss
- `Prettify` flattens union types for better IntelliSense
- `NonEmptyArray` validates non-empty lists at compile time
- `Optional` makes specific keys optional while keeping others required
- `FieldValue` provides serializable values for forms and tool arguments

#### API Response Types

```typescript
export interface ApiResponse<T = JsonValue> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  context?: Record<string, JsonValue>;
}
```

**Why:** Standard error/success handling with consistent shape across all API calls. Generic type `T` allows type-safe response data.

#### Event Handler Types

```typescript
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

export interface FormSubmissionEvent {
  type: "submit" | "regenerate" | "action";
  data?: Record<string, unknown>;
}
```

**Why:** Type-safe event handlers with clear async vs sync distinction. Form events are typed for input validation.

#### Component Types

```typescript
export interface BaseComponentProps {
  className?: string | undefined;
  children?: React.ReactNode;
}

export interface FieldConfig {
  key: string;
  value: FieldValue;
  type?: "string" | "number" | "boolean" | "object" | "array";
  required?: boolean;
}
```

**Why:** Common props for UI components ensure consistency and reduce type duplication.

## Feature-Specific Types

### Stream Types: `/home/user/tiler2-ui/src/core/providers/stream/types.ts`

```typescript
export type GraphState = {
  messages: Message[];
  ui?: UIMessage[];
  sources?: Source[];
};

export const useTypedStream = useStream<
  GraphState,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
      context?: Record<string, unknown>;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
    ConfigurableType: {
      workflow_id?: string;
      workflow_type?: string;
    };
  }
>;

export type StreamContextType = ReturnType<typeof useTypedStream> & {
  currentRunId: string | null;
  threadId: string | null;
  error: Error | null;
  clearError: () => void;
  retryStream: () => Promise<void>;
};
```

**Why:** These types extend the LangGraph SDK's streaming hooks with application-specific state like workflow metadata and error handling.

### Message Component Types

Located in feature-specific directories:
- `/home/user/tiler2-ui/src/features/thread/components/messages/shared/types.ts`
- `/home/user/tiler2-ui/src/features/thread/components/messages/human/types.ts`
- `/home/user/tiler2-ui/src/features/thread/components/chat-input-components/types.ts`

These define props for message rendering components (command bars, content, etc.).

## Type Organization Patterns

### Co-location Strategy

Types are co-located with the code that uses them:
- **Global types** → `/home/user/tiler2-ui/src/shared/types/index.ts`
- **Feature types** → `src/features/{feature}/types.ts` or `components/types.ts`
- **Component types** → alongside component files when specific to one component

**Why:** Co-location improves discoverability and makes refactoring easier.

### Import Patterns

```typescript
// Global types
import type { ThreadState, ToolCall } from "@/shared/types";

// Feature types
import type { StreamContextType } from "@/core/providers/stream/types";

// Third-party types
import type { Message } from "@langchain/langgraph-sdk";
```

**Why:** Clear import paths with TypeScript's `type` imports for tree-shaking optimization.

## Zod Schemas for Validation

### Environment Variable Validation: `/home/user/tiler2-ui/src/env.ts`

```typescript
const clientSchema = z.object({
  VITE_AUTH0_DOMAIN: z.string().min(1),
  VITE_AUTH0_CLIENT_ID: z.string().min(1),
  VITE_AUTH0_AUDIENCE: z.url().optional(),
  VITE_API_URL: z.string().optional(),
  VITE_ASSISTANT_ID: z.string().optional(),
  VITE_SENTRY_DSN: z.url().optional(),
  VITE_APP_BASE_URL: z.url(),
  VITE_APP_VERSION: z.string().optional(),
});
```

**Why:** Runtime validation ensures environment variables are present and correctly formatted before the app starts. Prevents runtime errors from misconfiguration.

### Validation Pattern

```typescript
const skipValidation = import.meta.env.VITE_SKIP_ENV_VALIDATION === "true";

const clientEnv = skipValidation
  ? (import.meta.env as any)
  : clientSchema.parse({ /* ... */ });
```

**Why:** Allows skipping validation in CI/CD when variables are set at runtime, while maintaining safety in development.

## Type Safety Best Practices

### 1. Use Strict Mode

From `/home/user/tiler2-ui/tsconfig.json`:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "noImplicitReturns": true,
  "noImplicitThis": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true
}
```

**Why:** Maximum type safety catches errors at compile time rather than runtime.

### 2. Avoid `any`, Prefer `unknown`

```typescript
// Bad
const data: any = fetchData();

// Good
const data: unknown = fetchData();
if (isValidData(data)) {
  // TypeScript narrows the type after validation
}
```

**Why:** `unknown` forces explicit type checking, preventing runtime errors.

### 3. Use Type Predicates

```typescript
function isMessage(value: unknown): value is Message {
  return typeof value === "object" && value !== null && "type" in value;
}
```

**Why:** Type predicates provide runtime validation with compile-time type narrowing.

### 4. Generic Types for Reusability

```typescript
export interface ApiResponse<T = JsonValue> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Why:** Generic types enable type-safe reuse while maintaining flexibility.

## Type Utility Patterns

### Making Properties Optional

```typescript
// Make specific keys optional
type PartialThread = Optional<ThreadMetadata, "title" | "messageCount">;

// Make all properties optional
type PartialThread = Partial<ThreadMetadata>;

// Make all properties required
type RequiredThread = Required<ThreadMetadata>;
```

### Extracting Types from Objects

```typescript
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
} as const;

type Config = typeof config;
// { apiUrl: "https://api.example.com"; timeout: 5000 }
```

### Union Type Narrowing

```typescript
type MessageType = "human" | "ai" | "tool" | "system";

function processMessage(type: MessageType) {
  switch (type) {
    case "human":
      // TypeScript knows type is "human" here
      break;
    case "ai":
      // TypeScript knows type is "ai" here
      break;
    // ...
  }
}
```

## Common Type Issues

### Issue: Type Imports Breaking Builds

**Solution:** Always use `import type` for type-only imports:
```typescript
// Good
import type { Message } from "@langchain/langgraph-sdk";

// Bad (may cause runtime errors)
import { Message } from "@langchain/langgraph-sdk";
```

### Issue: Circular Dependencies

**Solution:** Extract shared types to a separate file:
```typescript
// types.ts
export interface SharedType { /* ... */ }

// moduleA.ts
import type { SharedType } from "./types";

// moduleB.ts
import type { SharedType } from "./types";
```

### Issue: Index Signature Errors

**Solution:** Use Record type or explicit index signature:
```typescript
// Option 1: Record
const obj: Record<string, string> = {};

// Option 2: Index signature
interface FlexibleObject {
  [key: string]: unknown;
}
```

## Related Documentation

- See [35-message-format.md](/home/user/tiler2-ui/docs/35-message-format.md) for message type details
- See [36-thread-schema.md](/home/user/tiler2-ui/docs/36-thread-schema.md) for thread structure
- See [20-coding-conventions.md](/home/user/tiler2-ui/docs/20-coding-conventions.md) for naming conventions

---

**Next:** [35-message-format.md](/home/user/tiler2-ui/docs/35-message-format.md)
