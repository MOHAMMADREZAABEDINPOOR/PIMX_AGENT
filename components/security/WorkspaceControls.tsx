'use client';
import {createContext,useContext} from 'react';
import {HardDriveDownload,Loader2,Check,AlertCircle} from 'lucide-react';
import {useLocale} from '@/components/i18n/LocaleProvider';

export const OPEN_TRANSFER='pimx-open-transfer';
export const WorkspaceContext=createContext<{sync:string;id?:string}|null>(null);

export function WorkspaceControls({compact=false}:{compact?:boolean}){
 const workspace=useContext(WorkspaceContext),fa=useLocale()==='fa';
 if(!workspace)return null;
 const title=fa?'ذخیره و انتقال چت‌ها':'Save & transfer chats';
 return <button id="btn-open-transfer" type="button" title={title} aria-label={title}
  onClick={event=>window.dispatchEvent(new CustomEvent(OPEN_TRANSFER,{detail:event.currentTarget}))}
  className={compact?'p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10':'workspace-transfer-control w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer'}>
  <HardDriveDownload size={compact?17:16} className="shrink-0 opacity-70"/>
  {!compact&&<><span className="truncate flex-1 text-start">{title}</span><span className="workspace-save-status" role="status" aria-label={workspace.sync==='saving'?(fa?'در حال ذخیره':'Saving'):workspace.sync==='error'?(fa?'ذخیره انجام نشد':'Save failed'):(fa?'ذخیره شد':'Saved')} title={workspace.sync==='error'?(fa?'فضای ذخیره‌سازی مرورگر را بررسی کنید.':'Check browser storage.'):undefined}>{workspace.sync==='saving'?<Loader2 size={12} className="animate-spin"/>:workspace.sync==='error'?<AlertCircle size={12} className="text-red-500"/>:<Check size={12}/>}</span></>}
 </button>;
}
