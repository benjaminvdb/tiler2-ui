import { createContext } from "react";
import { ArtifactSlotContextType } from "./types";

export const ArtifactSlotContext = createContext<ArtifactSlotContextType>(
  null!,
);
