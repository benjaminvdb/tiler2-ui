import { HTMLAttributes, useContext, useLayoutEffect, useRef } from "react";
import { ArtifactSlotContext } from "../context";

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
