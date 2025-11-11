"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Target,
  Lightbulb,
  BookCheck,
  Users,
  Map,
  UserCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";
import earthImage from "@/../public/images/earth-satellite.webp";
import { useUIContext } from "@/features/chat/providers/ui-provider";

interface EmptyStateProps {
  onSuggestionClick?: (text: string) => void;
  onWorkflowCategoryClick?: (category: string) => void;
}

const onboardingOptions = [
  {
    name: "Personalize Link AI",
    icon: UserCircle,
    description: "Tell us about your company",
  },
  {
    name: "Tips & Tricks",
    icon: Sparkles,
    description: "Get the most out of Link AI",
  },
];

const workflowCategories = [
  { name: "Strategy", icon: Map, color: "#767C91" },
  { name: "Policies & Governance", icon: Shield, color: "#7ca2b7" },
  { name: "Impacts & Risk Assessment", icon: Target, color: "#72a6a6" },
  { name: "Interventions", icon: Lightbulb, color: "#a6c887" },
  { name: "Standards & Reporting", icon: BookCheck, color: "#e39c5a" },
  { name: "Stakeholder Engagement", icon: Users, color: "#ac876c" },
  { name: "Knowledge & Guidance", icon: BookOpen, color: "#878879" },
];

export const EmptyState = ({
  onSuggestionClick,
  onWorkflowCategoryClick,
}: EmptyStateProps): React.JSX.Element => {
  const { navigationService } = useUIContext();

  return (
    <div className="flex h-full flex-col items-center justify-start px-6 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="flex w-full max-w-2xl flex-col items-center space-y-4 sm:space-y-6 md:space-y-8">
        {/* Satellite Image Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="from-ocean-blue/20 to-forest-green/20 relative h-56 max-h-[90vw] w-56 max-w-[90vw] overflow-hidden rounded-full bg-gradient-to-br sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-80 lg:w-80"
            style={{
              boxShadow:
                "0 8px 32px rgba(11, 61, 46, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            <img
              src={earthImage}
              alt="Earth from space"
              className="object-cover w-full h-full"
            />

            {/* Subtle overlay for depth */}
            <div className="to-forest-green/5 absolute inset-0 bg-gradient-to-b from-transparent via-transparent" />
          </motion.div>
        </motion.div>

        {/* Onboarding Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.4,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="w-full"
        >
          <p
            className="text-muted-foreground mb-3 text-center text-[13px]"
            style={{ letterSpacing: "-0.005em" }}
          >
            New to Link AI?
          </p>
          <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-2">
            {onboardingOptions.map((option, index) => (
              <motion.button
                key={option.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.45 + index * 0.05,
                  ease: [0.4, 0, 0.2, 1],
                }}
                onClick={() => {
                  // Map button names to workflow IDs
                  const workflowId =
                    option.name === "Personalize Link AI"
                      ? "onb-1"
                      : option.name === "Tips & Tricks"
                        ? "onb-2"
                        : null;

                  if (workflowId) {
                    navigationService.navigateToWorkflow(workflowId);
                  } else {
                    // Fallback to suggestion click for other options
                    onSuggestionClick?.(`I'd like help with: ${option.name}`);
                  }
                }}
                className="group bg-card border-sage/20 hover:border-sage/40 hover:bg-sage/5 flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-all duration-200"
                style={{
                  boxShadow: "0 1px 3px rgba(107, 144, 128, 0.08)",
                }}
              >
                <option.icon
                  className="text-sage h-4 w-4 transition-colors duration-200"
                  strokeWidth={1.5}
                />
                <span
                  className="text-foreground text-[13px] transition-colors duration-200"
                  style={{ letterSpacing: "-0.005em", fontWeight: 500 }}
                >
                  {option.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Workflow Category Buttons */}
        {onWorkflowCategoryClick && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.65,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="w-full"
          >
            <p
              className="text-muted-foreground mb-4 text-center text-[13px]"
              style={{ letterSpacing: "-0.005em" }}
            >
              Or explore workflows by category
            </p>
            <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-2">
              {workflowCategories.map((category, index) => (
                <motion.button
                  key={category.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.75 + index * 0.05,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  onClick={() => onWorkflowCategoryClick(category.name)}
                  className="group flex items-center gap-2 rounded-md border-0 px-3 py-1.5 transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: category.color,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <category.icon
                    className="h-3.5 w-3.5 text-white transition-opacity duration-200"
                    strokeWidth={1.5}
                  />
                  <span
                    className="text-[13px] text-white transition-colors duration-200"
                    style={{ letterSpacing: "-0.005em" }}
                  >
                    {category.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
