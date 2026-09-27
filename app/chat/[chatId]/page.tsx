import { SecureWorkspace } from '@/components/security/SecureWorkspace';
import { requirePageUser } from '@/lib/server/session';
import {localizedMetadata} from '@/lib/i18n/server';

export const generateMetadata=()=>localizedMetadata(['Private conversation','گفتگوی خصوصی'],['Your personal conversation in PIMX Agent.','فضای گفتگوی شخصی شما در PIMX Agent.'],'/chat',true);
export default async function ChatPage({params}:{params:Promise<{chatId:string}>}) {
  const {chatId}=await params,user=await requirePageUser(`/chat/${chatId}`);
  return <SecureWorkspace user={{id:user.id,displayName:user.displayName}}/>;
}
