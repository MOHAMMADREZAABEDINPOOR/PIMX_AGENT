'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { X, MessageSquarePlus, Settings2 } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { UiText, useT, useLocale } from '@/components/i18n/LocaleProvider';
import { paintGait, petBounds, petMood, PET_SIZE, type Point } from '@/lib/companion/behavior';
import { PipAvatar } from './PipAvatar';

const subscribeMotion = (callback: () => void) => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};

export function PimxPet() {
  const $t = useT(), fa = useLocale() === 'fa', id = useId().replace(/:/g, '');
  const { settings, isGenerating, generatingChatId, activeChatId, messages, activeToolPanel,
    lastCompletedAt, createChat, setSettingsOpen, updateSettings } = useAppStore();
  const reduced = useSyncExternalStore(subscribeMotion, () => matchMedia('(prefers-reduced-motion: reduce)').matches, () => true) || settings.reduceMotion;
  const [open, setOpen] = useState(false), [patted, setPatted] = useState(false);
  const [celebrating, setCelebrating] = useState(false), [sleepy, setSleepy] = useState(false);
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false), [walking, setWalking] = useState(false);
  const [hidden, setHidden] = useState(false), [dialogOrigin, setDialogOrigin] = useState<Point>({ x: 16, y: 400 });
  const [parentWidth, setParentWidth] = useState(390);
  const wrapper = useRef<HTMLDivElement>(null), body = useRef<HTMLButtonElement>(null), avatar = useRef<SVGSVGElement>(null);
  const position = useRef<Point>({ x: 16, y: 0 }), facing = useRef(1), distance = useRef(0);
  const initialized = useRef(false), lastInteraction = useRef(0);
  const drag = useRef<{ start: Point; origin: Point; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const enabled = settings.petEnabled !== false && activeToolPanel === 'NONE';
  const message = (messages[generatingChatId || activeChatId || ''] || []).findLast(item => item.role === 'assistant');
  const mood = petMood(isGenerating, message, celebrating || patted, sleepy);

  function place(point: Point) {
    const parent = wrapper.current?.parentElement;
    const next = petBounds(point, parent?.clientWidth || 390, parent?.clientHeight || 600);
    position.current = next;
    wrapper.current?.style.setProperty('--pet-x', `${next.x}px`);
    wrapper.current?.style.setProperty('--pet-y', `${next.y}px`);
    return next;
  }
  function look(direction: number) {
    facing.current = direction;
    wrapper.current?.style.setProperty('--pet-facing', String(direction));
  }
  function wake() { lastInteraction.current = performance.now(); setSleepy(false); }

  useEffect(() => {
    if (!enabled || !wrapper.current?.parentElement) return;
    const parent = wrapper.current.parentElement;
    const resize = () => {
      place(initialized.current ? position.current : { x: 16, y: parent.clientHeight - 174 });
      initialized.current = true;
      setParentWidth(parent.clientWidth);
      setDialogOrigin({ ...position.current });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    lastInteraction.current = performance.now();
    const activity = () => { lastInteraction.current = performance.now(); setSleepy(false); };
    window.addEventListener('pointerdown', activity, { passive: true });
    window.addEventListener('keydown', activity);
    const timer = setInterval(() => setSleepy(!document.hidden && !isGenerating && performance.now() - lastInteraction.current > 45000), 2000);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pointerdown', activity);
      window.removeEventListener('keydown', activity);
      clearInterval(timer);
    };
  }, [enabled, isGenerating]);

  useEffect(() => {
    if (!lastCompletedAt || Date.now() - lastCompletedAt > 4000) return;
    const begin = setTimeout(() => setCelebrating(true), 0);
    const timer = setTimeout(() => setCelebrating(false), 2600);
    return () => { clearTimeout(begin); clearTimeout(timer); };
  }, [lastCompletedAt]);
  useEffect(() => {
    if (!patted) return;
    const timer = setTimeout(() => setPatted(false), 1500);
    return () => clearTimeout(timer);
  }, [patted]);

  // Paw phase derives from distance, so stopping never leaves a walk loop running.
  useEffect(() => {
    const paused = !enabled || reduced || hidden || hovered || focused || open || dragging || mood !== 'idle';
    if (paused) {
      paintGait(avatar.current, 0, false);
      const reset = setTimeout(() => setWalking(false), 0);
      return () => clearTimeout(reset);
    }
    let frame = 0, previous = 0, velocity = 0, target = position.current.x;
    let nextWalk = performance.now() + 1500, moving = false;
    const tick = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, 0.04) : 0;
      previous = now;
      if (!moving && now >= nextWalk) {
        const parentWidth = wrapper.current?.parentElement?.clientWidth || 390;
        const right = parentWidth - PET_SIZE - 12;
        const direction = position.current.x < 70 ? 1 : position.current.x > right - 70 ? -1 : -facing.current;
        target = petBounds({ x: position.current.x + direction * (80 + Math.random() * 70), y: position.current.y }, parentWidth, wrapper.current?.parentElement?.clientHeight || 600).x;
        look(direction);
        moving = Math.abs(target - position.current.x) > 2;
        setWalking(moving);
      }
      if (moving) {
        const gap = target - position.current.x;
        const desired = Math.sign(gap) * Math.min(46, Math.sqrt(Math.abs(gap) * 130));
        velocity += (desired - velocity) * Math.min(1, dt * 8);
        const travel = Math.sign(gap) * Math.min(Math.abs(gap), Math.abs(velocity * dt));
        place({ x: position.current.x + travel, y: position.current.y });
        distance.current += Math.abs(travel);
        paintGait(avatar.current, distance.current, true);
        if (Math.abs(gap) < 0.7) {
          moving = false; velocity = 0; setWalking(false);
          paintGait(avatar.current, 0, false);
          nextWalk = now + 3500 + Math.random() * 2500;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, reduced, hidden, hovered, focused, open, dragging, mood]);

  useEffect(() => {
    if (!enabled || reduced || hidden) return;
    const follow = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const bounds = body.current?.getBoundingClientRect();
      if (!bounds) return;
      body.current?.style.setProperty('--eye-x', `${Math.max(-2, Math.min(2, (event.clientX - bounds.x - bounds.width / 2) / 100)) * facing.current}px`);
      body.current?.style.setProperty('--eye-y', `${Math.max(-1.5, Math.min(1.5, (event.clientY - bounds.y - bounds.height / 2) / 150))}px`);
    };
    window.addEventListener('pointermove', follow, { passive: true });
    return () => window.removeEventListener('pointermove', follow);
  }, [enabled, reduced, hidden]);

  const copy = (en: string, persian: string) => fa ? persian : en;
  const labels = {
    idle: copy('Ready when you are.', 'هر وقت آماده باشی، اینجام.'),
    think: copy('Your model is working through the plan.', 'مدلت داره برنامهٔ حل مسئله رو بررسی می‌کنه.'),
    search: copy('Reading sources and following the evidence.', 'در حال جست‌وجو و مطالعهٔ منابع.'),
    work: copy('Your model is working on your request.', 'مدلت داره روی درخواستت کار می‌کنه.'),
    happy: celebrating ? copy('The response is ready. Take a look!', 'پاسخ آماده‌ست؛ بیا نگاه کنیم!') : copy('A little encouragement goes a long way.', 'یه نوازش کوچیک، یه عالمه انرژی!'),
    error: copy('That request hit a problem. Check the message and try again.', 'درخواست به مشکل خورد؛ پیام خطا رو بررسی کن و دوباره امتحان کن.'),
    sleep: copy('Resting until your next idea.', 'تا ایدهٔ بعدیت یه کم استراحت می‌کنم.'),
  };
  if (!enabled) return null;
  const dialogLeft = Math.max(8, Math.min(dialogOrigin.x, parentWidth - 280)) - dialogOrigin.x;
  return <div ref={wrapper} className="pimx-pet" data-mood={mood} data-motion={dragging ? 'dragging' : walking ? 'walking' : 'resting'} data-paused={reduced || hidden}
    onPointerEnter={() => { setHovered(true); wake(); }} onPointerLeave={() => setHovered(false)}
    onFocus={() => setFocused(body.current?.matches(':focus-visible') ?? false)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); body.current?.focus(); } }}>
    {open && <div role="dialog" aria-label={copy('Pip companion', 'همراه پیپ')} className="pet-dialog rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-3 shadow-xl text-[var(--text-color)]" style={{ left: dialogLeft, bottom: dialogOrigin.y > 230 ? PET_SIZE + 6 : 'auto', top: dialogOrigin.y > 230 ? 'auto' : PET_SIZE + 6 }}>
      <div className="flex items-center justify-between gap-4"><strong className="text-xs"><UiText source="Pip · PIMX companion"/></strong><button aria-label={$t('Close companion')} onClick={() => setOpen(false)} className="p-1"><X size={14}/></button></div>
      <p className="text-xs leading-6 text-muted my-2" role="status">{labels[mood]}</p>
      <small className="block text-muted text-[10px] mb-3">{copy('Drag to move. Arrow keys work too.', 'بگیر و جابه‌جام کن؛ کلیدهای جهت هم کار می‌کنن.')}</small>
      <div className="flex gap-2"><button aria-label={$t('Start a chat with Pip')} disabled={isGenerating} onClick={() => { createChat(); setOpen(false); }} className="rounded-lg p-2 bg-accent disabled:opacity-40"><MessageSquarePlus size={16}/></button><button aria-label={$t('Companion settings')} onClick={() => { setSettingsOpen(true, 'General'); setOpen(false); }} className="rounded-lg p-2 border border-[var(--border-color)]"><Settings2 size={16}/></button><button onClick={() => updateSettings({ petEnabled: false })} className="text-[10px] text-muted ms-auto"><UiText source="Hide pet"/></button></div>
    </div>}
    <button ref={body} aria-label={$t('PIMX companion Pip')} aria-expanded={open} aria-haspopup="dialog" title={copy('Pip · drag to move', 'پیپ؛ برای جابه‌جایی بگیر و بکش')} className="pet-body focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]"
      onPointerDown={event => {
        if (event.button !== 0) return;
        wake(); drag.current = { start: { x: event.clientX, y: event.clientY }, origin: { ...position.current }, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.start.x, dy = event.clientY - drag.current.start.y;
        if (Math.hypot(dx, dy) > 5) { drag.current.moved = true; setDragging(true); }
        if (drag.current.moved) { place({ x: drag.current.origin.x + dx, y: drag.current.origin.y + dy }); look(dx < 0 ? -1 : 1); }
      }}
      onPointerUp={event => {
        suppressClick.current = !!drag.current?.moved; drag.current = null; setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { drag.current = null; setDragging(false); suppressClick.current = true; }}
      onLostPointerCapture={() => { if (drag.current) { suppressClick.current = drag.current.moved; drag.current = null; setDragging(false); } }}
      onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } wake(); setDialogOrigin({ ...position.current }); setOpen(value => !value); setPatted(true); }}
      onKeyDown={event => {
        const moves: Record<string, Point> = { ArrowLeft: { x: -24, y: 0 }, ArrowRight: { x: 24, y: 0 }, ArrowUp: { x: 0, y: -24 }, ArrowDown: { x: 0, y: 24 } };
        const delta = moves[event.key];
        if (delta) { event.preventDefault(); wake(); const next = place({ x: position.current.x + delta.x, y: position.current.y + delta.y }); setDialogOrigin(next); if (delta.x) look(Math.sign(delta.x)); }
      }}>
      <PipAvatar id={`pip-${id}`} ref={avatar}/><span className="pet-status" aria-hidden="true"/>
    </button>
  </div>;
}
