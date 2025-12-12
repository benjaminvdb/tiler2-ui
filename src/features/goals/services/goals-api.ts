/**
 * API client for goals operations.
 *
 * Provides methods for creating, listing, updating, and deleting goals,
 * milestones, and tasks with automatic authentication via Auth0.
 */

import { env } from "@/env";
import type { FetchWithAuth } from "@/core/services/http-client";
import type {
  Goal,
  CreateGoalRequest,
  Milestone,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  LinkThreadRequest,
  DeleteResponse,
  TaskContextResponse,
} from "../types";

/**
 * Base URL for goals API endpoints.
 * Uses the configured API URL from environment variables.
 */
const GOALS_API_BASE = `${env.API_URL}/goals`;

// =============================================================================
// Goals API
// =============================================================================

/**
 * Creates a new goal with auto-generated milestones and tasks.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param request - Goal creation request with category and plan size
 * @returns Promise resolving to the created goal with milestones and tasks
 * @throws Error if the API request fails
 */
export async function createGoal(
  fetch: FetchWithAuth,
  request: CreateGoalRequest,
): Promise<Goal> {
  const response = await fetch(GOALS_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create goal: ${error}`);
  }

  return response.json();
}

/**
 * Deletes a goal and all its milestones/tasks.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param goalId - UUID of the goal to delete
 * @returns Promise resolving to deletion confirmation
 * @throws Error if the API request fails or goal not found
 */
export async function deleteGoal(
  fetch: FetchWithAuth,
  goalId: string,
): Promise<DeleteResponse> {
  const response = await fetch(`${GOALS_API_BASE}/${goalId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete goal: ${error}`);
  }

  // 204 No Content - return success without parsing body
  return { success: true };
}

// =============================================================================
// Milestones API
// =============================================================================

/**
 * Creates a new milestone for a goal.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param request - Milestone creation request
 * @returns Promise resolving to the created milestone
 * @throws Error if the API request fails
 */
export async function createMilestone(
  fetch: FetchWithAuth,
  request: CreateMilestoneRequest,
): Promise<Milestone> {
  const response = await fetch(`${GOALS_API_BASE}/milestones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create milestone: ${error}`);
  }

  return response.json();
}

/**
 * Updates an existing milestone.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param milestoneId - UUID of the milestone to update
 * @param request - Fields to update
 * @returns Promise resolving to the updated milestone
 * @throws Error if the API request fails or milestone not found
 */
export async function updateMilestone(
  fetch: FetchWithAuth,
  milestoneId: string,
  request: UpdateMilestoneRequest,
): Promise<Milestone> {
  const response = await fetch(`${GOALS_API_BASE}/milestones/${milestoneId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update milestone: ${error}`);
  }

  return response.json();
}

/**
 * Deletes a milestone and all its tasks.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param milestoneId - UUID of the milestone to delete
 * @returns Promise resolving to deletion confirmation
 * @throws Error if the API request fails or milestone not found
 */
export async function deleteMilestone(
  fetch: FetchWithAuth,
  milestoneId: string,
): Promise<DeleteResponse> {
  const response = await fetch(`${GOALS_API_BASE}/milestones/${milestoneId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete milestone: ${error}`);
  }

  // 204 No Content - return success without parsing body
  return { success: true };
}

// =============================================================================
// Tasks API
// =============================================================================

/**
 * Creates a new task for a milestone.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param request - Task creation request
 * @returns Promise resolving to the created task
 * @throws Error if the API request fails
 */
export async function createTask(
  fetch: FetchWithAuth,
  request: CreateTaskRequest,
): Promise<Task> {
  const response = await fetch(`${GOALS_API_BASE}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create task: ${error}`);
  }

  return response.json();
}

/**
 * Updates an existing task.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param taskId - UUID of the task to update
 * @param request - Fields to update
 * @returns Promise resolving to the updated task
 * @throws Error if the API request fails or task not found
 */
export async function updateTask(
  fetch: FetchWithAuth,
  taskId: string,
  request: UpdateTaskRequest,
): Promise<Task> {
  const response = await fetch(`${GOALS_API_BASE}/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update task: ${error}`);
  }

  return response.json();
}

/**
 * Deletes a task.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param taskId - UUID of the task to delete
 * @returns Promise resolving to deletion confirmation
 * @throws Error if the API request fails or task not found
 */
export async function deleteTask(
  fetch: FetchWithAuth,
  taskId: string,
): Promise<DeleteResponse> {
  const response = await fetch(`${GOALS_API_BASE}/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete task: ${error}`);
  }

  // 204 No Content - return success without parsing body
  return { success: true };
}

/**
 * Links a thread to a task.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param taskId - UUID of the task to link
 * @param request - Thread ID to link
 * @returns Promise resolving to the updated task
 * @throws Error if the API request fails
 */
export async function linkThreadToTask(
  fetch: FetchWithAuth,
  taskId: string,
  request: LinkThreadRequest,
): Promise<Task> {
  const response = await fetch(`${GOALS_API_BASE}/tasks/${taskId}/thread`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to link thread to task: ${error}`);
  }

  return response.json();
}

/**
 * Gets task context including title, description, and upstream task info.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param taskId - UUID of the task
 * @returns Promise resolving to the task context
 * @throws Error if the API request fails or task not found
 */
export async function getTaskContext(
  fetch: FetchWithAuth,
  taskId: string,
): Promise<TaskContextResponse> {
  const response = await fetch(`${GOALS_API_BASE}/tasks/${taskId}/context`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get task context: ${error}`);
  }

  return response.json();
}
