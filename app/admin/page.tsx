import { notFound } from 'next/navigation';
import { requirePageUser } from '@/lib/server/session';
import {localizedMetadata} from '@/lib/i18n/server';
import { SiteFrame } from '@/components/site/SiteFrame';
import { AdminInbox } from '@/components/security/AdminInbox';
import {UiText} from '@/components/i18n/LocaleProvider';
export const generateMetadata=()=>localizedMetadata(['Site administration','مدیریت سایت'],['Users, visits, devices and support messages.','کاربران، بازدید، دستگاه‌ها و پیام‌های پشتیبانی.'],'/admin',true);
export default async function Page(){const user=await requirePageUser('/admin');if(user.role!=='ADMIN')notFound();return <SiteFrame><main className="prose-page"><h1><UiText source={"مدیریت سایت"}/></h1><AdminInbox/></main></SiteFrame>;}
