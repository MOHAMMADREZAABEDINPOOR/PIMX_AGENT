'use client';

import {useEffect,useSyncExternalStore} from 'react';
const key='pimx_public_accent',event='pimx-appearance';
const subscribe=(callback:()=>void)=>{
 window.addEventListener(event,callback);window.addEventListener('storage',callback);
 return()=>{window.removeEventListener(event,callback);window.removeEventListener('storage',callback);};
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
 if(!light||!dark)return href;
 const url=new URL(href);url.searchParams.set('accentLight',light);url.searchParams.set('accentDark',dark);return url.href;
}
