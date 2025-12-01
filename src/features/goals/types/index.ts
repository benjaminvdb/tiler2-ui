/**
 * Type definitions for the Goals feature.
 *
 * Goals are long-term sustainability objectives with structured plans
 * consisting of milestones and tasks. Users create goals through a wizard
 * and track progress through task completion.
 */

// =============================================================================
// Enums and Constants
// =============================================================================

/** Goal category types matching workflow_categories in database */
export type GoalCategory =
  | "strategy"
  | "policies-governance"
  | "impacts-risk"
  | "interventions"
  | "standards-reporting"
  | "stakeholder-engagement"
  | "knowledge-guidance";

/** Goal status values */
export type GoalStatus =
  | "generating"
  | "planning"
  | "in-progress"
  | "completed"
  | "failed";

/** Plan size options for goal template generation */
export type PlanSize = "light" | "moderate" | "comprehensive";

/** Task status values */
export type TaskStatus = "todo" | "in_progress" | "done";

// =============================================================================
// Task Types
// =============================================================================

/**
 * A task dependency relationship.
 */
export interface TaskDependency {
  /** Unique identifier for the dependency */
  id: string;

  /** ID of the task this task depends on */
  depends_on_task_id: string;
}

/**
 * A single task within a milestone.
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;

  /** Milestone this task belongs to */
  milestone_id: string;

  /** Title of the task */
  title: string;

  /** Detailed description of the task */
  description?: string;

  /** Task status (todo, in_progress, done) */
  status: TaskStatus;

  /** Reference to workflow if this task is linked to one */
  workflow_id?: string;

  /** Reference to thread if one has been started for this task */
  thread_id?: string;

  /** Order position of the task within the milestone */
  order_index: number;

  /** ISO timestamp when the task was created */
  created_at: string;

  /** ISO timestamp when the task was last updated */
  updated_at: string;

  /** ISO timestamp when the task was completed */
  completed_at?: string;

  /** Tasks this task depends on (visual only) */
  dependencies: TaskDependency[];
}

/**
 * Request payload for creating a new task.
 */
export interface CreateTaskRequest {
  /** Milestone this task belongs to */
  milestone_id: string;

  /** Title of the task (1-255 chars) */
  title: string;

  /** Detailed description of the task (max 5000 chars) */
  description?: string;

  /** Task status (default: todo) */
  status?: TaskStatus;

  /** Reference to workflow if this task is linked to one */
  workflow_id?: string;

  /** Order position of the task within the milestone */
  order_index?: number;

  /** List of task IDs this task depends on */
  dependency_ids?: string[];
}

/**
 * Request payload for updating a task.
 */
export interface UpdateTaskRequest {
  /** Title of the task (1-255 chars) */
  title?: string;

  /** Detailed description of the task (max 5000 chars) */
  description?: string;

  /** Task status */
  status?: TaskStatus;

  /** Reference to workflow if this task is linked to one. Set to null to remove. */
  workflow_id?: string | null;

  /** Reference to thread if one has been started for this task */
  thread_id?: string;

  /** Order position of the task within the milestone */
  order_index?: number;

  /** List of task IDs this task depends on */
  dependency_ids?: string[];
}

/**
 * Request payload for linking a thread to a task.
 */
export interface LinkThreadRequest {
  /** Thread ID to link to the task */
  thread_id: string;
}

// =============================================================================
// Milestone Types
// =============================================================================

/**
 * A milestone within a goal containing tasks.
 */
export interface Milestone {
  /** Unique identifier for the milestone */
  id: string;

  /** Goal this milestone belongs to */
  goal_id: string;

  /** Title of the milestone */
  title: string;

  /** Detailed description of the milestone */
  description?: string;

  /** Order position of the milestone within the goal */
  order_index: number;

  /** ISO timestamp when the milestone was created */
  created_at: string;

  /** ISO timestamp when the milestone was last updated */
  updated_at: string;

  /** Tasks in this milestone */
  tasks: Task[];
}

/**
 * Request payload for creating a new milestone.
 */
export interface CreateMilestoneRequest {
  /** Goal this milestone belongs to */
  goal_id: string;

  /** Title of the milestone (1-255 chars) */
  title: string;

  /** Detailed description of the milestone (max 5000 chars) */
  description?: string;

  /** Order position of the milestone within the goal */
  order_index?: number;
}

/**
 * Request payload for updating a milestone.
 */
export interface UpdateMilestoneRequest {
  /** Title of the milestone (1-255 chars) */
  title?: string;

  /** Detailed description of the milestone (max 5000 chars) */
  description?: string;

  /** Order position of the milestone within the goal */
  order_index?: number;
}

// =============================================================================
// Goal Types
// =============================================================================

/**
 * A goal with full details including milestones and tasks.
 */
export interface Goal {
  /** Unique identifier for the goal */
  id: string;

  /** Title of the goal */
  title: string;

  /** Detailed description of the goal */
  description?: string;

  /** Category of the goal */
  category: GoalCategory;

  /** Plan complexity level */
  plan_size: PlanSize;

  /** Goal status */
  status: GoalStatus;

  /** Target completion date for the goal */
  target_date?: string;

  /** ISO timestamp when the goal was created */
  created_at: string;

  /** ISO timestamp when the goal was last updated */
  updated_at: string;

  /** Error message if plan generation failed */
  error_message?: string;

  /** Milestones in this goal */
  milestones: Milestone[];
}

/**
 * A goal in a list view with progress statistics.
 */
export interface GoalListItem {
  /** Unique identifier for the goal */
  id: string;

  /** Title of the goal */
  title: string;

  /** Description of the goal */
  description?: string;

  /** Category of the goal */
  category: GoalCategory;

  /** Goal status */
  status: GoalStatus;

  /** ISO timestamp when the goal was created */
  created_at: string;

  /** Target completion date */
  target_date?: string;

  /** Total number of milestones */
  milestones_total: number;

  /** Number of completed milestones */
  milestones_completed: number;

  /** Total number of tasks */
  tasks_total: number;

  /** Number of completed tasks */
  tasks_completed: number;
}

/**
 * Request payload for creating a new goal.
 */
export interface CreateGoalRequest {
  /** Title of the goal (1-255 chars) */
  title: string;

  /** Detailed description of the goal (max 5000 chars) */
  description?: string;

  /** Category of the goal */
  category: GoalCategory;

  /** Plan complexity level */
  plan_size: PlanSize;

  /** Target completion date for the goal (ISO format) */
  target_date?: string;
}

// =============================================================================
// Response Types
// =============================================================================

/**
 * Response from listing goals with pagination support.
 */
export interface GoalListResponse {
  /** Array of goals matching the query */
  goals: GoalListItem[];

  /** Total number of goals for this user */
  total: number;
}

/**
 * Generic success response for delete operations.
 */
export interface DeleteResponse {
  /** Whether the operation was successful */
  success: boolean;

  /** Human-readable message */
  message?: string;
}

/**
 * Upstream task info for task context.
 */
export interface UpstreamTaskInfo {
  /** Upstream task ID */
  task_id: string;

  /** Upstream task title */
  title: string;

  /** Upstream task description */
  description: string | null;

  /** Upstream task thread ID */
  thread_id: string;
}

/**
 * Response from getting task context.
 */
export interface TaskContextResponse {
  /** Task ID */
  task_id: string;

  /** Task title */
  task_title: string;

  /** Task description */
  task_description: string | null;

  /** Completed upstream tasks with threads */
  upstream_tasks: UpstreamTaskInfo[];
}

// =============================================================================
// Wizard Types
// =============================================================================

/**
 * Data collected through the goal creation wizard.
 */
export interface GoalWizardData {
  /** Step 1: Goal title */
  title: string | undefined;

  /** Step 2: Details */
  description: string | undefined;
  category: GoalCategory | undefined;
  plan_size: PlanSize | undefined;
}

/**
 * Current step in the goal creation wizard.
 * Step 1: Title + Example Goals
 * Step 2: Description + Category + Plan Size
 */
export type WizardStep = 1 | 2;
