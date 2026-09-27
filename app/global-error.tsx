'use client';

import React, {useEffect,useState} from 'react';
import { RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [fa,setFa]=useState(false);
  useEffect(()=>{setFa(document.documentElement.lang==='fa'||document.cookie.split(';').some(cookie=>cookie.trim()==='pimx_locale=fa'));},[]);
  return (
    <html lang={fa?'fa':'en'} dir={fa?'rtl':'ltr'}>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#0a0a0c', color: '#f4f4f8' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '460px', width: '100%', background: '#121216', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>
              {fa?'خطا در بارگذاری سیستم':'Unable to load your workspace'}
            </h1>
            <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '24px' }}>
              {fa?'برنامه با مشکلی مواجه شد. برای بارگذاری مجدد روی دکمهٔ زیر کلیک کنید.':'The application encountered a problem. Reload to try again.'}
            </p>
            <button
              onClick={() => reset()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                backgroundColor: '#9333ea',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} />
              <span>{fa?'تلاش مجدد':'Try again'}</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
