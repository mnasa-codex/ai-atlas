import { Suspense } from "react";
import LiveTool from "@/components/LiveTool";
export const metadata = {
  title: "تفاصيل الأداة",
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <Suspense fallback={<div className="workspace">جارٍ تحميل الأداة…</div>}>
      <LiveTool />
    </Suspense>
  );
}
