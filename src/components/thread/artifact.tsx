// Re-export the modular artifact components and hooks
export {
  ArtifactContent,
  ArtifactTitle,
  ArtifactProvider,
  useArtifact,
  useArtifactOpen,
  useArtifactContext,
} from "./artifact/index";

export type {
  Setter,
  ArtifactSlotContextType,
  ArtifactSlotProps,
  ArtifactContentProps,
} from "./artifact/index";