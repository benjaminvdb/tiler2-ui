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
import Image from "next/image";

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
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col items-center space-y-8">
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
            className="from-ocean-blue/20 to-forest-green/20 relative h-80 w-80 overflow-hidden rounded-full bg-gradient-to-br"
            style={{
              boxShadow:
                "0 8px 32px rgba(11, 61, 46, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Image
              src="/images/earth-satellite.png"
              alt="Earth from space"
              fill
              className="object-cover"
              priority
            />

            {/* Subtle overlay for depth */}
            <div className="to-forest-green/5 absolute inset-0 bg-gradient-to-b from-transparent via-transparent" />
          </motion.div>
        </motion.div>

        {/* Link Chat Branding */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="flex items-center justify-center"
        >
          <Image
            src="/link.svg"
            alt="Link"
            width={40}
            height={13}
            className="object-contain"
            style={{ filter: "brightness(0)" }}
          />
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
                onClick={() =>
                  onSuggestionClick?.(`I'd like help with: ${option.name}`)
                }
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
