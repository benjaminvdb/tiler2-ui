/**
 * Create Goal Wizard
 *
 * 2-step wizard for creating new sustainability goals.
 * Step 1: Title input + Example goal cards
 * Step 2: Description + Category selection + Plan size
 */

import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { IconBox } from "@/shared/components/ui/icon-box";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { createGoal } from "../services";
import {
  GOAL_CATEGORIES,
  EXAMPLE_GOALS,
  PLAN_SIZES,
  getIcon,
  type CategoryDefinition,
  type ExampleGoal,
  type PlanSizeDefinition,
} from "../constants";
import type {
  GoalCategory,
  PlanSize,
  GoalWizardData,
  WizardStep,
} from "../types";

// =============================================================================
// Types
// =============================================================================

interface CreateGoalWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
}

// =============================================================================
// Step 1: Title + Example Goals
// =============================================================================

interface Step1Props {
  title: string;
  onTitleChange: (title: string) => void;
  onExampleSelect: (example: ExampleGoal) => void;
}

const Step1TitleAndExamples = ({
  title,
  onTitleChange,
  onExampleSelect,
}: Step1Props): React.JSX.Element => (
  <div className="space-y-6">
    {/* Title Input */}
    <div className="space-y-2">
      <Input
        id="goal-title"
        value={title}
        // eslint-disable-next-line react/jsx-no-bind -- Prop forwarding in presentational component
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="e.g., Develop a Nature Strategy"
        maxLength={255}
        autoFocus
        className="text-base"
      />
    </div>

    {/* Example Goals Section */}
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[var(--muted-foreground)]">
        Example goals
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EXAMPLE_GOALS.map((example) => (
          <button
            key={example.title}
            type="button"
            // eslint-disable-next-line react/jsx-no-bind -- Closure needed for list items
            onClick={() => onExampleSelect(example)}
            className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3 text-left transition-all hover:border-[var(--sage)] hover:bg-[var(--sand)]/30"
          >
            <IconBox
              color="sand"
              size="sm"
            >
              {getIcon(example.icon, "h-4 w-4")}
            </IconBox>
            <div className="min-w-0 flex-1">
              <h5 className="truncate text-sm font-medium">{example.title}</h5>
              <p className="line-clamp-2 text-xs text-[var(--muted-foreground)]">
                {example.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// =============================================================================
// Step 2: Details (Description + Category + Plan Size)
// =============================================================================

interface Step2Props {
  goalTitle: string;
  description: string;
  category: GoalCategory | undefined;
  planSize: PlanSize | undefined;
  onDescriptionChange: (description: string) => void;
  onCategorySelect: (category: GoalCategory) => void;
  onPlanSizeSelect: (size: PlanSize) => void;
}

const CategoryCard = ({
  category,
  selected,
  onSelect,
}: {
  category: CategoryDefinition;
  selected: boolean;
  onSelect: () => void;
}): React.JSX.Element => (
  <button
    type="button"
    onClick={onSelect}
    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
      selected
        ? "border-[var(--forest-green)] bg-[var(--forest-green)]/5"
        : "border-[var(--border)] hover:border-[var(--sage)]"
    }`}
  >
    <div
      className="shrink-0 rounded-md p-2"
      style={{
        backgroundColor: selected ? "var(--forest-green)" : category.color,
        color: "white",
      }}
    >
      {getIcon(category.icon, "h-4 w-4")}
    </div>
    <span className="text-sm leading-tight font-medium">{category.name}</span>
  </button>
);

const PlanSizeCard = ({
  size,
  selected,
  onSelect,
}: {
  size: PlanSizeDefinition;
  selected: boolean;
  onSelect: () => void;
}): React.JSX.Element => (
  <button
    type="button"
    onClick={onSelect}
    className={`flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all ${
      selected
        ? "border-[var(--forest-green)] bg-[var(--forest-green)]/5"
        : "border-[var(--border)] hover:border-[var(--sage)]"
    }`}
  >
    <div
      className={`rounded-lg p-2 ${
        selected
          ? "bg-[var(--forest-green)] text-white"
          : "bg-[var(--sand)] text-[var(--muted-foreground)]"
      }`}
    >
      {getIcon(size.icon, "h-5 w-5")}
    </div>
    <div>
      <h5 className="text-sm font-medium">{size.name}</h5>
      <p className="text-xs text-[var(--muted-foreground)]">{size.taskRange}</p>
    </div>
  </button>
);

const Step2Details = ({
  goalTitle,
  description,
  category,
  planSize,
  onDescriptionChange,
  onCategorySelect,
  onPlanSizeSelect,
}: Step2Props): React.JSX.Element => (
  <div className="space-y-6">
    {/* Breadcrumb with goal title */}
    <div className="space-y-1">
      <p className="text-xs text-[var(--muted-foreground)]">Creating goal</p>
      <h3 className="text-lg font-semibold">{goalTitle}</h3>
    </div>

    {/* Description */}
    <div className="space-y-2">
      <Label htmlFor="goal-description">
        Description <span className="text-red-500">*</span>
      </Label>
      <p className="text-sm text-[var(--muted-foreground)]">
        Include relevant context around drivers, constraints, or specific
        requirements.
      </p>
      <Textarea
        id="goal-description"
        value={description}
        // eslint-disable-next-line react/jsx-no-bind -- Prop forwarding in presentational component
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Describe your goal, current situation, and desired outcomes..."
        className="min-h-[100px] resize-none"
        maxLength={5000}
      />
    </div>

    {/* Category Selection */}
    <div className="space-y-3">
      <Label>
        Category <span className="text-red-500">*</span>
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {GOAL_CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            selected={category === cat.id}
            // eslint-disable-next-line react/jsx-no-bind -- Closure needed for list items
            onSelect={() => onCategorySelect(cat.id)}
          />
        ))}
      </div>
    </div>

    {/* Plan Size Selection */}
    <div className="space-y-3">
      <Label>
        Plan size <span className="text-red-500">*</span>
      </Label>
      <div className="flex gap-3">
        {PLAN_SIZES.map((size) => (
          <PlanSizeCard
            key={size.id}
            size={size}
            selected={planSize === size.id}
            // eslint-disable-next-line react/jsx-no-bind -- Closure needed for list items
            onSelect={() => onPlanSizeSelect(size.id)}
          />
        ))}
      </div>
    </div>
  </div>
);

// =============================================================================
// Main Component
// =============================================================================

// eslint-disable-next-line max-lines-per-function -- Wizard component with multi-step state
export const CreateGoalWizard = ({
  open,
  onOpenChange,
  onGoalCreated,
}: CreateGoalWizardProps): React.JSX.Element => {
  const fetchWithAuth = useAuthenticatedFetch();
  const [step, setStep] = useState<WizardStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<GoalWizardData>({
    title: "",
    description: "",
    category: undefined,
    plan_size: undefined,
  });

  // Reset wizard when closed
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setStep(1);
        setData({
          title: "",
          description: "",
          category: undefined,
          plan_size: undefined,
        });
      }
      onOpenChange(newOpen);
    },
    [onOpenChange],
  );

  // Navigation handlers
  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep((s) => (s - 1) as WizardStep);
    }
  }, [step]);

  const handleNext = useCallback(() => {
    if (step < 2) {
      setStep((s) => (s + 1) as WizardStep);
    }
  }, [step]);

  // Check if current step is valid
  const isStepValid = useCallback((): boolean => {
    switch (step) {
      case 1:
        return (data.title?.trim().length ?? 0) >= 1;
      case 2:
        return (
          (data.description?.trim().length ?? 0) >= 1 &&
          data.category !== undefined &&
          data.plan_size !== undefined
        );
      default:
        return false;
    }
  }, [step, data]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!data.title || !data.description || !data.category || !data.plan_size) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const request = {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        plan_size: data.plan_size,
      };
      await createGoal(fetchWithAuth, request);
      toast.success("Goal created successfully!");
      handleOpenChange(false);
      onGoalCreated();
    } catch (error) {
      console.error("Failed to create goal:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create goal",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [data, fetchWithAuth, handleOpenChange, onGoalCreated]);

  // Data update handlers
  const handleTitleChange = useCallback((title: string) => {
    setData((d) => ({ ...d, title }));
  }, []);

  const handleExampleSelect = useCallback((example: ExampleGoal) => {
    setData((d) => ({
      ...d,
      title: example.title,
      description: example.description,
      category: example.suggestedCategory,
    }));
    setStep(2);
  }, []);

  const handleDescriptionChange = useCallback((description: string) => {
    setData((d) => ({ ...d, description }));
  }, []);

  const handleCategorySelect = useCallback((category: GoalCategory) => {
    setData((d) => ({ ...d, category }));
  }, []);

  const handlePlanSizeSelect = useCallback((planSize: PlanSize) => {
    setData((d) => ({ ...d, plan_size: planSize }));
  }, []);

  const handleCancel = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create a goal</DialogTitle>
          {step === 1 && (
            <DialogDescription>
              What would you like to work towards?
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Step Content */}
        <div className="min-h-[320px] py-2">
          {step === 1 && (
            <Step1TitleAndExamples
              title={data.title ?? ""}
              onTitleChange={handleTitleChange}
              onExampleSelect={handleExampleSelect}
            />
          )}
          {step === 2 && (
            <Step2Details
              goalTitle={data.title ?? ""}
              description={data.description ?? ""}
              category={data.category}
              planSize={data.plan_size}
              onDescriptionChange={handleDescriptionChange}
              onCategorySelect={handleCategorySelect}
              onPlanSizeSelect={handlePlanSizeSelect}
            />
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Plan
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
