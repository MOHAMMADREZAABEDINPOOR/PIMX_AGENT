import {SiteFrame} from '@/components/site/SiteFrame';
import {WorkspaceData} from '@/components/security/WorkspaceData';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Save & transfer chats',"ذخیره و انتقال چت‌ها"],['Take your encrypted chats to another device. No account needed.',"چت‌های رمزگذاری‌شده را بدون حساب به دستگاه دیگری منتقل کنید."],'/data',true);
export default function Page(){return <SiteFrame><WorkspaceData/></SiteFrame>;}
