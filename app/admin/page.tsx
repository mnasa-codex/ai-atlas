import {notFound} from 'next/navigation';
import AdminEditor from '@/components/AdminEditor';
export const dynamic='force-static';
export default function Admin(){if(process.env.NODE_ENV==='production')notFound();return <AdminEditor/>}
