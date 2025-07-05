import { SubmissionContext } from "../types";

export function initializeSubmission(context: SubmissionContext): void {
  context.initialHumanInterruptEditValue.current = {};
  context.setStreamFinished(false);
  context.setLoading(true);
  context.setStreaming(true);
}

export function handleSubmissionSuccess(context: SubmissionContext): void {
  context.setStreaming(false);
  context.setStreamFinished(false);
  context.setLoading(false);
}

export function handleSubmissionError(context: SubmissionContext): void {
  context.setStreaming(false);
  context.setStreamFinished(false);
  context.setLoading(false);
}

export function handleSimpleSubmission(context: SubmissionContext): void {
  context.setLoading(true);
}