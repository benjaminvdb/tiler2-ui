import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const SubmitButton: React.FC = () => {
  return (
    <div className="mt-2 flex justify-end">
      <Button
        type="submit"
        size="lg"
      >
        Continue
        <ArrowRight className="size-5" />
      </Button>
    </div>
  );
};
