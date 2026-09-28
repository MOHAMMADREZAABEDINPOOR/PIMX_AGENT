'use client';
import {useWorkspaceVault} from './SecureWorkspace';
import {DatabaseTransfer} from './DatabaseTransfer';
import {SharedLinks} from './SharedLinks';
import {useLocale} from '@/components/i18n/LocaleProvider';
export function WorkspaceData(){const{id,error,retry}=useWorkspaceVault(),fa=useLocale()==='fa';if(error)return <div className="secure-state"><p role="alert">{fa?"فضای کاری باز نشد. اتصال و ذخیره‌سازی مرورگر را بررسی کنید.":'Check your connection and browser storage.'}</p><button onClick={retry}>{fa?"تلاش دوباره":'Try again'}</button></div>;if(!id)return <div className="secure-state" role="status">{fa?"آماده‌سازی چت‌های این دستگاه…":'Opening this device’s chats?'}</div>;return <div className="prose-page account-page-grid"><DatabaseTransfer id={id}/><SharedLinks/></div>;}
