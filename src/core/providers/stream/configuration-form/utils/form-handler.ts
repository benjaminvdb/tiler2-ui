import {
  configurationFormSchema,
  validateInput,
} from "@/shared/utils/validation";
import { toast } from "sonner";

export interface FormSubmissionData {
  apiUrl: string;
  assistantId: string;
}

export const handleFormSubmission = (
  event: React.FormEvent<HTMLFormElement>,
  onSubmit: (data: FormSubmissionData) => void,
): void => {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const rawData = {
    apiUrl: formData.get("apiUrl") as string,
    assistantId: formData.get("assistantId") as string,
  };

  // Validate the form data
  const validation = validateInput(configurationFormSchema, rawData);

  if (!validation.success) {
    toast.error("Validation Error", {
      description: validation.errors?.join(", ") || "Please check your input",
    });
    return;
  }

  if (validation.data) {
    onSubmit(validation.data);
    form.reset();
  }
};
