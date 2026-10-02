'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {usePathname} from 'next/navigation';
import {useLocale} from '@/components/i18n/LocaleProvider';
import {localizedHref} from '@/lib/i18n/text';
import {OPEN_COOKIE_SETTINGS} from './CookieSettingsButton';
const subscribe=(callback:()=>void)=>{window.addEventListener('pimx-consent',callback);window.addEventListener('storage',callback);return()=>{window.removeEventListener('pimx-consent',callback);window.removeEventListener('storage',callback);};};
const snapshot=()=>localStorage.getItem('pimx_cookie_consent');
function resolveDark(pathname: string): boolean {
  if (typeof window === 'undefined') return true;
  const cosmic = document.querySelector('.cosmic-site');
  const cosmicTheme = cosmic?.getAttribute('data-public-theme');
  if (cosmicTheme === 'light') return false;
  if (cosmicTheme === 'dark') return true;

  const pub = localStorage.getItem('pimx_public_theme');
  if (pub === 'light') return false;
  if (pub === 'dark') return true;
  if (pub === 'system') return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;

  const isChat = pathname.includes('/chat') || window.location.pathname.includes('/chat');
  if (isChat) {
    const pref = localStorage.getItem('pimx_appearance_preferences');
    if (pref) {
      try {
        const parsed = JSON.parse(pref);
        if (parsed?.themeMode === 'LIGHT') return false;
        if (parsed?.themeMode === 'DARK') return true;
        if (parsed?.themeMode === 'SYSTEM') return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
      } catch {}
    }
  }

  if (document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark') {
    return true;
  }
  if (document.documentElement.getAttribute('data-theme') === 'light') {
    return false;
  }

  return !isChat || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true);
}

export function CookieConsent(){
  const locale=useLocale(),fa=locale==='fa',c=(en:string,faText:string)=>fa?faText:en,
    consent=useSyncExternalStore(subscribe,snapshot,()=>null),
    [opened,setOpened]=useState(false),
    pathname=usePathname(),
    trigger=useRef<HTMLButtonElement|null>(null),
    banner=useRef<HTMLElement|null>(null);

  const [isDark,setIsDark]=useState<boolean>(true);

  useEffect(()=>{
    const checkDark=()=>{
      setIsDark(resolveDark(pathname));
    };
    checkDark();

    window.addEventListener('pimx-preferences',checkDark);
    window.addEventListener('pimx-public-theme',checkDark);
    window.addEventListener('storage',checkDark);
    const media=window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change',checkDark);

    const observer = new MutationObserver(()=>checkDark());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    const cosmic = document.querySelector('.cosmic-site');
    if (cosmic) {
      observer.observe(cosmic, { attributes: true, attributeFilter: ['data-public-theme'] });
    }

    return()=>{
      window.removeEventListener('pimx-preferences',checkDark);
      window.removeEventListener('pimx-public-theme',checkDark);
      window.removeEventListener('storage',checkDark);
      media.removeEventListener('change',checkDark);
      observer.disconnect();
    };
  },[pathname]);

  const close=()=>{setOpened(false);trigger.current?.focus();};
  const choose=(value:string)=>{localStorage.setItem('pimx_cookie_consent',value);window.dispatchEvent(new Event('pimx-consent'));close();};

  useEffect(()=>{const open=(event:Event)=>{trigger.current=(event as CustomEvent<HTMLButtonElement>).detail;setOpened(true);};window.addEventListener(OPEN_COOKIE_SETTINGS,open);return()=>window.removeEventListener(OPEN_COOKIE_SETTINGS,open);},[]);
  useEffect(()=>{if(!opened)return;banner.current?.querySelector<HTMLButtonElement>('.cookie-actions button')?.focus();const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpened(false);trigger.current?.focus();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[opened]);
  useEffect(()=>{if(consent!=='accepted')return;const path=pathname.replace(/^\/fa(?=\/|$)/,'')||'/';if(!['/','/chat','/data','/privacy','/terms','/contact','/thank-you'].includes(path))return;let visitor=localStorage.getItem('pimx_visitor');if(!visitor){visitor=crypto.randomUUID();localStorage.setItem('pimx_visitor',visitor);}void fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path,visitor})}).catch(()=>{});},[consent,pathname]);
  if(consent&&!opened)return null;
  return <aside ref={banner} className={`cookie-banner ${isDark?'dark-theme':'light-theme'}`} dir={fa?'rtl':'ltr'} aria-label={c('Privacy choices','انتخاب حریم خصوصی')}><div>{consent&&opened&&<button type="button" className="cookie-close" onClick={close} aria-label={c('Close cookie settings','بستن تنظیمات کوکی')}>×</button>}<b>{c('Your privacy, your choice','حریم خصوصی، به انتخاب شما')}</b><p>{c('Essential cookies keep this browser’s private workspace available. Optional analytics records visits, device type and approximate location; your chat text and API keys are excluded.','کوکی‌های ضروری دسترسی به فضای خصوصی این مرورگر را حفظ می‌کنند. آمار اختیاری شامل بازدید، نوع دستگاه و موقعیت تقریبی است؛ متن چت و کلید API ثبت نمی‌شود.')} <Link href={localizedHref('/privacy',locale)}>{c('Details','جزئیات')}</Link></p></div><div className="cookie-actions"><button onClick={()=>choose('rejected')}>{c('Essential only','فقط موارد ضروری')}</button><button onClick={()=>choose('accepted')}>{c('Accept optional analytics','پذیرش آمار اختیاری')}</button></div></aside>;}

