import { toast } from "sonner";

export function handleSubmissionError(error: any): void {
  console.error("Error sending human response", error);

  if ("message" in error && error.message.includes("Invalid assistant ID")) {
    toast("Error: Invalid assistant ID", {
      description:
        "The provided assistant ID was not found in this graph. Please update the assistant ID in the settings and try again.",
      richColors: true,
      closeButton: true,
      duration: 5000,
    });
  } else {
    toast.error("Error", {
      description: "Failed to submit response.",
      richColors: true,
      closeButton: true,
      duration: 5000,
    });
  }
}

export function showSuccessToast(): void {
  toast("Success", {
    description: "Response submitted successfully.",
    duration: 5000,
  });
}
