import {SecureWorkspace} from '@/components/security/SecureWorkspace';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Your AI workspace',"فضای کاری هوش مصنوعی شما"],['Chat, research, build and present without an account.',"گفتگو، تحقیق، ساخت سایت و ارائه بدون حساب."],'/chat',true);
export default function Page(){return <SecureWorkspace/>;}
