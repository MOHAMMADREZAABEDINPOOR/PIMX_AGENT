'use client';
import {useT} from '@/components/i18n/LocaleProvider';

export function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const $t=useT();
  return <button type="button" role="switch" aria-label={$t(label)} aria-checked={checked} onClick={() => onChange(!checked)} className="relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]" style={{ background: checked ? 'var(--accent-color)' : 'var(--switch-off, #b8bbc2)' }}><span className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200" style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} /></button>;
}
