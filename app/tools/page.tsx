import ToolsExplorer from "@/components/ToolsExplorer";
export default function ToolsPage() {
  return (
    <div className="workspace">
      <header className="page-heading">
        <div className="eyebrow">THE TOOL LIBRARY</div>
        <h1>كل الأدوات. في متناولك.</h1>
        <p>من أول فكرة إلى آخر سطر كود، اكتشف ما يساعدك على الإنجاز.</p>
      </header>
      <ToolsExplorer />
    </div>
  );
}
