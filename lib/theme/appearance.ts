import {ACCENT_PRESETS,getAccentById} from './accents';
import {getPresetById} from './presets';

type AccentSettings={accent:string;themePreset:string;customAccentHex:string};

export function resolveAccent(settings:AccentSettings,isDark:boolean):string {
 const preset=getPresetById(settings.themePreset),accent=getAccentById(settings.accent);
 // Older theme selections saved the theme ID as an accent and pinned its current mode color.
 const legacyTheme=settings.accent===settings.themePreset&&!ACCENT_PRESETS.some(item=>item.id===settings.accent);
 if(!legacyTheme&&/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(settings.customAccentHex))return settings.customAccentHex;
 if(accent.id==='VIOLET')return isDark?preset.darkAccent||accent.dark:preset.lightAccent||accent.light;
 return isDark?accent.dark:accent.light;
}

export function accentContrast(hex:string):string {
 const digits=hex.slice(1),expanded=digits.length===3?digits.split('').map(char=>char+char).join(''):digits;
 const [r,g,b]=[0,2,4].map(offset=>parseInt(expanded.slice(offset,offset+2),16));
 return (r*299+g*587+b*114)/1000>165?'#09090b':'#ffffff';
}

export function applyAccentTokens(root:HTMLElement,hex:string,isDark:boolean){
 const digits=hex.slice(1),expanded=digits.length===3?digits.split('').map(char=>char+char).join(''):digits;
 const rgb=[0,2,4].map(offset=>parseInt(expanded.slice(offset,offset+2),16)).join(', ');
 const tokens={
  '--accent-color':hex,'--accent-rgb':rgb,'--accent-contrast':accentContrast(hex),
  '--accent-subtle':`rgba(${rgb}, ${isDark?0.18:0.14})`,
  '--accent-border':`rgba(${rgb}, ${isDark?0.42:0.35})`,
  '--accent-ring':`rgba(${rgb}, 0.35)`,
  '--accent-primary':hex,'--accent-primary-rgb':rgb,
  '--accent-glow':`0 0 24px rgba(${rgb}, ${isDark?0.4:0.25})`,
 };
 for(const [name,value] of Object.entries(tokens))root.style.setProperty(name,value);
}
