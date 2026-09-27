'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  PanelRightClose,
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  HelpCircle,
  Sparkles,
  Award,
  RotateCcw,
  Edit2,
  Check,
  Layers,
  FileText,
} from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export function LearnPanel({ onClose }: { onClose: () => void }) {
  const $t=useT();
  const { activeChatId, chats, learningSessions, updateLearningSession, sendMessage } = useAppStore();
  const currentChat = chats.find((c) => c.id === activeChatId);

  // Derive initial topic from chat title or default
  const defaultTopic =
    currentChat?.title &&
    currentChat.title !== 'New Conversation' &&
    currentChat.title !== 'Incognito Chat'
      ? currentChat.title
      : 'Modern Computer Science & AI Architecture';

  const session = (activeChatId && learningSessions[activeChatId]) || {
    id: `learn_${activeChatId || 'default'}`,
    chatId: activeChatId || 'default',
    topic: defaultTopic,
    mode: 'SIMPLE',
    completedLessons: 0,
    totalLessons: 6,
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const [topicInput, setTopicInput] = useState(session.topic);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [activeTab, setActiveTab] = useState<'ROADMAP' | 'FLASHCARDS' | 'NOTES'>('ROADMAP');
  const [notesText, setNotesText] = useState(session.notes || '');

  // Synchronize topic when chat switches
  useEffect(() => {
    if (activeChatId && currentChat?.title && session.topic === 'Modern Computer Science & AI Architecture') {
      if (
        currentChat.title !== 'New Conversation' &&
        currentChat.title !== 'Incognito Chat'
      ) {
        setTopicInput(currentChat.title);
        updateLearningSession(activeChatId, { topic: currentChat.title });
      }
    }
  }, [activeChatId, currentChat?.title]);

  // Lessons roadmap adapted dynamically based on topic
  const lessons = ('lessons' in session ? session.lessons : undefined) || [
    { num: 1, title: 'Core Foundations & Mental Models', completed: false },
    { num: 2, title: 'Key Architecture & Principles', completed: false },
    { num: 3, title: 'Deep-Dive: Mechanisms & Under the Hood', completed: false },
    { num: 4, title: 'Real-World Worked Examples & Case Studies', completed: false },
    { num: 5, title: 'Common Pitfalls, Antipatterns & Solutions', completed: false },
    { num: 6, title: 'Mastery Synthesis & Capstone Challenge', completed: false },
  ];
  const flashcards = ('flashcards' in session ? session.flashcards : undefined) || [];
  const [revealedCard, setRevealedCard] = useState<number | null>(null);

  const completedCount = lessons.filter((l) => l.completed).length;

  const toggleLesson = (num: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = lessons.map((l) => (l.num === num ? { ...l, completed: !l.completed } : l));
    if (activeChatId) {
      updateLearningSession(activeChatId, {
        completedLessons: updated.filter((l) => l.completed).length,
        lessons: updated,
      });
    }
  };

  const handleSaveTopic = () => {
    setIsEditingTopic(false);
    if (activeChatId && topicInput.trim()) {
      updateLearningSession(activeChatId, { topic: topicInput.trim() });
    }
  };

  const handleGenerateRoadmap = () => {
    sendMessage(
      `[SOCRATIC TUTOR: Generate Custom Learning Roadmap]
Topic: "${topicInput.trim() || session.topic}"

Please act as a Master Professor and construct a tailored, rigorous 6-step curriculum roadmap for this subject.
For each step provide:
1. Concise Module Title
2. Core Intellectual Question
3. What makes this concept essential to master
End with an invitation to begin Lesson 1. Also output a fenced learning-roadmap JSON array of objects with title fields for the six modules.`
    );
  };

  const handleStartLesson = (lesson: any) => {
    sendMessage(
      `[SOCRATIC TUTOR: Begin Lesson ${lesson.num}]
Topic: "${topicInput.trim() || session.topic}"
Lesson: "${lesson.title}"

Please provide:
1. **The Core Intuition**: A vivid, memorable analogy breaking down this concept simply.
2. **Technical Deep-Dive**: How it works under the hood with key principles and diagram/code if applicable.
3. **Real-World Impact**: Concrete practical scenario.
4. **Comprehension Check**: 2 Socratic checkpoint questions to verify understanding.`
    );
  };

  const handleStartQuiz = () => {
    sendMessage(
      `[SOCRATIC TUTOR: Interactive Comprehension Quiz]
Topic: "${topicInput.trim() || session.topic}"

Generate a 4-question interactive quiz covering key concepts.
Present Question 1 first with 4 choices (A, B, C, D) and wait for my response before evaluating and proceeding.`
    );
  };

  const handleSaveNotes = () => {
    if (activeChatId) {
      updateLearningSession(activeChatId, { notes: notesText });
    }
  };

  return (
    <div
      id="learn-panel"
      className="h-full flex flex-col border-l border-[var(--border-color)] bg-[var(--surface-color)] text-neutral-900 dark:text-neutral-100"
    >
      {/* Top Header */}
      <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-semibold text-xs truncate"><UiText source={"Interactive Learning Studio"}/></span>
        </div>
        <button
          onClick={onClose}
          title={$t("Minimize Panel")}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer text-amber-600 dark:text-amber-400"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[var(--border-color)] text-xs font-semibold px-2 bg-black/[0.02] dark:bg-white/[0.02]">
        <button
          onClick={() => setActiveTab('ROADMAP')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'ROADMAP'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span><UiText source={"Curriculum"}/></span>
        </button>
        <button
          onClick={() => setActiveTab('FLASHCARDS')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'FLASHCARDS'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span><UiText source={"Recall Cards"}/></span>
        </button>
        <button
          onClick={() => setActiveTab('NOTES')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'NOTES'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span><UiText source={"Notes"}/></span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Active Subject Card */}
        <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Award className="w-3 h-3" />  <UiText source={"Active Track"}/> </span>
            <button
              onClick={() => {
                if (isEditingTopic) handleSaveTopic();
                else setIsEditingTopic(true);
              }}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
              title={$t(isEditingTopic ? 'Save topic' : 'Edit topic')}
            >
              {isEditingTopic ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Edit2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isEditingTopic ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTopic()}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-amber-500/50 bg-[var(--surface-color)] text-xs font-semibold focus:outline-none"
                placeholder={$t("Enter learning topic...")}
                autoFocus
              />
              <button
                onClick={handleSaveTopic}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-semibold cursor-pointer"
              >
                 <UiText source={"Save"}/> </button>
            </div>
          ) : (
            <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
              {topicInput || session.topic}
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span><UiText source={"Progress"}/></span>
              <span>
                {completedCount}  <UiText source={"of"}/> {lessons.length}  <UiText source={"Modules Done ("}/>{Math.round((completedCount / lessons.length) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / lessons.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ROADMAP TAB */}
        {activeTab === 'ROADMAP' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
                 <UiText source={"Syllabus & Lesson Modules"}/> </span>
              <button
                onClick={handleGenerateRoadmap}
                className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span><UiText source={"AI Custom Roadmap"}/></span>
              </button>
            </div>

            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div
                  key={lesson.num}
                  onClick={() => handleStartLesson(lesson)}
                  className="group p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => toggleLesson(lesson.num, e)}
                      title={$t(lesson.completed ? 'Mark uncompleted' : 'Mark completed')}
                      className="cursor-pointer hover:scale-110 transition-transform shrink-0"
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-neutral-400 hover:text-amber-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                        {lesson.num}. {lesson.title}
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        {lesson.completed ? <UiText source={"Completed"}/> : <UiText source={"Click to start interactive masterclass"}/>}
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              ))}
            </div>

            {/* Socratic Quiz Action */}
            <button
              onClick={handleStartQuiz}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
            >
              <HelpCircle className="w-4 h-4" />
              <span><UiText source={"Launch Interactive Quiz Challenge"}/></span>
            </button>
          </div>
        )}

        {/* FLASHCARDS TAB */}
        {activeTab === 'FLASHCARDS' && (
          <div className="space-y-3">
            <div className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">
               <UiText source={"Active recall flashcards stimulate memory retention. Click card to reveal core insights."}/> </div>

            {flashcards.length === 0 ? <p className="p-4 rounded-2xl border border-[var(--border-color)] text-muted"><UiText source={"Generate recall cards for your topic to begin."}/></p> : flashcards.map((card, index) => <button type="button" key={index} onClick={() => setRevealedCard(revealedCard === index ? null : index)} aria-expanded={revealedCard === index} className="w-full p-4 text-start rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2"><span className="block font-semibold">{card.question}</span><span className="block text-muted leading-6">{revealedCard === index ? card.answer : <UiText source={"Tap to reveal the answer"}/>}</span></button>)}

            <button
              onClick={() =>
                sendMessage(
                  `[SOCRATIC TUTOR: Generate 5 Concept Flashcards]
Topic: "${topicInput.trim() || session.topic}"
Please generate 5 high-yield conceptual flashcards. Output a fenced flashcards JSON array with question and answer fields. Make each answer specific to the topic.`
                )
              }
              className="w-full py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span><UiText source={"Generate New Flashcards with AI"}/></span>
            </button>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'NOTES' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs"><UiText source={"Personal Study Notes"}/></span>
              <button
                onClick={handleSaveNotes}
                className="px-2 py-1 rounded bg-amber-500 text-neutral-950 font-bold text-[10px] cursor-pointer"
              >
                 <UiText source={"Save Notes"}/> </button>
            </div>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] text-xs leading-relaxed focus:border-amber-500 focus:outline-none resize-none font-mono"
              placeholder={$t("Record key equations, takeaway insights, or questions to revisit...")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
