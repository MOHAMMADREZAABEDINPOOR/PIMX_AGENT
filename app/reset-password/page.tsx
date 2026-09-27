import {SiteFrame} from '@/components/site/SiteFrame';
import {AuthForm} from '@/components/site/AuthForm';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Choose a new password','تعیین گذرواژهٔ جدید'],['Reset your PIMX Agent password securely.','گذرواژهٔ PIMX Agent را به‌صورت امن بازنشانی کنید.'],'/reset-password',true);
export default function Page(){return <SiteFrame><AuthForm mode="reset-password"/></SiteFrame>;}
