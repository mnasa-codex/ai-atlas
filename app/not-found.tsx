import Link from 'next/link';
export default function NotFound(){return <div className="workspace empty-state"><div className="eyebrow">404</div><h1>هذه الصفحة غير متاحة</h1><p>يمكنك العودة إلى مكتبة الأدوات.</p><Link href="/tools" className="inline-block text-gold mt-5">استكشف الأدوات ←</Link></div>}
