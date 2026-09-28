import type {AppSettings} from '@/lib/types';
import {THEME_PRESETS} from '@/lib/theme/presets';
import {ACCENT_PRESETS} from '@/lib/theme/accents';

const key='pimx_appearance_preferences';
export const PREFERENCES_EVENT='pimx-preferences';
export type AppearancePreferences=Pick<AppSettings,'themeMode'|'themePreset'|'accent'|'customAccentHex'>;

function validate(value:unknown):Partial<AppearancePreferences>{
 if(!value||typeof value!=='object')return {};
 const data=value as Record<string,unknown>,result:Partial<AppearancePreferences>={};
 if(['LIGHT','DARK','SYSTEM'].includes(String(data.themeMode)))result.themeMode=data.themeMode as AppearancePreferences['themeMode'];
 if(THEME_PRESETS.some(item=>item.id===data.themePreset))result.themePreset=String(data.themePreset);
 if(ACCENT_PRESETS.some(item=>item.id===data.accent))result.accent=String(data.accent);
 if(data.customAccentHex===''||typeof data.customAccentHex==='string'&&/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(data.customAccentHex))result.customAccentHex=String(data.customAccentHex);
 return result;
}
export function readAppearance():Partial<AppearancePreferences>{
 if(typeof window==='undefined')return {};
 try{return validate(JSON.parse(localStorage.getItem(key)||'null'));}catch{return {};}
}
export function persistAppearance(value:Partial<AppearancePreferences>){
 if(typeof window==='undefined')return;
 const next={...readAppearance(),...validate(value)},serialized=JSON.stringify(next);
 if(localStorage.getItem(key)===serialized)return;
 localStorage.setItem(key,serialized);
 if(next.themeMode)localStorage.setItem('pimx_public_theme',next.themeMode==='LIGHT'?'light':next.themeMode==='DARK'?'dark':'system');
 window.dispatchEvent(new Event(PREFERENCES_EVENT));
 window.dispatchEvent(new Event('pimx-public-theme'));
}
export function acceptAppearanceLink(){
 const params=new URLSearchParams(location.search),encoded=params.get('appearance'),locale=params.get('uiLocale');
 if(encoded&&encoded.length<1500){try{persistAppearance(validate(JSON.parse(encoded)));}catch{/* Ignore malformed appearance links. */}}
 const light=params.get('accentLight'),dark=params.get('accentDark');
 if(light&&dark&&/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(light)&&/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(dark)){localStorage.setItem('pimx_public_accent',JSON.stringify({light,dark}));window.dispatchEvent(new Event('pimx-appearance'));}
 if(['appearance','uiLocale','accentLight','accentDark'].some(name=>params.has(name))){for(const name of ['appearance','uiLocale','accentLight','accentDark'])params.delete(name);const search=params.toString();history.replaceState(history.state,'',location.pathname+(search?'?'+search:'')+location.hash);}
 return locale==='fa'||locale==='en'?locale:undefined;
}
export function portableAppearance():string{return JSON.stringify(readAppearance());}
