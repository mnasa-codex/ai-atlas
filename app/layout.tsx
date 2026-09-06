import './globals.css';
import './atlas.css';
import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';

export const metadata: Metadata = {
  title: { default: 'أطلس — اكتشف أدوات الذكاء الاصطناعي', template: '%s | أطلس' },
  description: 'مساحة عربية لاكتشاف أدوات الذكاء الاصطناعي وفهم خططها واستخداماتها.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl">
    <head>
      <meta httpEquiv="Content-Security-Policy" content="base-uri 'self'; object-src 'none'; form-action 'self'" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" />
    </head>
    <body><SiteShell>{children}</SiteShell></body>
  </html>;
}
