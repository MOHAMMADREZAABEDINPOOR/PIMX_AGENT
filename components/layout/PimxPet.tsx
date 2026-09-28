'use client';

import {useEffect,useId,useRef,useState,useSyncExternalStore} from 'react';
import {X,MessageSquarePlus,Settings2} from 'lucide-react';
import {useAppStore} from '@/lib/store/useAppStore';
import {UiText,useT,useLocale} from '@/components/i18n/LocaleProvider';

const subscribeMotion=(callback:()=>void)=>{const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',callback);return()=>media.removeEventListener('change',callback);};
type Point={x:number;y:number};
export function PimxPet(){
 const $t=useT(),fa=useLocale()==='fa',gradient=useId().replace(/:/g,'');
 const {settings,isGenerating,generatingChatId,activeChatId,messages,activeToolPanel,lastCompletedChatId,createChat,setSettingsOpen,updateSettings}=useAppStore();
 const reduced=useSyncExternalStore(subscribeMotion,()=>matchMedia('(prefers-reduced-motion: reduce)').matches,()=>true)||settings.reduceMotion;
 const [open,setOpen]=useState(false),[patted,setPatted]=useState(false),[celebrating,setCelebrating]=useState(false),[hovered,setHovered]=useState(false),[dragging,setDragging]=useState(false),[position,setPosition]=useState<Point>({x:16,y:0}),[facing,setFacing]=useState(1),[walking,setWalking]=useState(false);
 const wrapper=useRef<HTMLDivElement>(null),body=useRef<HTMLButtonElement>(null),drag=useRef<{start:Point;origin:Point;moved:boolean}|undefined>(undefined),suppressClick=useRef(false);
 const enabled=settings.petEnabled!==false&&activeToolPanel==='NONE';
 const message=(messages[generatingChatId||activeChatId||'']||[]).findLast(item=>item.role==='assistant'),step=message?.toolSteps?.findLast(item=>item.status==='CALLING');
 const mood=isGenerating?step?.toolName==='web_search'||step?.toolName==='agent_read'?'search':step?.toolName==='agent_plan'?'think':'work':celebrating||patted?'happy':'idle';
 const clamp=(point:Point)=>{const parent=wrapper.current?.parentElement;return {x:Math.max(12,Math.min(point.x,(parent?.clientWidth||300)-76)),y:Math.max(16,Math.min(point.y,(parent?.clientHeight||600)-140))};};
 useEffect(()=>{if(!enabled||!wrapper.current?.parentElement)return;const parent=wrapper.current.parentElement;const resize=()=>setPosition(previous=>clamp({...previous,y:previous.y||parent.clientHeight-180}));resize();const observer=new ResizeObserver(resize);observer.observe(parent);return()=>observer.disconnect();},[enabled]);
 useEffect(()=>{if(!lastCompletedChatId)return;setCelebrating(true);const timer=setTimeout(()=>setCelebrating(false),3500);return()=>clearTimeout(timer);},[lastCompletedChatId]);
 useEffect(()=>{if(!patted)return;const timer=setTimeout(()=>setPatted(false),1800);return()=>clearTimeout(timer);},[patted]);
 useEffect(()=>{
  if(!enabled||reduced||hovered||open||dragging||isGenerating){setWalking(false);return;}
  let finish:ReturnType<typeof setTimeout>;
  const timer=setInterval(()=>{setPosition(previous=>{const parent=wrapper.current?.parentElement;if(!parent)return previous;const target=clamp({x:previous.x+(previous.x<120?1:previous.x>parent.clientWidth-150?-1:Math.random()>.5?1:-1)*(65+Math.random()*90),y:parent.clientHeight-165-Math.random()*35});setFacing(target.x<previous.x?-1:1);return target;});setWalking(true);clearTimeout(finish);finish=setTimeout(()=>setWalking(false),2200);},4500);
  return()=>{clearInterval(timer);clearTimeout(finish);};
 },[enabled,reduced,hovered,open,dragging,isGenerating]);
 useEffect(()=>{
  if(!enabled||reduced)return;
  const follow=(event:PointerEvent)=>{const bounds=body.current?.getBoundingClientRect();if(!bounds)return;body.current?.style.setProperty('--eye-x',`${Math.max(-3,Math.min(3,(event.clientX-bounds.x-bounds.width/2)/100))}px`);body.current?.style.setProperty('--eye-y',`${Math.max(-2,Math.min(2,(event.clientY-bounds.y-bounds.height/2)/150))}px`);};
  window.addEventListener('pointermove',follow,{passive:true});return()=>window.removeEventListener('pointermove',follow);
 },[enabled,reduced]);
 const labels={idle:fa?'من اینجام؛ آمادهٔ یه ایدهٔ تازه؟':'Right here. Ready for your next idea?',think:fa?'دارم مسیر حل رو بررسی می‌کنم…':'Working out the plan…',search:fa?'بریم دنبال منابع خوب!':'Following the evidence…',work:fa?'مدل داره روی درخواستت کار می‌کنه…':'Your model is working on it…',happy:celebrating?(fa?'آماده‌ست! بیا یه نگاه بندازیم.':'All set! Take a look.'):(fa?'سلام! خوش اومدی.':'Hello! Good to see you.')};
 if(!enabled)return null;
 return <div ref={wrapper} className="pimx-pet" data-mood={mood} data-motion={dragging?'dragging':walking?'walking':'resting'} style={{left:position.x,top:position.y,'--pet-facing':facing} as React.CSSProperties} onPointerEnter={()=>{if(walking&&wrapper.current){const bounds=wrapper.current.getBoundingClientRect(),parent=wrapper.current.offsetParent?.getBoundingClientRect();if(parent)setPosition(clamp({x:bounds.x-parent.x,y:bounds.y-parent.y}));}setHovered(true);}} onPointerLeave={()=>setHovered(false)}>
  {open&&<div className="pet-dialog rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-3 shadow-xl text-[var(--text-color)]" style={{left:Math.max(12,Math.min(position.x,(wrapper.current?.parentElement?.clientWidth||300)-277))-position.x,bottom:position.y>240?78:'auto',top:position.y>240?'auto':78}}><div className="flex items-center justify-between gap-4"><strong className="text-xs"><UiText source="Pip · PIMX companion"/></strong><button aria-label={$t('Close companion')} onClick={()=>setOpen(false)} className="p-1"><X size={13}/></button></div><p className="text-xs leading-6 text-muted my-2" role="status">{labels[mood]}</p><small className="block text-muted text-[10px] mb-3">{fa?'می‌تونی من رو بگیری و جابه‌جا کنی!':'Drag me around, or move me with the arrow keys.'}</small><div className="flex gap-2"><button aria-label={$t('Start a chat with Pip')} disabled={isGenerating} onClick={()=>{createChat();setOpen(false);}} className="rounded-lg p-2 bg-accent disabled:opacity-40"><MessageSquarePlus size={14}/></button><button aria-label={$t('Companion settings')} onClick={()=>{setSettingsOpen(true,'General');setOpen(false);}} className="rounded-lg p-2 border border-[var(--border-color)]"><Settings2 size={14}/></button><button onClick={()=>updateSettings({petEnabled:false})} className="text-[10px] text-muted ms-auto"><UiText source="Hide pet"/></button></div></div>}
  <button ref={body} aria-label={$t('PIMX companion Pip')} aria-expanded={open} title={fa?'پیپ؛ برای جابه‌جایی بگیر و بکش':'Pip · drag to move'} className="pet-body focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]"
   onPointerDown={event=>{if(event.button!==0)return;drag.current={start:{x:event.clientX,y:event.clientY},origin:position,moved:false};event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);}}
   onPointerMove={event=>{if(!drag.current)return;const dx=event.clientX-drag.current.start.x,dy=event.clientY-drag.current.start.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.current.moved=true;if(drag.current.moved){setPosition(clamp({x:drag.current.origin.x+dx,y:drag.current.origin.y+dy}));setFacing(dx<0?-1:1);}}}
   onPointerUp={()=>{suppressClick.current=!!drag.current?.moved;drag.current=undefined;setDragging(false);}}
   onPointerCancel={()=>{drag.current=undefined;setDragging(false);suppressClick.current=true;}}
   onClick={()=>{if(suppressClick.current){suppressClick.current=false;return;}setOpen(!open);setPatted(true);}}
   onKeyDown={event=>{const move:Record<string,Point>={ArrowLeft:{x:-24,y:0},ArrowRight:{x:24,y:0},ArrowUp:{x:0,y:-24},ArrowDown:{x:0,y:24}};const delta=move[event.key];if(delta){event.preventDefault();setPosition(previous=>clamp({x:previous.x+delta.x,y:previous.y+delta.y}));}}}>
   <svg className="pet-avatar" viewBox="0 0 100 100" fill="none" aria-hidden="true"><defs><linearGradient id={gradient} x1="20" y1="20" x2="80" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="var(--accent-color)"/><stop offset="1" stopColor="color-mix(in srgb,var(--accent-color) 60%,#24183d)"/></linearGradient></defs><ellipse className="pet-shadow" cx="50" cy="88" rx="27" ry="5" fill="var(--accent-color)" opacity=".18"/><g className="pet-creature"><path className="pet-ears" d="M24 38 17 18Q16 10 25 14L40 26M76 38 83 18Q84 10 75 14L60 26" fill="var(--accent-color)" stroke="var(--accent-color)" strokeWidth="3"/><path d="M20 49Q20 24 50 24Q80 24 80 49V64Q80 85 50 85Q20 85 20 64Z" fill={`url(#${gradient})`}/><path className="pet-foot-left" d="M27 78 24 87" stroke="var(--accent-color)" strokeWidth="9" strokeLinecap="round"/><path className="pet-foot-right" d="M73 78 76 87" stroke="var(--accent-color)" strokeWidth="9" strokeLinecap="round"/><rect x="27" y="39" width="46" height="28" rx="13" fill="#171827"/><g className="pet-gaze"><g className="pet-eyes"><ellipse cx="40" cy="52" rx="3.5" ry="5" fill="#a5f3fc"/><ellipse cx="60" cy="52" rx="3.5" ry="5" fill="#a5f3fc"/></g></g><path className="pet-smile" d="M44 61Q50 65 56 61" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round"/><path className="pet-arm-left" d="M13 54 8 63" stroke="var(--accent-color)" strokeWidth="7" strokeLinecap="round"/><path className="pet-arm-right" d="M87 54 92 63" stroke="var(--accent-color)" strokeWidth="7" strokeLinecap="round"/><path d="m47 31 3-5 3 5-3 4z" fill="#e9d5ff"/></g><g className="pet-spark" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"><path d="M87 8v8M83 12h8M8 35v6M5 38h6"/></g></svg><span className="pet-status" aria-hidden="true"/>
  </button>
 </div>;
}
