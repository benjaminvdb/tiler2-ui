import React from "react";
import { XIcon } from "lucide-react";
import {
  ArtifactContent,
  ArtifactTitle,
} from "@/features/artifacts/components";

interface ArtifactPanelProps {
  onClose: () => void;
}
const ArtifactPanelComponent: React.FC<ArtifactPanelProps> = ({ onClose }) => {
  return (
    <div className="relative flex flex-col border-l">
      <div className="absolute inset-0 flex min-w-[30vw] flex-col">
        <div className="grid grid-cols-[1fr_auto] border-b p-4">
          <ArtifactTitle className="truncate overflow-hidden" />
          <button
            onClick={onClose}
            className="cursor-pointer"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <ArtifactContent className="relative flex-grow" />
      </div>
    </div>
  );
};

ArtifactPanelComponent.displayName = "ArtifactPanel";

export const ArtifactPanel = React.memo(ArtifactPanelComponent);
