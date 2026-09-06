import catalog from '@/data/catalog.json';
import {validCatalog} from './validate';
export type Category = 'chat'|'image'|'video'|'code'|'research'|'audio';

export type PricingPlan = {
  name: string;
  monthly?: number;       // فارغ = مجاني أو سعر مخصص
  annual?: number;        // السعر الشهري الفعلي عند الدفع السنوي (إن وجد خصم سنوي)
  custom?: boolean;       // خطط Enterprise بدون سعر ثابت
  bestFor: string;        // لمن تناسب هذه الخطة تحديدًا
  included?: string[];    // تطبيقات/أدوات مرفقة ضمن الخطة (Flow, NotebookLM, Sora...)
  features: string[];     // أبرز المزايا العملية
  limits?: string;        // وصف حدود الاستخدام إن وجدت
  popular?: boolean;      // شارة "الأكثر طلبًا"
  verified: string;       // تاريخ آخر تحقق يدوي
  source: string;         // رابط صفحة التسعير الرسمية
};

export type Tool = {
  id:string; name:string; vendor:string; category:Category; hook:string; description:string;
  website:string; logo:string; logoUrl?:string; featured:boolean; plans:PricingPlan[]
};

export const categories:{id:'all'|Category;label:string;icon:string}[] = [
  {id:'all',label:'الكل',icon:'✦'}, {id:'chat',label:'محادثة',icon:'◉'}, {id:'image',label:'صور',icon:'◌'}, {id:'video',label:'فيديو',icon:'▶'}, {id:'code',label:'برمجة',icon:'⌘'}, {id:'research',label:'بحث',icon:'⌕'}, {id:'audio',label:'صوت',icon:'◖'}
];

if(!validCatalog(catalog)) throw new Error('Invalid data/catalog.json');
export const seedTools:Tool[]=catalog;

export const demoSettings={whatsappNumber:'963932067632',facebookUrl:'https://www.facebook.com/Alaabdalaziz?mibextid=ZbWKwL',whatsappMessage:'مرحبا، بدي استفسر عن اشتراك بإحدى أدوات الذكاء الاصطناعي عبر منصة أطلس'};
