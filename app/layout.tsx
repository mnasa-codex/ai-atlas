import './globals.css';
import type {Metadata} from 'next';
import Navbar from '@/components/Navbar';
export const metadata:Metadata={title:{default:'أطلس — اكتشف أدوات الذكاء الاصطناعي',template:'%s | أطلس'},description:'مساحة عربية لاكتشاف أدوات الذكاء الاصطناعي وفهم خططها واستخداماتها.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><head><meta httpEquiv="Content-Security-Policy" content="base-uri 'self'; object-src 'none'; form-action 'self'"/><meta name="referrer" content="strict-origin-when-cross-origin"/></head><body><a href="#main-content" className="skip-link">انتقل إلى المحتوى</a><Navbar/><main id="main-content" className="main-content">{children}</main></body></html>}
