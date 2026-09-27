'use client';

import { useId } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import type { AppSettings } from '@/lib/types';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { InstallAppCard } from '@/components/layout/PwaManager';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

type Key = keyof AppSettings;
function Choice({ label, name, options }: { label: string; name: Key; options: [string, string][] }) {
  const { settings, updateSettings } = useAppStore();
  return <div className="space-y-2"><div className="text-xs font-medium">{label}</div><CustomSelect value={String(settings[name] ?? '')} onChange={value => updateSettings({ [name]: value })} options={options.map(([value, label]) => ({ value, label }))} /></div>;
}
function Range({ label, name, min, max, step = 1, unit = '' }: { label: string; name: Key; min: number; max: number; step?: number; unit?: string }) {
  const $t=useT();
  const { settings, updateSettings } = useAppStore();
  const id = useId();
  return <div className="space-y-2"><div className="flex items-center justify-between gap-2"><label htmlFor={id} className="text-xs font-medium">{label}</label><span className="text-[10px] tabular-nums text-[var(--accent-color)]">{String(settings[name])}{unit}</span></div><input id={id} aria-label={$t(label)} type="range" min={min} max={max} step={step} value={Number(settings[name] ?? min)} onChange={e => updateSettings({ [name]: Number(e.target.value) })} className="w-full accent-[var(--accent-color)] cursor-pointer" /></div>;
}
function Toggle({ label, description, name }: { label: string; description: string; name: Key }) {
  const $t=useT();
  const { settings, updateSettings } = useAppStore();
  return <div className="flex items-center justify-between gap-4 py-2"><span><span className="block text-xs font-medium">{label}</span><span className="block text-[10px] text-muted leading-5 mt-0.5">{description}</span></span><ToggleSwitch label={$t(label)} checked={Boolean(settings[name])} onChange={value => updateSettings({ [name]: value })} /></div>;
}
export function AdvancedPreferences({ section }: { section: 'prompt' | 'general' | 'agent' }) {
  const $t=useT();
  const { settings, updateSettings, models, accounts } = useAppStore();
  return <section className="rounded-2xl border border-[var(--border-color)] p-4 space-y-4 bg-[var(--bg-color)]">
    <div><h4 className="text-sm font-semibold">{section === 'prompt' ? <UiText source={"Personal defaults & output"}/> : section === 'general' ? <UiText source={"Reading, privacy & mobile app"}/> : <UiText source={"Execution & activity"}/>}</h4><p className="text-[11px] text-muted mt-1"><UiText source={"Changes save automatically and apply to your next response."}/></p></div>
    {section === 'prompt' && <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Choice label={$t("Response language")} name="responseLanguage" options={ [['AUTO', 'Match my message'], ['FA', 'فارسی'], ['EN', 'English']] } />
        <Choice label={$t("Answer length")} name="responseStyle" options={ [['CONCISE', 'Concise'], ['BALANCED', 'Balanced'], ['DETAILED', 'Detailed']] } />
        <Choice label={$t("Writing tone")} name="responseTone" options={ [['NATURAL', 'Natural'], ['PROFESSIONAL', 'Professional'], ['FRIENDLY', 'Friendly']] } />
        <div className="space-y-2"><div className="text-xs font-medium"><UiText source={"Model for new chats"}/></div><CustomSelect value={settings.defaultModelId || ''} onChange={defaultModelId => updateSettings({ defaultModelId })} options={[{ value: '', label: 'Use selected conversation model' }, ...models.filter(m => m.visible && accounts.some(a => a.providerId === m.providerId && a.enabled)).map(m => ({ value: m.id, label: m.displayName }))]} /></div>
        <Range label={$t("Messages kept in model context")} name="contextMessageLimit" min={4} max={100} />
        <Range label={$t("Default slide count")} name="defaultSlideCount" min={3} max={20} />
        <Choice label={$t("Presentation theme")} name="defaultSlideTheme" options={ [['MODERN_DARK', 'Modern dark'], ['CLEAN_LIGHT', 'Clean light'], ['CYBERPUNK', 'Cyberpunk'], ['MINIMAL_PURPLE', 'Minimal purple']] } />
      </div>
      <Toggle label={$t("Include useful examples")} description={$t("Ask for practical examples alongside explanations.")} name="includeExamples" />
      <label className="block space-y-2"><span className="text-xs font-medium"><UiText source={"About you"}/></span><textarea aria-label={$t("About you")} value={settings.userProfileBio || ''} onChange={e => updateSettings({ userProfileBio: e.target.value })} rows={2} placeholder={$t("Your work, experience and interests…")} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-3 text-xs" /></label>
      <label className="block space-y-2"><span className="text-xs font-medium"><UiText source={"How should the assistant respond?"}/></span><textarea aria-label={$t("Response preferences")} value={settings.userResponsePreferences || ''} onChange={e => updateSettings({ userResponsePreferences: e.target.value })} rows={2} placeholder={$t("Preferred format, depth, units and style…")} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-3 text-xs" /></label>
    </>}
    {section === 'general' && <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Range label={$t("Chat line spacing")} name="chatLineHeight" min={1.4} max={2.2} step={0.1} /><Range label={$t("Reasoning text size")} name="reasoningTextSize" min={12} max={18} unit="px" /><Range label={$t("Reasoning panel height")} name="reasoningMaxHeight" min={180} max={600} step={20} unit="px" /></div>
      <Toggle label={$t("Follow new messages")} description={$t("Scroll to the latest response when a new turn arrives.")} name="autoScroll" />
      <Toggle label={$t("Message reactions")} description={$t("Show the 100-emoji picker and one selected reaction per message.")} name="showReactions" />
      <Toggle label={$t("AI reactions")} description={$t("Let your selected model choose a reaction to your message; uses a small extra request.")} name="aiReactions" />
      <Toggle label={$t("PIMX companion")} description={$t("A small animated pet follows real tool activity. Tap it to see your run or start a new chat.")} name="petEnabled" />
      <Toggle label={$t("Message timestamps")} description={$t("Show when each assistant reply was created.")} name="showTimestamps" />
      <Toggle label={$t("Start new chats as temporary")} description={$t("New chats and their generated files stay in this tab until reload.")} name="temporaryByDefault" />
      <InstallAppCard />
    </>}
    {section === 'agent' && <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Choice label={$t("Activity animation")} name="activityStyle" options={ [['IMMERSIVE', 'Immersive'], ['COMPACT', 'Compact']] } /><Range label={$t("Reasoning token budget")} name="reasoningBudget" min={1024} max={16384} step={1024} /><Range label={$t("Maximum web sources")} name="maxWebSources" min={2} max={12} /></div>
      <Toggle label={$t("Automatically detect creation requests")} description={$t("“Build a website” and “make slides” activate the matching workspace.")} name="autoDetectTools" />
      <Toggle label={$t("Show live tool activity")} description={$t("Animate thinking, web browsing, coding, presentations and model collaboration while they run.")} name="showAgentActivity" />
      <Toggle label={$t("Web search by default")} description={$t("Gather live sources before answering; requires internet access.")} name="defaultWebSearch" />
      <Toggle label={$t("Read source pages")} description={$t("Open the leading search results for deeper evidence, beyond snippets.")} name="readWebSources" />
      <Toggle label={$t("Repair invalid generated output")} description={$t("Ask the same model once more when website files or slide data are missing.")} name="repairOutputs" />
      <Toggle label={$t("Open completed workspaces")} description={$t("Show the website preview, deck or research panel when its output is ready.")} name="autoOpenWorkspace" />
      <p className="text-[10px] leading-5 text-muted"><UiText source={"Reasoning summaries and supported budget controls depend on your provider and chosen model."}/></p>
    </>}
  </section>;
}
