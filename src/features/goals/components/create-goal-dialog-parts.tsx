/**
 * Create Goal Dialog Sub-components
 *
 * Extracted components for ExampleGoalCard, PlanSizeCard, CharacterCount, and GoalFormContent.
 */

import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  EXAMPLE_GOALS,
  PLAN_SIZES,
  getIcon,
  getCategoryById,
} from "../constants";
import type { ExampleGoal, PlanSizeDefinition } from "../constants";
import type { PlanSize } from "../types";

export const ExampleGoalCard = ({
  example,
  onSelect,
}: {
  example: ExampleGoal;
  onSelect: () => void;
}): React.JSX.Element => {
  const category = getCategoryById(example.category);
  const categoryColor = category?.color ?? "var(--sage)";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-3 rounded-lg border border-[var(--input)] bg-white p-4 text-left transition-all hover:border-[var(--sage)] hover:bg-[var(--sage)]/5"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `${categoryColor}20`,
          color: categoryColor,
        }}
      >
        {getIcon(example.icon, "h-5 w-5")}
      </div>
      <span className="flex-1 text-sm font-medium">{example.title}</span>
    </button>
  );
};

export const PlanSizeCard = ({
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
        : "border-[var(--input)] bg-white hover:border-[var(--sage)]"
    }`}
  >
    <div
      className="rounded-lg p-2"
      style={
        selected
          ? { backgroundColor: "var(--forest-green)", color: "white" }
          : { backgroundColor: `${size.color}30`, color: size.color }
      }
    >
      {getIcon(size.icon, "h-5 w-5")}
    </div>
    <div>
      <h5 className="text-sm font-medium">{size.name}</h5>
      <p className="text-xs text-[var(--muted-foreground)]">{size.taskRange}</p>
    </div>
  </button>
);

const getCharacterCountState = (
  current: number,
): { color: string; label: string } => {
  if (current >= 200) {
    return { color: "#93b1a6", label: "Great detail!" };
  }
  if (current >= 150) {
    return { color: "#b26a3d", label: "Good foundation" };
  }
  if (current === 0) {
    return { color: "#C44536", label: "Required *" };
  }
  return { color: "#C44536", label: "Too brief for a good plan" };
};

export const CharacterCount = ({
  current,
  min,
}: {
  current: number;
  min: number;
}): React.JSX.Element => {
  const { color, label } = getCharacterCountState(current);
  const meetsMinimum = current >= min;

  return (
    <div className="flex justify-between text-xs">
      <span style={{ color }}>{label}</span>
      <span style={{ color }}>
        {meetsMinimum ? `${current} characters` : `${current} / ${min} minimum`}
      </span>
    </div>
  );
};

interface GoalFormContentProps {
  objective: string;
  onObjectiveChange: (value: string) => void;
  objectiveLength: number;
  minLength: number;
  maxLength: number;
  placeholder: string;
  planSize: PlanSize | undefined;
  onPlanSizeChange: (size: PlanSize) => void;
}

const SectionDivider = ({ label }: { label: string }): React.JSX.Element => (
  <div className="flex items-center gap-4 py-2">
    <div className="h-px flex-1 bg-[var(--border)]" />
    <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
    <div className="h-px flex-1 bg-[var(--border)]" />
  </div>
);

export const GoalFormContent = ({
  objective,
  onObjectiveChange,
  objectiveLength,
  minLength,
  maxLength,
  placeholder,
  planSize,
  onPlanSizeChange,
}: GoalFormContentProps): React.JSX.Element => (
  <div className="space-y-6 py-2">
    <div className="space-y-2">
      <Textarea
        id="goal-objective"
        value={objective}
        onChange={(e) => onObjectiveChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[160px] resize-none"
        maxLength={maxLength}
      />
      <CharacterCount
        current={objectiveLength}
        min={minLength}
      />
    </div>

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
            onSelect={() => onPlanSizeChange(size.id)}
          />
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <SectionDivider label="Examples" />
      <div className="grid grid-cols-2 gap-3">
        {EXAMPLE_GOALS.map((example) => (
          <ExampleGoalCard
            key={example.title}
            example={example}
            onSelect={() => onObjectiveChange(example.objective)}
          />
        ))}
      </div>
    </div>
  </div>
);
