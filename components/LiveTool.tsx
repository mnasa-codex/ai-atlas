"use client";
import { useSearchParams } from "next/navigation";
import ToolDetail from "./ToolDetail";
export default function LiveTool() {
  const params = useSearchParams();
  return <ToolDetail id={params.get("id") || ""} />;
}
