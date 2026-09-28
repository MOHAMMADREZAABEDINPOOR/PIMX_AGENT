import {redirect} from 'next/navigation';
import {getLocale} from '@/lib/i18n/server';
export default async function Page(){const locale=await getLocale();redirect((locale==='fa'?'/fa':'')+'/chat');}
