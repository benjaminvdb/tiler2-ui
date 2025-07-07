/**
 * Central validation schemas using Zod
 */

import { z } from "zod";

// Environment variable validation
export const environmentSchema = z.object({
  apiUrl: z.string().url("API URL must be a valid URL"),
  assistantId: z.string().min(1, "Assistant ID is required"),
  apiKey: z.string().optional(),
});

// Chat input validation
export const chatInputSchema = z.object({
  input: z
    .string()
    .trim()
    .max(10000, "Message cannot exceed 10,000 characters"),
  contentBlocks: z
    .array(
      z.object({
        type: z.string(),
        data: z.string(),
      }),
    )
    .max(10, "Cannot upload more than 10 files at once"),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.object({
    name: z.string().min(1, "File name is required"),
    size: z.number().max(50 * 1024 * 1024, "File size cannot exceed 50MB"),
    type: z.enum(
      ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"],
      { message: "File type not supported" },
    ),
  }),
});

// Thread ID validation
export const threadIdSchema = z
  .string()
  .uuid("Invalid thread ID format")
  .optional();

// API response validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Message validation
export const messageValidationSchema = z.object({
  id: z.string().min(1, "Message ID is required"),
  content: z.union([z.string(), z.array(z.unknown())]),
  type: z.enum(["human", "ai", "tool"]),
  timestamp: z.number().optional(),
});

// Configuration form validation
export const configurationFormSchema = z.object({
  apiUrl: z.string().url("Please enter a valid API URL"),
  assistantId: z.string().min(1, "Assistant ID is required"),
});

// Human response validation (for agent inbox)
export const humanResponseSchema = z.object({
  type: z.literal("response"),
  args: z.string().min(1, "Response cannot be empty"),
});

// Tool call validation
export const toolCallSchema = z.object({
  id: z.string().min(1, "Tool call ID is required"),
  name: z.string().min(1, "Tool name is required"),
  args: z.record(z.unknown()),
  result: z.unknown().optional(),
});

// Generic field value validation
export const fieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.unknown()),
  z.record(z.unknown()),
]);

// URL parameter validation
export const urlParamsSchema = z.object({
  threadId: z.string().uuid().optional(),
  chatHistoryOpen: z.boolean().optional(),
  hideToolCalls: z.boolean().optional(),
  apiUrl: z.string().url().optional(),
});

/**
 * Validation helper functions
 */

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`,
        ),
      };
    }
    return {
      success: false,
      errors: ["Validation failed with unknown error"],
    };
  }
}

export function validateInputSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}

/**
 * Sanitization functions
 */

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

export function sanitizeUserInput(input: string): string {
  // Trim whitespace and limit length
  return input.trim().slice(0, 10000);
}

export function validateAndSanitizeInput(input: string): {
  isValid: boolean;
  sanitized: string;
  errors?: string[];
} {
  const validation = validateInput(z.string().max(10000), input);

  if (!validation.success) {
    return {
      isValid: false,
      sanitized: "",
      ...(validation.errors ? { errors: validation.errors } : {}),
    };
  }

  return {
    isValid: true,
    sanitized: sanitizeUserInput(input),
  };
}
