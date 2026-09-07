import catalog from "@/data/catalog.json";
import { validCatalog } from "./validate";
export type {
  Category,
  PricingPlan,
  Tool,
} from "../supabase/functions/_shared/catalog";
import type { Category, Tool } from "../supabase/functions/_shared/catalog";

export const categories: {
  id: "all" | Category;
  label: string;
  icon: string;
}[] = [
  { id: "all", label: "الكل", icon: "✦" },
  { id: "chat", label: "محادثة", icon: "◉" },
  { id: "image", label: "صور", icon: "◌" },
  { id: "video", label: "فيديو", icon: "▶" },
  { id: "code", label: "برمجة", icon: "⌘" },
  { id: "research", label: "بحث", icon: "⌕" },
  { id: "audio", label: "صوت", icon: "◖" },
];

if (!validCatalog(catalog)) throw new Error("Invalid data/catalog.json");
export const seedTools: Tool[] = catalog;

export const demoSettings = {
  whatsappNumber: "963932067632",
  facebookUrl: "https://www.facebook.com/Alaabdalaziz?mibextid=ZbWKwL",
  whatsappMessage:
    "مرحبا، بدي استفسر عن اشتراك بإحدى أدوات الذكاء الاصطناعي عبر منصة أطلس",
};
