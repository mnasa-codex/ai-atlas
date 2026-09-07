import { MessageCircle } from "lucide-react";
import { demoSettings } from "@/lib/tools";
export default function FloatingWhatsApp() {
  const href = `https://wa.me/${demoSettings.whatsappNumber}?text=${encodeURIComponent(demoSettings.whatsappMessage)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-6 left-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#12142B]/90 text-gold gold-border shadow-gold-glow backdrop-blur transition hover:scale-105"
    >
      <MessageCircle size={24} />
    </a>
  );
}
