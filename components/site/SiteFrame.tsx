'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect,useSyncExternalStore } from 'react';
import { Moon, Sun, ArrowUpRight } from 'lucide-react';
import { LanguageSwitcher, useLocale, useT } from '@/components/i18n/LocaleProvider';
import { CookieSettingsButton } from './CookieSettingsButton';
import { usePublicAccent } from '@/lib/client/appearance';
import {appearanceHref} from '@/lib/client/appearance';
import {persistAppearance} from '@/lib/client/preferences';
import { accentContrast,applyAccentTokens } from '@/lib/theme/appearance';
import { localizedHref } from '@/lib/i18n/text';
const subscribe=(callback:()=>void)=>{window.addEventListener('pimx-public-theme',callback);return()=>window.removeEventListener('pimx-public-theme',callback);};
const snapshot=()=>localStorage.getItem('pimx_public_theme') || 'dark';
const subscribeMedia=(callback:()=>void)=>{const media=matchMedia('(prefers-color-scheme: dark)');media.addEventListener('change',callback);return()=>media.removeEventListener('change',callback);};
export const usePublicTheme=()=>{const mode=useSyncExternalStore(subscribe,snapshot,()=> 'dark'),systemDark=useSyncExternalStore(subscribeMedia,()=>matchMedia('(prefers-color-scheme: dark)').matches,()=>true);return mode==='system'?(systemDark?'dark':'light'):mode;};
export function SiteFrame({children}:{children:React.ReactNode}) {
  const locale=useLocale(),t=useT(),theme=usePublicTheme(),href=(path:string)=>localizedHref(path,locale),chat='https://chat.pimxagent.pages.dev'+(locale==='fa'?'/fa/':'/');
  const accent=usePublicAccent(theme),light=usePublicAccent('light'),dark=usePublicAccent('dark');
  useEffect(()=>{if(accent)applyAccentTokens(document.documentElement,accent,theme==='dark');},[accent,theme]);
  return <div className="site-page cosmic-site" data-public-theme={theme} style={accent?{'--site-accent':accent,'--site-button':accent,'--site-accent-contrast':accentContrast(accent)} as React.CSSProperties:undefined} dir={locale==='fa'?'rtl':'ltr'}>
    <header className="site-nav"><Link href={href('/')} className="site-brand"><Image src="/brand-logo.webp" alt="PIMX Agent" width={38} height={38}/><span>PIMX <b>AGENT</b></span></Link>
      <nav aria-label={locale==='fa'?'ناوبری اصلی':'Main navigation'}><Link href={href('/contact')} className="nav-contact">{t('Contact')}</Link><LanguageSwitcher/><button className="site-theme-toggle" aria-label={locale==='fa'?'تغییر تم':'Toggle theme'} onClick={()=>{persistAppearance({themeMode:theme==='dark'?'LIGHT':'DARK'});}}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button><Link href={appearanceHref(chat,light,dark)} className="site-button small">{locale==='fa'?"ورود به چت":'Open chat'}<ArrowUpRight size={16}/></Link></nav>
    </header>
    <main className="site-content">{children}</main>
    <footer className="site-footer"><div className="footer-brand"><b>PIMX AGENT</b><p>{locale==='fa'?'ایده‌ها در حرکت.':'Ideas. In motion.'}</p><a href="mailto:pimxagent@gmail.com" dir="ltr">pimxagent@gmail.com</a></div><nav aria-label={locale==='fa'?'اطلاعات سایت':'Site information'}><Link href={href('/privacy')}>{t('Privacy')}</Link><Link href={href('/terms')}>{t('Terms')}</Link><Link href={href('/contact')}>{t('Contact')}</Link><CookieSettingsButton className="footer-cookie-settings"/><span>© {new Date().getFullYear()} PIMX Agent</span></nav></footer>
  </div>;
}
