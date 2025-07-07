// Re-export all artifact components and hooks
export { ArtifactContent } from "./components/artifact-content";
export { ArtifactTitle } from "./components/artifact-title";
export { ArtifactProvider } from "./components/artifact-provider";
export { useArtifact } from "./hooks/use-artifact";
export { useArtifactOpen } from "./hooks/use-artifact-open";
export { useArtifactContext } from "./hooks/use-artifact-context";

// Re-export types
export type {
  Setter,
  ArtifactSlotContextType,
  ArtifactSlotProps,
  ArtifactContentProps,
} from "./types";
