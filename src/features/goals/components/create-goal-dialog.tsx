/**
 * Create Goal Dialog
 *
 * Single-page dialog for creating new sustainability goals.
 * User provides a free-form objective and selects plan size.
 * LLM generates title, description, category, milestones, and tasks.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { useUserProfile } from "@/features/auth/hooks/use-user-profile";
import { createGoal } from "../services";
import type { PlanSize } from "../types";
import { GoalFormContent } from "./create-goal-dialog-parts";

const MIN_OBJECTIVE_LENGTH = 200;
const MAX_OBJECTIVE_LENGTH = 10000;

const PLACEHOLDER_TEXT = `I want to [what you want to create or achieve] for [scope/context]. The main driver is [why this matters now]. [Any specific requirements, constraints, or desired outcomes].`;

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
}

export const CreateGoalDialog = ({
  open,
  onOpenChange,
  onGoalCreated,
}: CreateGoalDialogProps): React.JSX.Element => {
  const fetchWithAuth = useAuthenticatedFetch();
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  const [objective, setObjective] = useState("");
  const [planSize, setPlanSize] = useState<PlanSize | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const objectiveLength = objective.trim().length;
  const isValid = objectiveLength >= MIN_OBJECTIVE_LENGTH && planSize !== undefined;

  const handleOpenChange = (newOpen: boolean): void => {
    if (!newOpen) {
      setObjective("");
      setPlanSize(undefined);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isValid) {
      toast.error("Please provide more detail and select a plan size");
      return;
    }
    setIsSubmitting(true);
    try {
      await createGoal(fetchWithAuth, { objective: objective.trim(), plan_size: planSize });
      handleOpenChange(false);
      onGoalCreated();
    } catch (error) {
      console.error("Failed to create goal:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">
            {isProfileLoading ? (
              <Skeleton className="h-8 w-80" />
            ) : (
              <>
                What would you like to achieve,{" "}
                <span style={{ color: "#C44536" }}>{profile?.first_name || "there"}</span>?
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <GoalFormContent
          objective={objective}
          onObjectiveChange={setObjective}
          objectiveLength={objectiveLength}
          minLength={MIN_OBJECTIVE_LENGTH}
          maxLength={MAX_OBJECTIVE_LENGTH}
          placeholder={PLACEHOLDER_TEXT}
          planSize={planSize}
          onPlanSizeChange={setPlanSize}
        />

        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
