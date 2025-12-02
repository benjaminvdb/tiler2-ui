/**
 * Type definitions for the auth feature.
 */

/**
 * User profile data from the backend /user/me endpoint.
 */
export interface UserProfile {
  /** User's first name from database */
  first_name: string;

  /** User's email address */
  email: string;
}
