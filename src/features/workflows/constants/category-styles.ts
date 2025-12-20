/** Category-specific palette and illustration metadata for workflows. */

const CATEGORY_COLORS: Record<string, string> = {
  Onboarding: "#767C91",
  Strategy: "#82889f",
  "Policies & Governance": "#7ca2b7",
  "Impacts & Risk Assessment": "#72a6a6",
  Interventions: "#a6c887",
  "Standards & Reporting": "#e39c5a",
  "Stakeholder Engagement": "#ac876c",
  "Knowledge & Guidance": "#878879",
};

const CATEGORY_ILLUSTRATIONS: Record<string, string> = {
  Onboarding: "/fern.png",
  Strategy: "/fern.png",
  "Policies & Governance": "/beetle.png",
  "Impacts & Risk Assessment": "/leaves.png",
  Interventions: "/fern.png",
  "Standards & Reporting": "/leaves.png",
  "Stakeholder Engagement": "/beetle.png",
  "Knowledge & Guidance": "/leaves.png",
};

export const getCategoryColor = (categoryName: string): string => {
  return CATEGORY_COLORS[categoryName] ?? CATEGORY_COLORS.Onboarding;
};

export const getCategoryIllustration = (categoryName: string): string => {
  return CATEGORY_ILLUSTRATIONS[categoryName] ?? "/leaves.png";
};
