import {SecureWorkspace} from '@/components/security/SecureWorkspace';
import {Welcome} from '@/components/site/Welcome';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['PIMX Agent — from a question to something real',"PIMX Agent — از یک سؤال تا یک نتیجهٔ واقعی"],['Your AI workspace for chat, research, websites, presentations and learning. Open it without signup.',"فضای کاری هوش مصنوعی برای گفتگو، تحقیق، ساخت سایت، ارائه و یادگیری؛ بدون ثبت‌نام."],'/');
export default function Home(){return process.env.APP_SURFACE==='chat'?<SecureWorkspace/>:<Welcome/>;}
