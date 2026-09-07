"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { seedTools, type Tool } from "@/lib/tools";
import { validCatalog } from "@/lib/validate";
import { supabase } from "@/lib/supabase";
type Catalog = {
  tools: Tool[];
  revision: number;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};
const Context = createContext<Catalog>({
  tools: seedTools,
  revision: 0,
  loading: false,
  error: "",
  refresh: async () => {},
});
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>(seedTools);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error: issue } = await supabase
        .from("atlas_catalog")
        .select("content,revision")
        .eq("id", 1)
        .abortSignal(AbortSignal.timeout(12000))
        .maybeSingle();
      if (issue) throw issue;
      if (data && !validCatalog(data.content))
        throw new Error("Invalid catalog");
      setTools(data ? data.content : seedTools);
      setRevision(data?.revision ?? 0);
      setError("");
    } catch {
      setError("تعذّر تحديث الدليل. نعرض آخر نسخة متاحة؛ حاول التحديث لاحقاً.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <Context.Provider value={{ tools, revision, loading, error, refresh }}>
      {children}
    </Context.Provider>
  );
}
export const useCatalog = () => useContext(Context);
