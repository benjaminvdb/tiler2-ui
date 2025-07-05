export interface FormSubmissionData {
  apiUrl: string;
  assistantId: string;
  apiKey: string;
}

export function handleFormSubmission(
  event: React.FormEvent<HTMLFormElement>,
  onSubmit: (data: FormSubmissionData) => void,
): void {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const apiUrl = formData.get("apiUrl") as string;
  const assistantId = formData.get("assistantId") as string;
  const apiKey = formData.get("apiKey") as string;

  onSubmit({ apiUrl, assistantId, apiKey });
  form.reset();
}
