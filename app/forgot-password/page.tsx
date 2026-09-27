import {SiteFrame} from '@/components/site/SiteFrame';
import {AuthForm} from '@/components/site/AuthForm';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Reset your password','بازیابی گذرواژه'],['Receive a secure password reset link by email.','لینک امن بازیابی گذرواژه را با ایمیل دریافت کنید.'],'/forgot-password',true);
export default function Page(){return <SiteFrame><AuthForm mode="forgot-password"/></SiteFrame>;}
