/** Category navigation component rendering clickable category badges with scroll-to-section behavior. */

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

interface CategoryResponse {
  id: number;
  name: string;
  color: string;
  icon_name: string;
  order_index: number;
}

interface CategoryNavigationProps {
  categories: CategoryResponse[];
  onCategoryClick: (categoryName: string) => void;
}

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

const getCategoryColorByName = (categoryName: string): string => {
  return CATEGORY_COLORS[categoryName] ?? CATEGORY_COLORS.Onboarding;
};

const toPascalCase = (value: string): string =>
  value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, "");

const lucideIconLibrary = LucideIcons as unknown as Record<
  string,
  React.ComponentType<{ className?: string }>
>;

const getWorkflowIcon = (iconName: string): React.ReactNode => {
  const iconComponentName = toPascalCase(iconName);
  const IconComponent =
    lucideIconLibrary[iconComponentName] ?? LucideIcons.HelpCircle;
  return <IconComponent className="h-5 w-5" />;
};

interface CategoryButtonProps {
  category: CategoryResponse;
  onCategoryClick: (categoryName: string) => void;
}

const CategoryButton = React.memo(function CategoryButton({
  category,
  onCategoryClick,
}: CategoryButtonProps) {
  const categoryColor = getCategoryColorByName(category.name);
  const handleClick = useCallback(() => {
    onCategoryClick(category.name);
  }, [onCategoryClick, category.name]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex items-center gap-2 rounded-md border-0 px-3 py-1.5 text-white transition-all duration-250 hover:opacity-90"
      style={{
        backgroundColor: categoryColor,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
      aria-label={`Navigate to ${category.name} section`}
    >
      <span
        className="flex h-3.5 w-3.5 items-center justify-center text-white"
        style={{ strokeWidth: 1.5 }}
      >
        {getWorkflowIcon(category.icon_name)}
      </span>
      <span className="text-[13px] font-normal text-white transition-colors duration-250">
        {category.name}
      </span>
    </button>
  );
});

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categories,
  onCategoryClick,
}) => {
  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              onCategoryClick={onCategoryClick}
            />
          ))}
        </div>
      </motion.div>

      <div className="border-border mb-12 border-t" />
    </>
  );
};
