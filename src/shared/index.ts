/**
 * Centralizes the small set of shared exports that almost every feature touches.
 * Import other shared components directly from their modules for clearer dependency graphs.
 */
export { cn } from "./utils/utils";
export * from "./utils/validation";
export { useMediaQuery } from "./hooks/use-media-query";
export { Toaster } from "./components/ui/sonner";
