import { useContext } from "react";
import { ArtifactSlotContext } from "../context";

/**
 * Artifacts may at their discretion provide additional context
 * that will be used when creating a new run.
 */
export function useArtifactContext() {
  const context = useContext(ArtifactSlotContext);
  return context.context;
}
