import {LegalPage} from '@/components/site/LegalPage';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Privacy policy','سیاست حریم خصوصی'],['How PIMX Agent protects your workspace and keeps private chats on your device.','نحوهٔ محافظت از حساب و نگهداری چت خصوصی روی دستگاه شما.'],'/privacy');
export default function Page(){return <LegalPage kind="privacy"/>;}
