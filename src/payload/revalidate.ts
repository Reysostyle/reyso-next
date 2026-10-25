import { revalidatePath } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

// The storefront is pre-rendered from the catalogue; any change in the
// admin panel re-renders it. Skipped by the seed script, which runs
// outside Next (context.skipRevalidate).
export function revalidateSite(context: Record<string, unknown>) {
  if (context.skipRevalidate) return;
  try {
    revalidatePath("/", "layout");
  } catch {
    // not inside a Next request (CLI); nothing to revalidate
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req.context);
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidateSite(req.context);
  return doc;
};

export const revalidateHooks = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
};
