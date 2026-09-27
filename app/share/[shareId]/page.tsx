import SharedChatView from '@/components/chat/SharedChatView';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Shared conversation','گفتگوی اشتراکی'],['A shared PIMX Agent conversation.','گفتگوی اشتراک‌گذاری‌شدهٔ PIMX Agent.'],'/share',true);
export default function Page(){return <SharedChatView/>;}
