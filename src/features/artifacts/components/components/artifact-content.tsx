/** Portal target for artifact content that conditionally mounts based on slot state. */

import { HTMLAttributes, useContext, useLayoutEffect, useRef } from "react";
import { ArtifactSlotContext } from "../context";

/**
 * Renders only when an artifact is mounted, providing a DOM ref for portal rendering.
 */
export const ArtifactContent = (props: HTMLAttributes<HTMLDivElement>) => {
  const context = useContext(ArtifactSlotContext);

  const [mounted] = context.mounted;
  const ref = useRef<HTMLDivElement>(null);
  const [, setStateRef] = context.content;

  useLayoutEffect(
    () => setStateRef?.(mounted ? ref.current : null),
    [setStateRef, mounted],
  );

  if (!mounted) return null;
  return (
    <div
      {...props}
      ref={ref}
    />
  );
};
