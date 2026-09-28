'use client';

import {useEffect,useSyncExternalStore} from 'react';
import {portableAppearance,PREFERENCES_EVENT} from './preferences';
const key='pimx_public_accent',event='pimx-appearance';
const subscribe=(callback:()=>void)=>{
 window.addEventListener(event,callback);window.addEventListener(PREFERENCES_EVENT,callback);window.addEventListener('storage',callback);
 return()=>{window.removeEventListener(event,callback);window.removeEventListener(PREFERENCES_EVENT,callback);window.removeEventListener('storage',callback);};
};
const snapshot=()=>localStorage.getItem(key);

export function persistPublicAccent(light:string,dark:string){
 const value=JSON.stringify({light,dark});
 if(localStorage.getItem(key)!==value){localStorage.setItem(key,value);window.dispatchEvent(new Event(event));}
}

export function usePublicAccent(theme:string):string|undefined{
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search),light=params.get('accentLight'),dark=params.get('accentDark');
  if(light&&dark&&/^#[\da-f]{6}$/i.test(light)&&/^#[\da-f]{6}$/i.test(dark))persistPublicAccent(light,dark);
 },[]);
 const value=useSyncExternalStore(subscribe,snapshot,()=>null);
 try{const color=value?JSON.parse(value)[theme]:undefined;return typeof color==='string'&&/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color)?color:undefined;}catch{return undefined;}
}

export function appearanceHref(href:string,light?:string,dark?:string):string{
 const url=new URL(href);
 if(light&&dark){url.searchParams.set('accentLight',light);url.searchParams.set('accentDark',dark);}
 if(typeof window!=='undefined'){const appearance=portableAppearance();if(appearance!=='{}')url.searchParams.set('appearance',appearance);const locale=localStorage.getItem('pimx_locale');if(locale==='fa'||locale==='en')url.searchParams.set('uiLocale',locale);}
 return url.href;
}

export function useAppearanceHref(href:string){
 return useSyncExternalStore(subscribe,()=>{let colors:{light?:string;dark?:string}={};try{colors=JSON.parse(localStorage.getItem(key)||"{}");}catch{}return appearanceHref(href,colors?.light,colors?.dark);},()=>href);
}
