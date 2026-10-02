import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles
import './landing.css';
import { CookieConsent } from '@/components/site/CookieConsent';
import { siteUrl,pageMetadata } from '@/lib/site';
import { getLocale } from '@/lib/i18n/server';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import {PwaManager} from '@/components/layout/PwaManager';

export const metadata: Metadata = {
  ...pageMetadata('PIMX Agent','One workspace for conversation, deep research, websites and presentations.','/'),
  metadataBase: new URL(siteUrl),
  applicationName: 'PIMX Agent',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'PIMX Agent' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },

};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#08090c' };

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={locale==='fa'?'rtl':'ltr'}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('pimx_public_theme');if(!s){var p=localStorage.getItem('pimx_appearance_preferences');if(p){var j=JSON.parse(p);if(j&&j.themeMode)s=j.themeMode.toLowerCase();}}var d=s==='dark'||(!s&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&family=Cairo:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="/fonts/local-fonts.css" />
        <link rel="stylesheet" href="/fonts/core/core-fonts.css" />
      </head>
      <body suppressHydrationWarning><LocaleProvider initialLocale={locale}><PwaManager/>{children}<CookieConsent/></LocaleProvider></body>
    </html>
  );
}
