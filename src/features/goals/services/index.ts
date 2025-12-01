/**
 * Goals Services
 *
 * Re-exports all API services for the goals feature.
 */

export {
  createGoal,
  deleteGoal,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  createTask,
  updateTask,
  deleteTask,
  linkThreadToTask,
  getTaskContext,
} from "./goals-api";
