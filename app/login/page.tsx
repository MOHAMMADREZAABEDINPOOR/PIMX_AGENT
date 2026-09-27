import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/server/session';
import { SiteFrame } from '@/components/site/SiteFrame';
import { AuthForm } from '@/components/site/AuthForm';
import { localizedMetadata } from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Sign in','ورود به حساب'],['Sign in securely to your PIMX Agent workspace.','با ورود امن به فضای کاری PIMX Agent برگردید.'],'/login',true);
export default async function Login({searchParams}:{searchParams:Promise<{next?:string}>}){if(await currentUser())redirect('/');const {next}=await searchParams;const safeNext=next?.startsWith('/')&&!next.startsWith('//')&&!next.includes('\\')?next:'/';return <SiteFrame><AuthForm mode="login" next={safeNext}/></SiteFrame>;}
