import {LegalPage} from '@/components/site/LegalPage';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Terms of use','شرایط استفاده'],['Terms for your AI workspace, connected models and generated content.','شرایط فضای کاری هوشمند، مدل‌های متصل و محتوای تولیدشده.'],'/terms');
export default function Page(){return <LegalPage kind="terms"/>;}
