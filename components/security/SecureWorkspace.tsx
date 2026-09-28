'use client';
import {useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import {unlockVault} from '@/lib/client/vault';
import {useLocale} from '@/components/i18n/LocaleProvider';
import {WorkspaceContext} from './WorkspaceControls';
// Browser storage and UI libraries are loaded after the private workspace opens.
const AppShell=dynamic(()=>import('@/components/layout/AppShell').then(module=>module.AppShell),{ssr:false,loading:()=> <div className="secure-state" role="status"><div className="secure-spinner"/></div>});
let bootstrap:Promise<{id:string;key:string}>|undefined;
function openWorkspace(){return bootstrap??=(async()=>{const response=await fetch('/api/workspace?key=1',{cache:'no-store'});if(!response.ok)throw new Error('unavailable');const data=await response.json();await unlockVault(data.id,data.key);const {useAppStore}=await import('@/lib/store/useAppStore');useAppStore.setState({isHydrated:false});return data;})().catch(error=>{bootstrap=undefined;throw error;});}
export function useWorkspaceVault(){const[id,setId]=useState(''),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);useEffect(()=>{let active=true;void openWorkspace().then(data=>{if(active){setId(data.id);}},()=>{if(active)setError('unavailable');});return()=>{active=false;};},[attempt]);return{id,error,retry:()=>{setError('');setAttempt(value=>value+1);}};}
export function SecureWorkspace(){const fa=useLocale()==='fa',c=(en:string,persian:string)=>fa?persian:en;const{id,error,retry}=useWorkspaceVault(),[sync,setSync]=useState('');useEffect(()=>{const listener=(event:Event)=>setSync((event as CustomEvent<string>).detail);window.addEventListener('pimx-vault-status',listener);return()=>window.removeEventListener('pimx-vault-status',listener);},[]);
 if(error)return <main className="secure-state"><h1>{c('Workspace could not be opened',"فضای کاری باز نشد")}</h1><p role="alert">{c('Check your connection and allow browser storage, then try again.',"اتصال اینترنت و دسترسی مرورگر به فضای ذخیره‌سازی را بررسی کنید و دوباره تلاش کنید.")}</p><button onClick={retry}>{c('Try again',"تلاش دوباره")}</button></main>;
 if(!id)return <main className="secure-state" role="status"><div className="secure-spinner"/><h1>{c('Getting your workspace ready',"در حال آماده‌سازی فضای کاری")}</h1><p>{c('No account needed. Your saved chats stay on this device.',"بدون نیاز به حساب. چت‌های ذخیره‌شده روی همین دستگاه می‌مانند.")}</p></main>;
 return <WorkspaceContext value={{sync,id}}><AppShell/></WorkspaceContext>;
}
