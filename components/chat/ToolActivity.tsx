'use client';

import { useEffect, useState } from 'react';
import { Brain, Globe, Code2, Presentation, Sparkles, Database, BookOpen, Scale, Columns3, Users, Clock, ArrowUpRight, Check } from 'lucide-react';
import type { ChatTool, MessageEntity } from '@/lib/types';
import { useAppStore } from '@/lib/store/useAppStore';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

const MODES: Partial<Record<ChatTool, { icon: typeof Brain; title: string; fa: string; color: string; motif: string }>> = {
  THINK: { icon: Brain, title: 'Connecting the ideas', fa: 'در حال بررسی و پیوند ایده‌ها', color: '#a78bfa', motif: 'neural' },
  WEB_SEARCH: { icon: Globe, title: 'Searching the live web', fa: 'در حال جستجو در وب', color: '#38bdf8', motif: 'radar' },
  WEB_DEV: { icon: Code2, title: 'Building your website', fa: 'در حال نوشتن فایل‌های سایت', color: '#22d3ee', motif: 'code' },
  SLIDES: { icon: Presentation, title: 'Creating your presentation', fa: 'در حال ساخت ارائهٔ شما', color: '#f472b6', motif: 'slides' },
  DEEP_RESEARCH: { icon: Sparkles, title: 'Researching and connecting evidence', fa: 'در حال پژوهش و ترکیب شواهد', color: '#c084fc', motif: 'radar' },
  SOURCE_QA: { icon: Database, title: 'Finding evidence in your documents', fa: 'در حال بررسی اسناد و شواهد', color: '#34d399', motif: 'sources' },
  LEARN: { icon: BookOpen, title: 'Preparing a lesson for you', fa: 'در حال آماده‌سازی درس و مثال‌ها', color: '#fb7185', motif: 'sources' },
  DEBATE: { icon: Scale, title: 'Testing opposing arguments', fa: 'در حال سنجش دیدگاه‌های مخالف', color: '#fb923c', motif: 'council' },
  COMPARE: { icon: Columns3, title: 'Generating independent model answers', fa: 'در حال اجرای پاسخ‌های مستقل مدل‌ها', color: '#818cf8', motif: 'council' },
  COUNCIL: { icon: Users, title: 'Models working toward a shared answer', fa: 'مدل‌ها در حال ساخت پاسخ مشترک', color: '#fbbf24', motif: 'council' },
};

export function ToolActivity({ message, modeOverride }: { message: MessageEntity; modeOverride?: ChatTool }) {
  const $t=useT();
  const settings = useAppStore(s => s.settings);
  const chat = useAppStore(s => s.chats.find(c => c.id === message.chatId));
  const prompt = useAppStore(s => s.messages[message.chatId]?.find(m => m.id === message.parentId)?.content || '');
  const [elapsed, setElapsed] = useState(0);
  const live = message.state === 'STREAMING' || message.state === 'PENDING';
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setElapsed(Math.max(0, (Date.now() - message.createdAt) / 1000)), 500);
    return () => clearInterval(timer);
  }, [live, message.createdAt]);
  if (!live || settings.showAgentActivity === false) return null;
  const step = message.toolSteps?.findLast(s => s.status === 'CALLING');
  const mode = step?.toolName === 'agent_plan' ? 'THINK' : step?.toolName === 'web_search' || step?.toolName === 'agent_read' ? 'WEB_SEARCH' : modeOverride || (chat?.toolMode !== 'NONE' ? chat?.toolMode : chat?.activeTools?.find(t => MODES[t])) || 'THINK';
  const selected = new Set([...(chat?.activeTools || []), ...(chat?.toolMode && chat.toolMode !== 'NONE' ? [chat.toolMode] : [])]);
  if (message.toolSteps?.some(s => s.toolName === 'agent_plan' && s.input?.modelId)) selected.add('THINK');
  if (message.toolSteps?.some(s => s.toolName === 'web_search')) selected.add('WEB_SEARCH');
  const queue = [...selected].filter(t => MODES[t]).sort((a, b) => (a === 'THINK' ? -2 : a === 'WEB_SEARCH' ? -1 : 0) - (b === 'THINK' ? -2 : b === 'WEB_SEARCH' ? -1 : 0));
  const meta = MODES[mode] || MODES.THINK!;
  const Icon = meta.icon;
  const fa = /[\u0600-\u06FF]/.test(prompt + (message.reasoning || ''));
  const compact = settings.activityStyle === 'COMPACT';
  const writing = !step && (mode === 'WEB_SEARCH' || mode === 'THINK') && message.toolSteps?.some(s => s.toolName === 'web_search' && s.status === 'DONE');
  const detail = step?.toolName === 'agent_read' ? (fa ? 'خواندن منابع انتخاب‌شده' : 'Reading selected sources')
    : step?.toolName === 'slide_images' ? (fa ? 'انتخاب عکس‌های مرتبط با هر اسلاید' : 'Selecting photos that match each slide')
    : step?.toolName === 'web_search' ? String(step.input?.query || '').slice(0, 90)
    : message.content ? (fa ? 'خروجی در حال دریافت است' : 'Receiving the generated output')
    : (fa ? 'در انتظار پاسخ مدل انتخاب‌شده' : 'Waiting for the selected model');
  return (
    <div className="tool-run" dir={fa ? 'rtl' : 'ltr'}>
    {queue.length > 1 && <div className="tool-run-queue" aria-label={$t("Enabled tool sequence")}>{queue.map(tool => {
      const info = MODES[tool]!; const ToolIcon = info.icon;
      const finished = tool === 'THINK' ? message.toolSteps?.some(s => s.toolName === 'agent_plan' && s.status === 'DONE') : tool === 'WEB_SEARCH' ? step?.toolName !== 'web_search' && step?.toolName !== 'agent_read' && message.toolSteps?.some(s => s.toolName === 'web_search' && s.status === 'DONE') : false;
      const failed = tool === 'THINK' && message.toolSteps?.some(s => s.toolName === 'agent_plan' && s.input?.modelId && s.status === 'FAILED');
      const status = finished ? 'done' : failed ? 'failed' : tool === mode && !writing ? 'running' : 'queued';
      return <span key={tool} data-tool={tool} data-status={status} data-motif={info.motif} className="tool-run-chip" style={{ '--activity-color': info.color } as React.CSSProperties}>{finished ? <Check size={12} /> : <ToolIcon size={12} />}<span>{tool.replaceAll('_', ' ')}</span><i /></span>;
    })}</div>}
    <div className={`tool-activity ${compact ? 'is-compact' : ''}`} data-mode={mode} data-phase={step?.toolName || 'response'} data-motif={meta.motif} style={{ '--activity-color': meta.color } as React.CSSProperties}>
      <div className="activity-visual" aria-hidden="true">
        <div className="activity-ring ring-one" /><div className="activity-ring ring-two" />
        <div className="activity-core"><Icon size={compact ? 20 : 25} strokeWidth={1.6} /></div>
        {[0, 1, 2].map(i => <span key={i} className="activity-satellite" style={{ '--i': i } as React.CSSProperties}><i /><i /><i /></span>)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1.5"><span className="activity-eyebrow"><span className="activity-dot" />{mode.replaceAll('_', ' ')}</span><span className="flex items-center gap-1 text-[10px] tabular-nums text-muted" dir="ltr"><Clock size={11} />{elapsed.toFixed(1)}<UiText source={"s"}/></span></div>
        <p className="text-[13px] sm:text-sm font-semibold" role="status">{writing ? (fa ? 'در حال نوشتن پاسخ بر پایهٔ منابع' : 'Writing your answer from the evidence') : fa ? meta.fa : meta.title}</p>
        <p className="text-[11px] mt-1 text-muted truncate" dir="auto">{detail}</p>
        {!compact && <div className="activity-signal mt-3"><span /><span /><span /><span /><span /><ArrowUpRight size={12} /></div>}
      </div>
    </div>
    </div>
  );
}
