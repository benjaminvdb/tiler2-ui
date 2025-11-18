# Message Format

This document describes the message structure used by the LangGraph SDK, including content blocks, tool calls, and multimodal content.

## Overview

Messages in this application follow the LangGraph SDK format, which is based on LangChain's message standards. This ensures compatibility with LLM providers and agent frameworks.

## Message Types

### Basic Message Type

```typescript
import type { Message } from "@langchain/langgraph-sdk";

// Message comes from the SDK and includes:
interface Message {
  type: "human" | "ai" | "tool" | "system";
  content: string | ContentBlock[];
  id?: string;
  name?: string;
  additional_kwargs?: Record<string, unknown>;
  response_metadata?: Record<string, unknown>;
}
```

**Why:** The `Message` type from LangGraph SDK provides standardized structure for all conversation messages.

## Message Types Explained

### 1. Human Messages

Messages from the user.

```typescript
{
  type: "human",
  content: "What is the weather like today?",
  id: "msg_abc123"
}
```

**Multimodal human message:**
```typescript
{
  type: "human",
  content: [
    {
      type: "text",
      text: "What's in this image?"
    },
    {
      type: "image_url",
      image_url: {
        url: "data:image/png;base64,iVBORw0KG..."
      }
    }
  ]
}
```

**Why:** Human messages can include text, images, or files. Content can be a string (text only) or an array of content blocks (multimodal).

### 2. AI Messages

Messages from the AI assistant.

```typescript
{
  type: "ai",
  content: "The weather is sunny with a high of 72°F.",
  id: "msg_def456",
  response_metadata: {
    model: "gpt-4",
    finish_reason: "stop"
  }
}
```

**AI message with tool calls:**
```typescript
{
  type: "ai",
  content: "",
  tool_calls: [
    {
      id: "call_abc123",
      name: "get_weather",
      args: { location: "San Francisco" }
    }
  ]
}
```

**Why:** AI messages contain the assistant's response. When the AI uses tools, `tool_calls` contains the invoked tools with arguments.

### 3. Tool Messages

Results from tool execution.

```typescript
{
  type: "tool",
  content: '{"temperature": 72, "condition": "sunny"}',
  tool_call_id: "call_abc123",
  name: "get_weather"
}
```

**Why:** Tool messages provide execution results back to the AI, allowing it to continue the conversation with retrieved data.

### 4. System Messages

System-level instructions or metadata.

```typescript
{
  type: "system",
  content: "You are a helpful weather assistant."
}
```

**Why:** System messages set context, provide instructions, or inject metadata that guides the AI's behavior.

## Content Blocks

Content blocks represent different types of content within a message.

### Text Content Block

```typescript
{
  type: "text",
  text: "Hello, how can I help you?"
}
```

### Image Content Block

From `/home/user/tiler2-ui/src/shared/types/index.ts`:

```typescript
export type MultimodalContentBlock =
  | LangChainContentBlock.Multimodal.Image
  | LangChainContentBlock.Multimodal.File;
```

**Image URL:**
```typescript
{
  type: "image_url",
  image_url: {
    url: "https://example.com/image.png",
    detail?: "auto" | "low" | "high"
  }
}
```

**Image as base64:**
```typescript
{
  type: "image_url",
  image_url: {
    url: "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

**Why:** Images can be provided as URLs or base64-encoded data. The `detail` field controls processing quality.

### File Content Block

```typescript
{
  type: "file",
  file: {
    url: "https://example.com/document.pdf",
    mime_type: "application/pdf",
    name: "document.pdf"
  }
}
```

**Why:** File blocks support non-image uploads like PDFs, documents, or other file types.

## Multimodal Messages

Multimodal messages combine multiple content types in a single message.

### Example: Text + Image

```typescript
{
  type: "human",
  content: [
    {
      type: "text",
      text: "Can you analyze this chart?"
    },
    {
      type: "image_url",
      image_url: {
        url: "data:image/png;base64,..."
      }
    }
  ]
}
```

### Example: Multiple Images

```typescript
{
  type: "human",
  content: [
    {
      type: "text",
      text: "Compare these two images"
    },
    {
      type: "image_url",
      image_url: { url: "https://example.com/image1.png" }
    },
    {
      type: "image_url",
      image_url: { url: "https://example.com/image2.png" }
    }
  ]
}
```

**Why:** LLMs with vision capabilities can process multiple content blocks together, enabling complex multimodal interactions.

## Tool Calls Format

Tool calls represent AI requests to execute functions.

### Tool Call Structure

From `/home/user/tiler2-ui/src/shared/types/index.ts`:

```typescript
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, JsonValue>;
  result?: JsonValue;
}
```

### Example Tool Call Flow

**1. AI requests tool execution:**
```typescript
{
  type: "ai",
  content: "",
  tool_calls: [
    {
      id: "call_weather_123",
      name: "get_current_weather",
      args: {
        location: "San Francisco",
        unit: "fahrenheit"
      }
    }
  ]
}
```

**2. Tool executes and returns result:**
```typescript
{
  type: "tool",
  content: JSON.stringify({
    temperature: 72,
    condition: "sunny",
    humidity: 45
  }),
  tool_call_id: "call_weather_123",
  name: "get_current_weather"
}
```

**3. AI responds with formatted answer:**
```typescript
{
  type: "ai",
  content: "The current weather in San Francisco is sunny with a temperature of 72°F and 45% humidity."
}
```

**Why:** This three-step flow allows the AI to request information, receive it, and provide a natural language response.

## Message Metadata

### Additional Kwargs

Optional metadata for provider-specific features.

```typescript
{
  type: "ai",
  content: "Hello!",
  additional_kwargs: {
    function_call: { /* legacy tool format */ },
    custom_field: "value"
  }
}
```

**Why:** `additional_kwargs` provides extensibility for provider-specific features without breaking the core schema.

### Response Metadata

Information about the AI's response generation.

```typescript
{
  type: "ai",
  content: "Hello!",
  response_metadata: {
    model: "gpt-4-turbo",
    finish_reason: "stop",
    token_usage: {
      prompt_tokens: 50,
      completion_tokens: 20,
      total_tokens: 70
    }
  }
}
```

**Why:** Response metadata provides insights into model behavior, token usage, and completion status.

## Streaming Messages

During streaming, messages arrive incrementally.

### Stream Update Format

From `/home/user/tiler2-ui/src/core/providers/stream/types.ts`:

```typescript
{
  UpdateType: {
    messages?: Message[] | Message | string;
    ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
    context?: Record<string, unknown>;
  }
}
```

**Partial message during streaming:**
```typescript
{
  type: "ai",
  content: "The weather is", // Partial content
  id: "msg_streaming_123"
}

// Next update
{
  type: "ai",
  content: "The weather is sunny", // More content
  id: "msg_streaming_123"
}
```

**Why:** Streaming provides real-time updates as the AI generates responses, improving perceived performance.

## Message Processing Patterns

### Pattern 1: Type-Safe Message Handling

```typescript
function processMessage(message: Message) {
  switch (message.type) {
    case "human":
      return renderHumanMessage(message);
    case "ai":
      return renderAiMessage(message);
    case "tool":
      return renderToolMessage(message);
    case "system":
      return renderSystemMessage(message);
    default:
      // TypeScript ensures exhaustive checking
      const _exhaustive: never = message.type;
      return null;
  }
}
```

**Why:** Exhaustive type checking ensures all message types are handled.

### Pattern 2: Content Block Processing

```typescript
function processContent(content: string | ContentBlock[]) {
  if (typeof content === "string") {
    return <TextContent text={content} />;
  }

  return content.map((block, index) => {
    switch (block.type) {
      case "text":
        return <TextContent key={index} text={block.text} />;
      case "image_url":
        return <ImageContent key={index} src={block.image_url.url} />;
      case "file":
        return <FileContent key={index} file={block.file} />;
      default:
        return null;
    }
  });
}
```

**Why:** Safely handles both simple string content and complex multimodal content arrays.

### Pattern 3: Tool Call Extraction

```typescript
function extractToolCalls(message: Message): ToolCall[] {
  if (message.type !== "ai") return [];
  return message.tool_calls || [];
}
```

**Why:** Type-safe extraction of tool calls from AI messages.

## Validation

### Message Validation Example

```typescript
import { z } from "zod";

const messageSchema = z.object({
  type: z.enum(["human", "ai", "tool", "system"]),
  content: z.union([
    z.string(),
    z.array(z.object({
      type: z.string(),
      // ... content block schema
    }))
  ]),
  id: z.string().optional(),
});

function validateMessage(data: unknown): Message {
  return messageSchema.parse(data);
}
```

**Why:** Runtime validation ensures messages from the API match expected structure.

## Common Patterns

### Empty Content with Tool Calls

```typescript
{
  type: "ai",
  content: "", // Empty when using tools
  tool_calls: [/* ... */]
}
```

**Why:** When the AI only invokes tools without generating text, content is empty.

### Multiple Tool Calls

```typescript
{
  type: "ai",
  content: "",
  tool_calls: [
    { id: "call_1", name: "search_web", args: { query: "weather" } },
    { id: "call_2", name: "get_location", args: {} }
  ]
}
```

**Why:** AI can invoke multiple tools in parallel for efficiency.

## Best Practices

### 1. Always Type Messages

```typescript
// Good
const message: Message = { type: "human", content: "Hello" };

// Bad
const message = { type: "human", content: "Hello" };
```

### 2. Handle Both Content Formats

Always check if content is string or array:
```typescript
const content = typeof message.content === "string"
  ? message.content
  : message.content.map(block => /* process */);
```

### 3. Preserve Message IDs

Message IDs are crucial for:
- Identifying messages in the UI
- Linking tool calls to tool messages
- Tracking message history

### 4. Sanitize HTML Content

Always sanitize message content before rendering:
```typescript
import { sanitize } from "rehype-sanitize";
// Configured in markdown rendering components
```

**Why:** Prevents XSS attacks from malicious content.

## Related Documentation

- See [34-type-definitions.md](/home/user/tiler2-ui/docs/34-type-definitions.md) for type details
- See [36-thread-schema.md](/home/user/tiler2-ui/docs/36-thread-schema.md) for thread structure
- See [08-chat-system.md](/home/user/tiler2-ui/docs/08-chat-system.md) for chat implementation
- See [11-multimodal.md](/home/user/tiler2-ui/docs/11-multimodal.md) for multimodal handling

---

**Next:** [36-thread-schema.md](/home/user/tiler2-ui/docs/36-thread-schema.md)
