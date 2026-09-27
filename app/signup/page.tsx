import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/server/session';
import { SiteFrame } from '@/components/site/SiteFrame';
import { AuthForm } from '@/components/site/AuthForm';
import { localizedMetadata } from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Create an account','ساخت حساب'],['Create your personal workspace for research, conversation and creative projects.','فضای کاری شخصی برای تحقیق، گفتگو و ساخت پروژه ایجاد کنید.'],'/signup',true);
export default async function Signup(){if(await currentUser())redirect('/');return <SiteFrame><AuthForm mode="signup"/></SiteFrame>;}
