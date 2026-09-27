import { requirePageUser } from '@/lib/server/session';
import { pageMetadata } from '@/lib/site';
import { SiteFrame } from '@/components/site/SiteFrame';
import { AccountSettings } from '@/components/security/AccountSettings';
import { SharedLinks } from '@/components/security/SharedLinks';
import {DatabaseTransfer} from '@/components/security/DatabaseTransfer';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Account & security','حساب و امنیت'],['Manage your password and move your local chat database between devices.','مدیریت گذرواژه و انتقال دیتابیس محلی چت بین دستگاه‌ها.'],'/account',true);
export default async function AccountPage(){const user=await requirePageUser('/account');return <SiteFrame><div className="prose-page account-page-grid"><AccountSettings id={user.id}/><DatabaseTransfer id={user.id}/><SharedLinks/></div></SiteFrame>;}
