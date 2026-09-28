'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSyncExternalStore } from 'react';
import { Moon, Sun, ArrowUpRight } from 'lucide-react';
import { LanguageSwitcher, useLocale, useT } from '@/components/i18n/LocaleProvider';
import { localizedHref } from '@/lib/i18n/text';
const subscribe=(callback:()=>void)=>{window.addEventListener('pimx-public-theme',callback);return()=>window.removeEventListener('pimx-public-theme',callback);};
const snapshot=()=>localStorage.getItem('pimx_public_theme') || 'dark';
export const usePublicTheme=()=>useSyncExternalStore(subscribe,snapshot,()=> 'dark');
export function SiteFrame({children}:{children:React.ReactNode}) {
  const locale=useLocale(),t=useT(),theme=usePublicTheme(),href=(path:string)=>localizedHref(path,locale),chat='https://chat.pimxagent.pages.dev'+(locale==='fa'?'/fa/':'/');
  return <div className="site-page cosmic-site" data-public-theme={theme} dir={locale==='fa'?'rtl':'ltr'}>
    <header className="site-nav"><Link href={href('/')} className="site-brand"><Image src="/brand-logo.webp" alt="PIMX Agent" width={38} height={38}/><span>PIMX <b>AGENT</b></span></Link>
      <nav aria-label={locale==='fa'?'ناوبری اصلی':'Main navigation'}><Link href={href('/contact')} className="nav-contact">{t('Contact')}</Link><LanguageSwitcher/><button className="site-theme-toggle" aria-label={locale==='fa'?'تغییر تم':'Toggle theme'} onClick={()=>{localStorage.setItem('pimx_public_theme',theme==='dark'?'light':'dark');window.dispatchEvent(new Event('pimx-public-theme'));}}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button><Link href={chat} className="site-button small">{locale==='fa'?"ورود به چت":'Open chat'}<ArrowUpRight size={16}/></Link></nav>
    </header>
    <main className="site-content">{children}</main>
    <footer className="site-footer"><div className="footer-brand"><b>PIMX AGENT</b><p>{locale==='fa'?'ایده‌ها در حرکت.':'Ideas. In motion.'}</p><a href="mailto:pimxagent@gmail.com" dir="ltr">pimxagent@gmail.com</a></div><nav aria-label={locale==='fa'?'اطلاعات سایت':'Site information'}><Link href={href('/privacy')}>{t('Privacy')}</Link><Link href={href('/terms')}>{t('Terms')}</Link><Link href={href('/contact')}>{t('Contact')}</Link><span>© {new Date().getFullYear()} PIMX Agent</span></nav></footer>
  </div>;
}
