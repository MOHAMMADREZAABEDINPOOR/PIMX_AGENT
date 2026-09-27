'use client';
import {createContext,useContext} from 'react';
import Link from 'next/link';
import {UserRound,LogOut} from 'lucide-react';
import {LanguageSwitcher,useLocale} from '@/components/i18n/LocaleProvider';
import {localizedHref} from '@/lib/i18n/text';
import {lockVault} from '@/lib/client/vault';
export const WorkspaceAccountContext=createContext<{name:string;sync:string}|null>(null);
export function WorkspaceAccountControls({compact=false}:{compact?:boolean}){
 const account=useContext(WorkspaceAccountContext),locale=useLocale(),fa=locale==='fa';if(!account)return null;
 const title=fa?'حساب، امنیت و انتقال دیتابیس':'Account, security & database transfer';
 if(compact)return <Link href={localizedHref('/account',locale)} title={title} className="p-2.5 rounded-xl hover:bg-white/10"><UserRound size={17}/></Link>;
 return <div className="workspace-account"><div><LanguageSwitcher compact/><Link href={localizedHref('/account',locale)} title={title}><UserRound size={14}/><span>{account.name}</span></Link><button title={fa?'خروج':'Sign out'} onClick={async()=>{const response=await fetch('/api/auth/logout',{method:'POST'});if(response.ok){lockVault();window.location.assign(localizedHref('/login',locale));}}}><LogOut size={15}/></button></div><span role="status">{account.sync==='error'?(fa?'ذخیرهٔ محلی انجام نشد. فضای دستگاه را آزاد کنید.':'Local save failed. Free up device storage.'):account.sync==='saving'?(fa?'ذخیره روی این دستگاه…':'Saving on this device…'):''}</span></div>;
}
