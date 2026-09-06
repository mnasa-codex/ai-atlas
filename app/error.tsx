'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="workspace empty-state"><h1>تعذر تحميل هذه الصفحة</h1><p>أعد المحاولة للمتابعة.</p><button onClick={reset}>إعادة المحاولة</button></div>}
