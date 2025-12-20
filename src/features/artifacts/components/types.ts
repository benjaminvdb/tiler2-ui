/** Type definitions for artifact slot system that enables portal-style rendering. */

export type Setter<T> = (value: T | ((value: T) => T)) => void;

export interface ArtifactSlotContextType {
  open: [string | null, Setter<string | null>];
  mounted: [string | null, Setter<string | null>];
  title: [HTMLElement | null, Setter<HTMLElement | null>];
  content: [HTMLElement | null, Setter<HTMLElement | null>];
  context: [Record<string, unknown>, Setter<Record<string, unknown>>];
}
