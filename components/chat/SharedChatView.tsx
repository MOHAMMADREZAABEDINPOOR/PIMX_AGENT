'use client';

import { unlockVault } from '@/lib/client/vault';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import {
  Share2,
  GitFork,
  ArrowRight,
  Sparkles,
  Check,
  Send,
  MessageSquare,
  Bot,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageEntity } from '@/lib/types';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export default function SharedChatPage() {
  const $t=useT();
  const params = useParams();
  const router = useRouter();
  const shareId = params?.shareId as string;

  const { createChat, addMessage, setActiveChat, sendMessage } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<{
    id: string;
    title: string;
    messages: MessageEntity[];
    modelId: string;
    systemPrompt?: string;
    toolMode?: any;
    projectName?: string;
    createdAt: number;
  } | null>(null);

  const [inputPrompt, setInputPrompt] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [forking, setForking] = useState(false);

  useEffect(() => {
    if (!shareId) return;

    fetch(`/api/share?id=${shareId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Shared chat not found or has expired.');
        return res.json();
      })
      .then((data) => {
        if (data.snapshot) {
          setSnapshot(data.snapshot);
        } else {
          throw new Error('Invalid snapshot data');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load shared conversation');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shareId]);

  const handleForkAndContinue = async (customPrompt?: string) => {
    if (!snapshot) return;
    setForking(true);

    try {
      const session=await (await fetch('/api/auth/session',{cache:'no-store'})).json();
      if(!session.user){window.location.assign('/login?next='+encodeURIComponent('/share/'+shareId));return;}
      await unlockVault(session.user.id);useAppStore.setState({isHydrated:false});useAppStore.getState().hydrateFromStorage();
      // 1. Create a fresh new chat in the recipient's local workspace
      const newChatTitle = `${snapshot.title} (Forked)`;
      const newChatId = createChat({
        title: newChatTitle,
        modelIds: [snapshot.modelId || 'gemini-2.5-flash'],
        systemPrompt: snapshot.systemPrompt,
        toolMode: snapshot.toolMode || 'NONE',
      });

      // 2. Clone all previous snapshot messages into the recipient's new chat
      snapshot.messages.forEach((msg) => {
        addMessage(newChatId, {
          role: msg.role,
          content: msg.content,
          modelId: msg.modelId,
          state: 'DONE',
          attachments: msg.attachments,
        });
      });

      // 3. Set active chat
      setActiveChat(newChatId);

      // 4. If visitor typed a prompt, send it now in their new chat
      const promptToSend = customPrompt || inputPrompt;
      if (promptToSend.trim()) {
        router.push(`/?c=${newChatId}`);
        setTimeout(() => {
          sendMessage(promptToSend.trim());
        }, 300);
      } else {
        router.push(`/?c=${newChatId}`);
      }
    } catch (e) {
      console.error('Failed to fork conversation:', e);
      setForking(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 text-white p-4">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-neutral-400"><UiText source={"Loading shared conversation..."}/></p>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 text-white p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
          <Share2 className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold mb-2"><UiText source={"Conversation Not Found"}/></h1>
        <p className="text-sm text-neutral-400 max-w-md mb-6">{error || 'This shared link may be invalid or expired.'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer transition-colors"
        >
           <UiText source={"Go to Home"}/> </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Top Banner with Fork / Continue CTA */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border-b border-black/10 dark:border-white/10 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/')}
            title={$t("Go to App")}
            className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0"
          >
             <UiText source={"P"}/> </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold truncate">{snapshot.title}</h1>
              {snapshot.projectName && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-medium">
                  {snapshot.projectName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span><UiText source={"Shared snapshot • Continuing will create a private copy without altering original chat"}/></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium cursor-pointer transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? <UiText source={"Copied"}/> : <UiText source={"Share Link"}/>}</span>
          </button>

          <button
            onClick={() => handleForkAndContinue()}
            disabled={forking}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>{forking ? <UiText source={"Opening copy..."}/> : <UiText source={"Continue this chat"}/>}</span>
          </button>
        </div>
      </header>

      {/* Main Conversation Viewer */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
        {snapshot.messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed border ${
                  isUser
                    ? 'bg-black/[0.04] dark:bg-white/[0.07] border-black/10 dark:border-white/10 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'bg-white dark:bg-neutral-900 border-black/10 dark:border-white/10 shadow-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-black/5 dark:border-white/5 text-[11px] opacity-70">
                    <ProviderLogo modelId={msg.modelId || snapshot.modelId} size="xs" />
                    <span className="font-semibold">{msg.modelId || 'AI Assistant'}</span>
                  </div>
                )}
                {isUser ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating Bottom Composer to Continue */}
      <footer className="sticky bottom-0 z-20 w-full backdrop-blur-md bg-white/90 dark:bg-neutral-950/90 border-t border-black/10 dark:border-white/10 p-4">
        <div className="w-full max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputPrompt.trim()) {
                handleForkAndContinue(inputPrompt.trim());
              }
            }}
            className="relative flex items-center bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-2xl shadow-lg focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all p-1.5"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={$t("Type your response to branch & continue this chat in your workspace...")}
              className="flex-1 bg-transparent px-4 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || forking}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <span>{forking ? <UiText source={"Forking..."}/> : <UiText source={"Send"}/>}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <p className="text-center text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
             <UiText source={"Messages you send will be saved to your personal history. The original author will not see your changes."}/> </p>
        </div>
      </footer>
    </div>
  );
}
