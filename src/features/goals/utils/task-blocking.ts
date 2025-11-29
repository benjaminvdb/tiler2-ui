/**
 * Utility functions for computing task blocking state based on dependencies.
 */

import type { Task } from "../types";

/**
 * Information about a task's blocking state.
 */
export interface BlockingInfo {
  /** Whether the task is blocked by incomplete dependencies */
  isBlocked: boolean;
  /** List of incomplete dependency tasks blocking this task */
  blockingTasks: Array<{ id: string; title: string }>;
}

/**
 * Computes whether a task is blocked based on its dependencies.
 *
 * A task is considered blocked if any of its dependencies have a status
 * other than "done".
 *
 * @param task - The task to check
 * @param allTasks - All tasks across all milestones (needed to look up dependency details)
 * @returns BlockingInfo with blocked state and list of blocking tasks
 */
export const getTaskBlockingInfo = (
  task: Task,
  allTasks: Task[],
): BlockingInfo => {
  // If no dependencies, task is not blocked
  if (task.dependencies.length === 0) {
    return { isBlocked: false, blockingTasks: [] };
  }

  // Get IDs of tasks this task depends on
  const dependencyIds = task.dependencies.map((dep) => dep.depends_on_task_id);

  // Find blocking tasks (dependencies that are not done)
  const blockingTasks = allTasks
    .filter(
      (t) =>
        dependencyIds.includes(t.id) && // Is a dependency
        t.status !== "done", // And not completed
    )
    .map((t) => ({ id: t.id, title: t.title }));

  return {
    isBlocked: blockingTasks.length > 0,
    blockingTasks,
  };
};
