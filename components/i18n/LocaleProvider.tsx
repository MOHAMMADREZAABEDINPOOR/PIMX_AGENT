'use client';
import { createContext, useCallback, useContext, useEffect,useRef,useState } from 'react';
import {acceptAppearanceLink} from '@/lib/client/preferences';
import { useRouter } from 'next/navigation';
import { Globe2 } from 'lucide-react';
import { translate, type Locale } from '@/lib/i18n/text';
const LocaleContext = createContext<{locale: Locale; setLocale: (value: Locale) => void}>({locale:'en',setLocale:()=>{}});
export function LocaleProvider({initialLocale,children}:{initialLocale:Locale;children:React.ReactNode}) {
  const [locale,setCurrentLocale] = useState(initialLocale), router = useRouter();
  const setLocale = useCallback((value: Locale) => {
    localStorage.setItem('pimx_locale',value);
    setCurrentLocale(value); document.cookie = `pimx_locale=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
    document.documentElement.lang = value; document.documentElement.dir = value === 'fa' ? 'rtl' : 'ltr';
    const path = location.pathname.replace(/^\/fa(?=\/|$)/,'') || '/';
    const target=value === 'fa' ? '/fa' + (path==='/'?'':path) + location.search : path + location.search;
    if(location.pathname+location.search!==target)router.replace(target,{scroll:false});
  },[router]);
  const restored=useRef(false);
  useEffect(()=>{if(restored.current)return;restored.current=true;const incoming=acceptAppearanceLink(),saved=incoming||localStorage.getItem('pimx_locale');setLocale(saved==='fa'||saved==='en'?saved:initialLocale);},[setLocale,initialLocale]);
  return <LocaleContext value={{locale,setLocale}}>{children}</LocaleContext>;
}
export const useLocale = () => useContext(LocaleContext).locale;
export function useT() { const locale = useLocale(); return useCallback((source: string|undefined, ...values: (string | number | undefined)[]) => translate(source||'',locale,...values),[locale]); }
export function UiText({source,values=[]}:{source:unknown;values?:(string|number)[]}) { const t = useT(); return <>{typeof source==='string'?t(source,...values):source as React.ReactNode}</>; }
export function LanguageSwitcher({compact=false}:{compact?:boolean}) { const {locale,setLocale} = useContext(LocaleContext); return <div className={`language-switch ${compact?'compact':''}`} role="group" aria-label={translate('Language',locale)}><Globe2 size={15} aria-hidden/><button type="button" aria-pressed={locale==='en'} onClick={()=>setLocale('en')} lang="en" aria-label="English">EN</button><button type="button" aria-pressed={locale==='fa'} onClick={()=>setLocale('fa')} lang="fa" aria-label="فارسی">فا</button></div>; }
