import { seedTools } from "./tools";
const staticIds = new Set(seedTools.map((t) => t.id));
export function toolHref(id: string) {
  return staticIds.has(id)
    ? `/tools/${encodeURIComponent(id)}/`
    : `/tool/?id=${encodeURIComponent(id)}`;
}
