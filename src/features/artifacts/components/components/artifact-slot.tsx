import { useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArtifactSlotContext } from "../context";
import { ArtifactSlotProps } from "../types";

/**
 * Headless component that will obtain the title and content of the artifact
 * and render them in place of the `ArtifactContent` and `ArtifactTitle` components via
 * React Portals.
 */
export const ArtifactSlot = (props: ArtifactSlotProps) => {
  const context = useContext(ArtifactSlotContext);

  const [ctxMounted, ctxSetMounted] = context.mounted;
  const [content] = context.content;
  const [title] = context.title;

  const isMounted = ctxMounted === props.id;
  const isEmpty = props.children == null && props.title == null;

  useEffect(() => {
    if (isEmpty) {
      ctxSetMounted((open) => (open === props.id ? null : open));
    }
  }, [isEmpty, ctxSetMounted, props.id]);

  if (!isMounted) return null;
  return (
    <>
      {title != null ? createPortal(<>{props.title}</>, title) : null}
      {content != null ? createPortal(<>{props.children}</>, content) : null}
    </>
  );
};
