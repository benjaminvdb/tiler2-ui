/** Portal target for artifact title that registers its DOM element for remote rendering. */

import { HTMLAttributes, useContext, useLayoutEffect, useRef } from "react";
import { ArtifactSlotContext } from "../context";

/**
 * Provides a DOM ref for rendering artifact titles via portal.
 */
export const ArtifactTitle = (props: HTMLAttributes<HTMLDivElement>) => {
  const context = useContext(ArtifactSlotContext);

  const ref = useRef<HTMLDivElement>(null);
  const [, setStateRef] = context.title;

  useLayoutEffect(() => setStateRef?.(ref.current), [setStateRef]);

  return (
    <div
      {...props}
      ref={ref}
    />
  );
};
