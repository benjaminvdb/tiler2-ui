/**
 * Central validation schemas using Zod
 */

import { z } from "zod";

export const fileUploadSchema = z.object({
  file: z.object({
    name: z.string().min(1, "File name is required"),
    size: z.number().max(50 * 1024 * 1024, "File size cannot exceed 50MB"),
    type: z.enum(
      [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/csv",
      ],
      { message: "File type not supported" },
    ),
  }),
});

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
