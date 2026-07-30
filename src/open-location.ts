import type { NoteOpenLocation } from "./types";

export type LeafOpenTarget = false | "tab" | "split";

export function resolveLeafOpenTarget(location: NoteOpenLocation, forceNewTab = false): LeafOpenTarget {
  if (forceNewTab) return "tab";
  return location === "current" ? false : location;
}
