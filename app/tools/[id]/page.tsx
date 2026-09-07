import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { seedTools } from "@/lib/tools";
import ToolDetail from "@/components/ToolDetail";
export const dynamicParams = false;
export function generateStaticParams() {
  return seedTools.map((t) => ({ id: t.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tool = seedTools.find((t) => t.id === id);
  return {
    title: tool ? `${tool.name} — المزايا والخطط` : "الأداة غير متاحة",
    description: tool?.description,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!seedTools.some((t) => t.id === id)) notFound();
  return <ToolDetail id={id} />;
}
