import {SecureWorkspace} from '@/components/security/SecureWorkspace';
import {localizedMetadata} from '@/lib/i18n/server';
export const generateMetadata=()=>localizedMetadata(['Private conversation',"گفتگوی خصوصی"],['Your personal conversation in PIMX Agent.',"فضای گفتگوی شخصی شما در PIMX Agent."],'/chat',true);
export default function Page(){return <SecureWorkspace/>;}
