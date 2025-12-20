/** Category navigation component rendering clickable category badges with scroll-to-section behavior. */

import React from "react";
import { motion } from "framer-motion";
import type { CategoryResponse } from "../types";
import { getCategoryColor } from "../constants/category-styles";
import { getWorkflowIcon } from "../utils/workflow-icons";

interface CategoryNavigationProps {
  categories: CategoryResponse[];
  onCategoryClick: (categoryName: string) => void;
}

interface CategoryButtonProps {
  category: CategoryResponse;
  onCategoryClick: (categoryName: string) => void;
}

const CategoryButton = ({ category, onCategoryClick }: CategoryButtonProps) => {
  const categoryColor = getCategoryColor(category.name);
  const handleClick = () => {
    onCategoryClick(category.name);
  };

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
};

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
