import { useCallback, useContext, useId } from "react";
import { ArtifactSlotContext } from "../context";
import { ArtifactSlot } from "../components/artifact-slot";
import { ArtifactContentProps } from "../types";

/**
 * Provides a value to be passed into `meta.artifact` field
 * of the `LoadExternalComponent` component, to be consumed by the `useArtifact` hook
 * on the generative UI side.
 */
export function useArtifact() {
  const id = useId();
  const context = useContext(ArtifactSlotContext);
  const [ctxOpen, ctxSetOpen] = context.open;
  const [ctxContext, ctxSetContext] = context.context;
  const [, ctxSetMounted] = context.mounted;

  const open = ctxOpen === id;
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      if (typeof value === "boolean") {
        ctxSetOpen(value ? id : null);
      } else {
        ctxSetOpen((open) => (open === id ? null : id));
      }

      ctxSetMounted(id);
    },
    [ctxSetOpen, ctxSetMounted, id],
  );

  const ArtifactContent = useCallback(
    (props: ArtifactContentProps) => {
      return (
        <ArtifactSlot
          id={id}
          title={props.title}
        >
          {props.children}
        </ArtifactSlot>
      );
    },
    [id],
  );

  return [
    ArtifactContent,
    { open, setOpen, context: ctxContext, setContext: ctxSetContext },
  ] as [
    typeof ArtifactContent,
    {
      open: typeof open;
      setOpen: typeof setOpen;
      context: typeof ctxContext;
      setContext: typeof ctxSetContext;
    },
  ];
}
