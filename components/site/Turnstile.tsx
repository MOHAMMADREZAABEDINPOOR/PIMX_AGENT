'use client';
import Script from 'next/script';
import { useEffect,useRef,useState } from 'react';
import {useLocale} from '@/components/i18n/LocaleProvider';
declare global{interface Window{turnstile?:{render:(element:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void;reset:(id:string)=>void};}}
export function Turnstile({action,onToken}:{action:string;onToken:(token:string)=>void}){const locale=useLocale();const element=useRef<HTMLDivElement>(null),[loaded,setLoaded]=useState(false),[error,setError]=useState('');const siteKey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(()=>{if(!loaded || !element.current || !window.turnstile || !siteKey)return;const id=window.turnstile.render(element.current,{sitekey:siteKey,action,theme:'auto',language:locale,callback:onToken,'expired-callback':()=>onToken(''),'error-callback':()=>{onToken('');setError(locale==='fa'?'تأیید امنیتی بارگذاری نشد. دوباره تلاش کنید.':'The security challenge could not load. Please try again.');}});return()=>window.turnstile?.remove(id);},[loaded,action,onToken,siteKey,locale]);
  if(!siteKey)return null;return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={()=>setLoaded(true)} onError={()=>setError(locale==='fa'?'اتصال به سرویس تأیید برقرار نشد.':'The security service could not be reached.')}/><div ref={element}/>{error&&<p role="alert">{error}</p>}</>;}
