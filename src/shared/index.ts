/**
 * Shared Module Index
 * Re-exports only essential utilities and hooks that are frequently used together
 *
 * Note: Component imports should use direct paths for better performance and tree shaking
 * Example: import { Button } from '@/shared/components/ui/button'
 */

// Essential utilities (frequently used together)
export { cn } from "./utils/utils";
export * from "./utils/validation";

// Essential hooks
export { useMediaQuery } from "./hooks/use-media-query";

// Frequently used components that are often imported together
export { Toaster } from "./components/ui/sonner";
