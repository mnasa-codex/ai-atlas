import './globals.css';
import type { Metadata } from 'next';
import StarfieldBackground from '@/components/StarfieldBackground';
import Navbar from '@/components/Navbar';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export const metadata: Metadata = {
  title: 'أطلس — دليل أدوات الذكاء الاصطناعي',
  description: 'دليل عربي احترافي لأهم أدوات الذكاء الاصطناعي وأسعارها ومقارنة خططها.',
  metadataBase: new URL('https://atlas.local')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="noise">
        <StarfieldBackground />
        <Navbar />
        <main>{children}</main>
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
