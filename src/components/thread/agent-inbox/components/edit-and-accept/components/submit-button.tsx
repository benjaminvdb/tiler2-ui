import { Button } from "@/components/ui/button";
import { SubmitButtonProps } from "../types";

export function SubmitButton({
  buttonText,
  streaming,
  onSubmit,
}: SubmitButtonProps) {
  return (
    <div className="flex w-full items-center justify-end gap-2">
      <Button
        variant="brand"
        disabled={streaming}
        onClick={onSubmit}
      >
        {buttonText}
      </Button>
    </div>
  );
}
