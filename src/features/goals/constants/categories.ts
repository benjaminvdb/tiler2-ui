/**
 * Goal Categories, Example Goals, and Plan Sizes
 *
 * Category data matches workflow_categories table in database.
 * Colors and icons should match the database values.
 */

import type { GoalCategory, PlanSize } from "../types";

// =============================================================================
// Category Definitions
// =============================================================================

export interface CategoryDefinition {
  id: GoalCategory;
  name: string;
  color: string;
  icon: string;
}

/**
 * Goal categories matching workflow_categories table.
 * Order matches order_index from database.
 */
export const GOAL_CATEGORIES: readonly CategoryDefinition[] = [
  {
    id: "strategy",
    name: "Strategy",
    color: "#767C91",
    icon: "map",
  },
  {
    id: "policies-governance",
    name: "Policies & Governance",
    color: "#7ca2b7",
    icon: "shield",
  },
  {
    id: "impacts-risk",
    name: "Impacts & Risk Assessment",
    color: "#72a6a6",
    icon: "target",
  },
  {
    id: "interventions",
    name: "Interventions",
    color: "#a6c887",
    icon: "lightbulb",
  },
  {
    id: "standards-reporting",
    name: "Standards & Reporting",
    color: "#d3a95d",
    icon: "book-check",
  },
  {
    id: "stakeholder-engagement",
    name: "Stakeholder Engagement",
    color: "#909095",
    icon: "users",
  },
  {
    id: "knowledge-guidance",
    name: "Knowledge & Guidance",
    color: "#878879",
    icon: "book-open",
  },
] as const;

// =============================================================================
// Example Goals
// =============================================================================

export interface ExampleGoal {
  /** Short display title for the example card */
  title: string;
  /** Short description for the example card */
  shortDescription: string;
  /** Full madlib template text that pre-fills the objective textarea */
  objective: string;
  /** Icon name for the example card */
  icon: string;
}

/**
 * Example goals shown in the create goal dialog.
 * Users can click these to populate the objective textarea with full template.
 */
export const EXAMPLE_GOALS: readonly ExampleGoal[] = [
  {
    title: "Develop a Nature Strategy",
    shortDescription: "Integrate nature topics into environmental strategy",
    objective:
      "I want to draft a nature strategy for my organization. The main driver is the need to integrate nature topics around water, land, and biodiversity into our environmental strategy that is currently only around carbon. We want it to be based on data, but align with peers and best practices. I want 2 versions: a baseline version (minimal industry standards) and a mildly ambitious one.",
    icon: "leaf",
  },
  {
    title: "Assess Supply Chain Impacts",
    shortDescription: "Understand synergies and trade-offs with nature",
    objective:
      "We have a plan to reduce our carbon footprint in the supply chain. I want to understand if our changes have synergies with nature and biodiversity-related hotspots and if we are not causing unwanted negative effects in other impact areas than carbon.",
    icon: "target",
  },
] as const;

// =============================================================================
// Plan Sizes
// =============================================================================

export interface PlanSizeDefinition {
  id: PlanSize;
  name: string;
  taskRange: string;
  minTasks: number;
  maxTasks: number;
  icon: string;
}

/**
 * Plan size options for goal template generation.
 * Task counts determine how many tasks are generated.
 */
export const PLAN_SIZES: readonly PlanSizeDefinition[] = [
  {
    id: "light",
    name: "Light",
    taskRange: "2-4 tasks",
    minTasks: 2,
    maxTasks: 4,
    icon: "sprout",
  },
  {
    id: "moderate",
    name: "Moderate",
    taskRange: "6-10 tasks",
    minTasks: 6,
    maxTasks: 10,
    icon: "tree-deciduous",
  },
  {
    id: "comprehensive",
    name: "Comprehensive",
    taskRange: "10-15 tasks",
    minTasks: 10,
    maxTasks: 15,
    icon: "trees",
  },
] as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get category definition by ID.
 */
export const getCategoryById = (
  id: GoalCategory,
): CategoryDefinition | undefined => {
  return GOAL_CATEGORIES.find((cat) => cat.id === id);
};
