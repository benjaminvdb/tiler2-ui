/**
 * Task Status Configuration
 *
 * Status display configuration for task badges.
 */

import { Circle, Clock, CheckCircle2 } from "lucide-react";
import type { TaskStatus } from "../types";

/**
 * Configuration for task status badges.
 * Defines label, styling, and icon for each status.
 */
export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string; Icon: typeof Circle }
> = {
  todo: {
    label: "Todo",
    className: "bg-[var(--muted)]/15 text-[var(--muted-foreground)]/70",
    Icon: Circle,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-[var(--amber)]/15 text-[var(--copper)]/70",
    Icon: Clock,
  },
  done: {
    label: "Done",
    className: "bg-[var(--sage)]/15 text-[var(--forest-green)]/70",
    Icon: CheckCircle2,
  },
};
