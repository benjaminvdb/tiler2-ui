export { ArtifactContent } from "./components/artifact-content";
export { ArtifactTitle } from "./components/artifact-title";
export { ArtifactProvider } from "./components/artifact-provider";
// eslint-disable-next-line react-refresh/only-export-components -- Re-export hooks from child modules
export { useArtifact } from "./hooks/use-artifact";
// eslint-disable-next-line react-refresh/only-export-components -- Re-export hooks from child modules
export { useArtifactOpen } from "./hooks/use-artifact-open";
// eslint-disable-next-line react-refresh/only-export-components -- Re-export hooks from child modules
export { useArtifactContext } from "./hooks/use-artifact-context";
export type {
  Setter,
  ArtifactSlotContextType,
  ArtifactSlotProps,
  ArtifactContentProps,
} from "./types";
