import { HumanInterrupt } from "@langchain/langgraph/prebuilt";

/**
 * Extracts the thread title from the interrupt
 */
export function getThreadTitle(interrupt: HumanInterrupt): string {
  return interrupt.action_request.action || "Unknown";
}

/**
 * Determines if actions should be disabled based on loading/streaming state
 */
export function getActionsDisabled(loading: boolean, streaming: boolean): boolean {
  return loading || streaming;
}

/**
 * Determines if ignore is allowed based on interrupt config
 */
export function getIgnoreAllowed(interrupt: HumanInterrupt): boolean {
  return interrupt.config.allow_ignore;
}