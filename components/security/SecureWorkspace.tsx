'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {AppShell} from '@/components/layout/AppShell';
import {unlockVault} from '@/lib/client/vault';
import {useAppStore} from '@/lib/store/useAppStore';
import {useLocale} from '@/components/i18n/LocaleProvider';
import {WorkspaceAccountContext} from './WorkspaceAccountControls';
import {localizedHref} from '@/lib/i18n/text';
export function SecureWorkspace({user}:{user:{id:string;displayName:string}}){const locale=useLocale(),fa=locale==='fa',c=(en:string,faText:string)=>fa?faText:en;const [sync,setSync]=useState(''),[ready,setReady]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let cancelled=false;unlockVault(user.id).then(()=>{if(!cancelled){useAppStore.setState({isHydrated:false});setReady(true);}},()=>{if(!cancelled)setError(c('The local database could not be unlocked. Sign in again or import your exported database from Account.','دیتابیس محلی باز نشد. دوباره وارد شوید یا فایل خروجی را از صفحهٔ حساب وارد کنید.'));});return()=>{cancelled=true;};},[user.id,attempt,fa]);
 useEffect(()=>{const listener=(event:Event)=>setSync((event as CustomEvent<string>).detail);window.addEventListener('pimx-vault-status',listener);return()=>window.removeEventListener('pimx-vault-status',listener);},[]);
 if(error)return <main className="secure-state"><h1>{c('Workspace could not be opened','فضای کاری باز نشد')}</h1><p role="alert">{error}</p><button onClick={()=>{setError('');setAttempt(value=>value+1);}}>{c('Try again','تلاش دوباره')}</button><Link href={localizedHref('/account',locale)}>{c('Account & database transfer','حساب و انتقال دیتابیس')}</Link></main>;
 if(!ready)return <main className="secure-state" role="status"><div className="secure-spinner"/><h1>{c('Opening your workspace','در حال باز کردن فضای کاری شما')}</h1><p>{c('Secure connection. Loading your local chats…','اتصال امن. بارگذاری چت‌های محلی…')}</p></main>;
 return <WorkspaceAccountContext value={{name:user.displayName,sync}}><AppShell/></WorkspaceAccountContext>;
}
