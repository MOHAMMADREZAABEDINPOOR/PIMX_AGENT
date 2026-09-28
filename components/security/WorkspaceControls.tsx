'use client';
import {createContext,useContext} from 'react';
import Link from 'next/link';
import {HardDriveDownload,ArrowUpRight} from 'lucide-react';
import {LanguageSwitcher,useLocale} from '@/components/i18n/LocaleProvider';
import {localizedHref} from '@/lib/i18n/text';
import {appearanceHref,usePublicAccent} from '@/lib/client/appearance';
export const WorkspaceContext=createContext<{sync:string}|null>(null);
export function WorkspaceControls({compact=false}:{compact?:boolean}){const workspace=useContext(WorkspaceContext),locale=useLocale(),fa=locale==='fa',light=usePublicAccent('light'),dark=usePublicAccent('dark');if(!workspace)return null;const title=fa?"ذخیره و انتقال چت‌ها":'Save & transfer chats';if(compact)return <Link href={localizedHref('/data',locale)} title={title} className="p-2.5 rounded-xl hover:bg-white/10"><HardDriveDownload size={17}/></Link>;return <div className="workspace-account"><div><LanguageSwitcher compact/><Link href={localizedHref('/data',locale)} title={title}><HardDriveDownload size={14}/><span>{fa?"چت‌های این دستگاه":'Chats on this device'}</span></Link><a href={appearanceHref('https://pimxagent.pages.dev'+(fa?'/fa':'/'),light,dark)} title={fa?"دربارهٔ PIMX Agent":'About PIMX Agent'}><ArrowUpRight size={15}/></a></div><span role="status">{workspace.sync==='error'?(fa?"ذخیره انجام نشد؛ فضای دستگاه را بررسی کنید.":'Save failed. Check device storage.'):workspace.sync==='saving'?(fa?"ذخیره روی این دستگاه…":'Saving on this device…'):''}</span></div>;}
