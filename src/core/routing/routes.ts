/**
 * Centralized Route Constants
 *
 * Single source of truth for all application routes.
 * Use these constants instead of hardcoding route strings throughout the app.
 */

export const ROUTES = {
  HOME: "/",
  WORKFLOWS: "/workflows",
  INSIGHTS: "/insights",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
