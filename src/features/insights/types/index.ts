/**
 * Type definitions for the Insights feature.
 *
 * Insights are text highlights that users save from AI chat messages for later reference.
 * This module defines the data structures for creating, retrieving, and managing insights.
 */

/**
 * Request payload for creating a new insight.
 *
 * Submitted when a user saves a text selection from an AI message.
 */
export interface CreateInsightRequest {
  /** LangGraph thread/conversation ID containing the message */
  thread_id: string;

  /** LangGraph message ID if available (may be undefined for some messages) */
  message_id?: string;

  /** LangGraph checkpoint ID for stable reference to conversation state */
  checkpoint_id?: string;

  /** Conversation branch identifier for handling message regeneration */
  branch?: string;

  /** The message content in markdown format (1-5000 chars). Preserves formatting like bold, lists, code, etc. */
  insight_content: string;

  /** Optional user note or annotation for this insight (max 2000 chars) */
  note?: string;
}

/**
 * A single user insight returned from the API.
 *
 * Contains the saved text content and metadata for navigation back to the original message.
 */
export interface Insight {
  /** Unique identifier for the insight */
  id: string;

  /** Email of the user who saved this insight */
  user_email: string;

  /** Organization the user belongs to */
  organization_slug: string;

  /** Thread ID containing the original message */
  thread_id: string;

  /** Message ID if available */
  message_id?: string;

  /** Checkpoint ID for stable reference */
  checkpoint_id?: string;

  /** Conversation branch identifier */
  branch?: string;

  /** The saved content in markdown format. Rendered with full formatting support. */
  insight_content: string;

  /** Optional user note */
  note?: string;

  /** ISO timestamp when the insight was saved */
  created_at: string;
}

/**
 * Response from listing insights with pagination support.
 */
export interface InsightListResponse {
  /** Array of insights matching the query */
  insights: Insight[];

  /** Total number of insights for this user (for pagination) */
  total: number;
}

/**
 * Response from creating an insight.
 */
export type CreateInsightResponse = Insight;

/**
 * Response from deleting an insight.
 */
export interface DeleteInsightResponse {
  /** Whether the insight was successfully deleted */
  success: boolean;

  /** Human-readable success message */
  message?: string;
}

/**
 * Query parameters for listing/searching insights.
 */
export interface ListInsightsParams {
  /** Optional search query for fuzzy text matching */
  search?: string;

  /** Maximum number of results to return (1-500, default 100) */
  limit?: number;

  /** Number of results to skip for pagination (default 0) */
  offset?: number;
}
