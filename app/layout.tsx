import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'TALARIA — Institutional Trading Engine',description:'BTCUSD and XAUUSD multi-timeframe SMC/ICT/Hermes trading platform'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><head><meta name="theme-color" content="#07090d"/></head><body>{children}</body></html>}
