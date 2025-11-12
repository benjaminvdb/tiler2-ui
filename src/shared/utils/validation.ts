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
    .max(20000, "Message cannot exceed 10,000 characters"),
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

// Tool call validation
export const toolCallSchema = z.object({
  id: z.string().min(1, "Tool call ID is required"),
  name: z.string().min(1, "Tool name is required"),
  args: z.record(z.string(), z.unknown()),
  result: z.unknown().optional(),
});

// Generic field value validation
export const fieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.unknown()),
  z.record(z.string(), z.unknown()),
]);

/**
 * Validates input against a Zod schema and returns detailed error information.
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag, validated data (if successful), and error list (if failed)
 * @example
 * const result = validateInput(chatInputSchema, userInput);
 * if (result.success) {
 *   console.log("Valid:", result.data);
 * } else {
 *   console.error("Errors:", result.errors);
 * }
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
        errors: error.issues.map(
          (err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`,
        ),
      };
    }
    return {
      success: false,
      errors: ["Validation failed with unknown error"],
    };
  }
}

/**
 * Silent validation that returns null on failure instead of throwing.
 * Useful for optional validation in components where you don't need error details.
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or null if validation failed
 * @example
 * const validData = validateInputSafe(threadIdSchema, userId);
 * if (validData) { /* process valid data */ }
 */
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
 * Removes potentially dangerous HTML/JavaScript from user input.
 * Strips script tags, event handlers, and javascript: protocol.
 * @param input - HTML string to sanitize
 * @returns Sanitized HTML string safe for display
 * @security This provides basic sanitization. For complex HTML, consider using a library like DOMPurify.
 */
export function sanitizeHtml(input: string): string {
  // Remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

/**
 * Enforces maximum length for user input.
 * Does not trim whitespace - for controlled input in forms.
 * @param input - User input string
 * @returns Truncated string (max 10,000 characters)
 */
export function sanitizeUserInput(input: string): string {
  return input.slice(0, 10000);
}

/**
 * Validates and sanitizes user input in a single operation.
 * Checks length constraints and applies sanitization.
 * @param input - User input string
 * @returns Object with validation status, sanitized string, and validation errors (if any)
 */
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
