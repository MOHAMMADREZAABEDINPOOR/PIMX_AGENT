'use client';
import {useEffect,useId,useRef} from 'react';
import {createPortal} from 'react-dom';
import {X,HardDriveDownload} from 'lucide-react';
import {DatabaseTransfer} from './DatabaseTransfer';
import {SharedLinks} from './SharedLinks';
import {useLocale} from '@/components/i18n/LocaleProvider';
import {useAppStore} from '@/lib/store/useAppStore';

export function TransferModal({id,onClose}:{id:string;onClose:()=>void}){
 const fa=useLocale()==='fa',title=useId(),panel=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  panel.current?.querySelector<HTMLButtonElement>('[data-close]')?.focus();
  const key=(event:KeyboardEvent)=>{
   if(document.querySelector('[role="alertdialog"]'))return;
   if(event.key==='Escape'){event.preventDefault();onClose();}
   if(event.key!=='Tab')return;
   const controls=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href]')||[]),first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  };
  document.addEventListener('keydown',key);
  return()=>{document.removeEventListener('keydown',key);previous?.focus();};
 },[onClose]);
 return createPortal(<div className="transfer-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><div ref={panel} className="transfer-dialog" role="dialog" aria-modal="true" aria-labelledby={title} dir={fa?'rtl':'ltr'}><header><HardDriveDownload size={20}/><h2 id={title}>{fa?'ذخیره و انتقال چت‌ها':'Save & transfer chats'}</h2><button data-close aria-label={fa?'بستن انتقال داده':'Close data transfer'} onClick={onClose}><X size={18}/></button></header><div className="transfer-dialog-content"><DatabaseTransfer id={id} onImported={()=>{useAppStore.getState().hydrateFromStorage();onClose();}}/><SharedLinks/></div></div></div>,document.body);
}
