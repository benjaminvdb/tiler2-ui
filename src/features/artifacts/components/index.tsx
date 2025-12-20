/** Artifact components for rendering agent-generated UI in a slotted container. */
export { ArtifactContent } from "./components/artifact-content";
export { ArtifactTitle } from "./components/artifact-title";
export { ArtifactProvider } from "./components/artifact-provider";
// eslint-disable-next-line react-refresh/only-export-components -- Re-export hooks from child modules
export { useArtifactOpen } from "./hooks/use-artifact-open";
export type { Setter, ArtifactSlotContextType } from "./types";
