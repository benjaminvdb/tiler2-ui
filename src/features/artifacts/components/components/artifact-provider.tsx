/** Provider component that manages artifact slot state across the application. */

import { ReactNode, useState } from "react";
import { ArtifactSlotContext } from "../context";

/**
 * Initializes and provides artifact slot context, managing open/mounted state and DOM refs.
 */
export const ArtifactProvider: React.FC<{ children?: ReactNode }> = (props) => {
  const content = useState<HTMLElement | null>(null);
  const title = useState<HTMLElement | null>(null);

  const open = useState<string | null>(null);
  const mounted = useState<string | null>(null);
  const context = useState<Record<string, unknown>>({});

  return (
    <ArtifactSlotContext.Provider
      value={{ open, mounted, title, content, context }}
    >
      {props.children}
    </ArtifactSlotContext.Provider>
  );
};
