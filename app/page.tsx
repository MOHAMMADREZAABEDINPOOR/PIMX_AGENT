import { SecureWorkspace } from '@/components/security/SecureWorkspace';
import { Welcome } from '@/components/site/Welcome';
import { currentUser } from '@/lib/server/session';
import { localizedMetadata } from '@/lib/i18n/server';

export const generateMetadata=()=>localizedMetadata(['Ideas in motion','از ایده تا نتیجه'],['Research, build websites and create presentations in your own intelligent workspace.','فضای کاری هوشمند برای گفتگو، تحقیق، ساخت وب و اسلاید با مدل منتخب شما.'],'/');
export default async function Home() {
  const user=await currentUser();
  return user?<SecureWorkspace user={{id:user.id,displayName:user.displayName}}/>:<Welcome/>;
}
