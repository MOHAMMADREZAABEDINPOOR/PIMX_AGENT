'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  X,
  Brain,
  Bot,
  FolderKanban,
  Database,
  Plus,
  Trash2,
  Edit2,
  Check,
  Tag,
  Pin,
  Sparkles,
  Search,
  Sliders,
  Flame,
  Cpu,
  Globe,
  MessageSquarePlus,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  Layers,
  Zap,
} from 'lucide-react';
import { PersonaEntity, PersonaCategory, PersonaResponseStyle, MemoryEntity, KnowledgeBaseEntity } from '@/lib/types';
import { CustomSelect } from '@/components/ui/CustomSelect';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

const CATEGORIES: { key: PersonaCategory | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All Assistants' },
  { key: 'GENERAL', label: 'General' },
  { key: 'CODING', label: 'Coding' },
  { key: 'WRITING', label: 'Writing' },
  { key: 'ANALYSIS', label: 'Analysis' },
  { key: 'PRODUCTIVITY', label: 'Productivity' },
  { key: 'ACADEMIC', label: 'Academic' },
];

const MEMORY_CATEGORIES: { key: MemoryEntity['category'] | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All Facts' },
  { key: 'PREFERENCE', label: 'Preferences' },
  { key: 'FACT', label: 'Facts' },
  { key: 'BACKGROUND', label: 'Background & Bio' },
  { key: 'INSTRUCTION', label: 'Instructions' },
  { key: 'PROJECT', label: 'Project Context' },
];

export function WorkspaceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const $t=useT();
  const {
    settings,
    updateSettings,
    models,
    memories,
    addMemory,
    removeMemory,
    updateMemory,
    togglePinMemory,
    personas,
    addPersona,
    updatePersona,
    deletePersona,
    projects,
    addProject,
    deleteProject,
    setProjectModalOpen,
    knowledgeBases,
    addKnowledgeBase,
    deleteKnowledgeBase,
    sources,
    addSource,
    chats,
    activeChatId,
    createChat,
    updateChat,
    setActiveChat,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'PERSONAS' | 'MEMORY' | 'PROJECTS' | 'KNOWLEDGE'>('PERSONAS');

  // Persona filters & search
  const [personaSearch, setPersonaSearch] = useState('');
  const [personaCategory, setPersonaCategory] = useState<PersonaCategory | 'ALL'>('ALL');
  const [showPersonaForm, setShowPersonaForm] = useState(false);
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);

  // Persona form fields
  const [pName, setPName] = useState('');
  const [pSymbol, setPSymbol] = useState('🤖');
  const [pDescription, setPDescription] = useState('');
  const [pCategory, setPCategory] = useState<PersonaCategory>('GENERAL');
  const [pResponseStyle, setPResponseStyle] = useState<PersonaResponseStyle>('DEFAULT');
  const [pModelId, setPModelId] = useState<string>('');
  const [pTemperature, setPTemperature] = useState<number>(0.7);
  const [pTopP, setPTopP] = useState<number>(1.0);
  const [pMaxTokens, setPMaxTokens] = useState<number>(4096);
  const [pReasoningEffort, setPReasoningEffort] = useState<'OFF' | 'LOW' | 'MEDIUM' | 'HIGH'>('OFF');
  const [pDefaultWebSearch, setPDefaultWebSearch] = useState<boolean>(false);
  const [pInstructions, setPInstructions] = useState('');

  // Memory states
  const [memSearch, setMemSearch] = useState('');
  const [memCategoryFilter, setMemCategoryFilter] = useState<MemoryEntity['category'] | 'ALL'>('ALL');
  const [newMemory, setNewMemory] = useState('');
  const [newMemCat, setNewMemCat] = useState<MemoryEntity['category']>('FACT');
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingMemoryContent, setEditingMemoryContent] = useState('');

  // Project states
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjInst, setNewProjInst] = useState('');

  // Knowledge base states
  const [newKbName, setNewKbName] = useState('');
  const [newKbDesc, setNewKbDesc] = useState('');
  const [selectedKbForUpload, setSelectedKbForUpload] = useState<string | null>(null);
  const [kbDocTitle, setKbDocTitle] = useState('');
  const [kbDocContent, setKbDocContent] = useState('');

  const currentChat = chats.find((c) => c.id === activeChatId);
  const activePersona = personas.find((p) => p.id === currentChat?.personaId);

  // Reset or initialize persona form
  const handleOpenCreatePersona = () => {
    setEditingPersonaId(null);
    setPName('');
    setPSymbol('🤖');
    setPDescription('');
    setPCategory('GENERAL');
    setPResponseStyle('DEFAULT');
    setPModelId('');
    setPTemperature(0.7);
    setPTopP(1.0);
    setPMaxTokens(4096);
    setPReasoningEffort('OFF');
    setPDefaultWebSearch(false);
    setPInstructions('');
    setShowPersonaForm(true);
  };

  const handleEditPersona = (p: PersonaEntity) => {
    setEditingPersonaId(p.id);
    setPName(p.name);
    setPSymbol(p.symbol || '🤖');
    setPDescription(p.description || '');
    setPCategory(p.category || 'GENERAL');
    setPResponseStyle(p.responseStyle || 'DEFAULT');
    setPModelId(p.modelId || '');
    setPTemperature(p.temperature ?? 0.7);
    setPTopP(p.topP ?? 1.0);
    setPMaxTokens(p.maxTokens ?? 4096);
    setPReasoningEffort(p.reasoningEffort || 'OFF');
    setPDefaultWebSearch(!!p.defaultWebSearch);
    setPInstructions(p.instructions || '');
    setShowPersonaForm(true);
  };

  const handleSavePersona = () => {
    if (!pName.trim() || !pInstructions.trim()) return;

    if (editingPersonaId) {
      updatePersona(editingPersonaId, {
        name: pName.trim(),
        symbol: pSymbol.trim() || '🤖',
        description: pDescription.trim(),
        category: pCategory,
        responseStyle: pResponseStyle,
        modelId: pModelId || undefined,
        temperature: pTemperature,
        topP: pTopP,
        maxTokens: pMaxTokens,
        reasoningEffort: pReasoningEffort,
        defaultWebSearch: pDefaultWebSearch,
        instructions: pInstructions.trim(),
      });

      // If active chat currently uses this persona, sync parameters directly
      if (currentChat && currentChat.personaId === editingPersonaId) {
        updateChat(currentChat.id, {
          systemPrompt: pInstructions.trim(),
          temperature: pTemperature,
          topP: pTopP,
          maxTokens: pMaxTokens,
          modelIds: pModelId ? [pModelId] : currentChat.modelIds,
          webSearchEnabled: pDefaultWebSearch ? true : currentChat.webSearchEnabled,
        });
      }
    } else {
      addPersona({
        name: pName.trim(),
        symbol: pSymbol.trim() || '🤖',
        description: pDescription.trim(),
        category: pCategory,
        responseStyle: pResponseStyle,
        modelId: pModelId || undefined,
        temperature: pTemperature,
        topP: pTopP,
        maxTokens: pMaxTokens,
        reasoningEffort: pReasoningEffort,
        defaultWebSearch: pDefaultWebSearch,
        instructions: pInstructions.trim(),
        builtIn: false,
      });
    }

    setShowPersonaForm(false);
    setEditingPersonaId(null);
  };

  // ACTIVATE PERSONA FOR CURRENT CHAT
  const handleActivatePersona = (p: PersonaEntity) => {
    if (!currentChat) {
      const newId = createChat({
        title: `${p.name} Session`,
        systemPrompt: p.instructions,
        modelIds: pModelId ? [pModelId] : undefined,
      });
      updateChat(newId, {
        personaId: p.id,
        temperature: p.temperature,
        topP: p.topP,
        maxTokens: p.maxTokens,
        webSearchEnabled: p.defaultWebSearch,
      });
    } else {
      updateChat(currentChat.id, {
        personaId: p.id,
        systemPrompt: p.instructions,
        temperature: p.temperature,
        topP: p.topP,
        maxTokens: p.maxTokens,
        modelIds: p.modelId ? [p.modelId] : currentChat.modelIds,
        webSearchEnabled: p.defaultWebSearch ? true : currentChat.webSearchEnabled,
      });
    }
    onClose();
  };

  // START NEW CHAT WITH PERSONA
  const handleStartNewChatWithPersona = (p: PersonaEntity) => {
    const newId = createChat({
      title: `${p.name} Session`,
      systemPrompt: p.instructions,
      modelIds: p.modelId ? [p.modelId] : undefined,
    });
    updateChat(newId, {
      personaId: p.id,
      temperature: p.temperature,
      topP: p.topP,
      maxTokens: p.maxTokens,
      webSearchEnabled: p.defaultWebSearch,
    });
    setActiveChat(newId);
    onClose();
  };

  // DETACH ACTIVE PERSONA
  const handleDetachPersona = () => {
    if (!currentChat) return;
    updateChat(currentChat.id, {
      personaId: undefined,
      systemPrompt: undefined,
      temperature: undefined,
      topP: undefined,
      maxTokens: undefined,
    });
  };

  // Memory Handlers
  const handleAddMemory = () => {
    if (!newMemory.trim()) return;
    addMemory(newMemory.trim(), newMemCat);
    setNewMemory('');
  };

  const handleSaveMemoryEdit = (id: string) => {
    if (!editingMemoryContent.trim()) return;
    updateMemory(id, { content: editingMemoryContent.trim() });
    setEditingMemoryId(null);
  };

  // Project Handlers
  const handleAddProject = () => {
    if (!newProjName.trim()) return;
    addProject(newProjName.trim(), newProjDesc.trim(), newProjInst.trim());
    setNewProjName('');
    setNewProjDesc('');
    setNewProjInst('');
  };

  const handleLinkChatToProject = (projId: string) => {
    if (!currentChat) return;
    updateChat(currentChat.id, { projectId: projId });
  };

  const handleUnlinkChatProject = () => {
    if (!currentChat) return;
    updateChat(currentChat.id, { projectId: undefined });
  };

  // Knowledge Base Handlers
  const handleAddKb = () => {
    if (!newKbName.trim()) return;
    addKnowledgeBase(newKbName.trim(), newKbDesc.trim());
    setNewKbName('');
    setNewKbDesc('');
  };

  const handleToggleAttachKb = (kbId: string) => {
    if (!currentChat) return;
    const currentList = currentChat.knowledgeBaseIds || [];
    const isAttached = currentList.includes(kbId);
    const nextList = isAttached ? currentList.filter((id) => id !== kbId) : [...currentList, kbId];
    updateChat(currentChat.id, { knowledgeBaseIds: nextList });
  };

  const handleAddKbDocument = (kbId: string) => {
    if (!kbDocTitle.trim() || !kbDocContent.trim()) return;
    addSource(activeChatId || undefined, kbId, kbDocTitle.trim(), kbDocContent.trim(), 'KB_UPLOAD');
    setKbDocTitle('');
    setKbDocContent('');
    setSelectedKbForUpload(null);
  };

  // Filtered Lists
  const filteredPersonas = useMemo(() => {
    return personas.filter((p) => {
      const matchCat = personaCategory === 'ALL' || p.category === personaCategory;
      const matchQuery =
        !personaSearch.trim() ||
        p.name.toLowerCase().includes(personaSearch.toLowerCase()) ||
        p.instructions.toLowerCase().includes(personaSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(personaSearch.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [personas, personaCategory, personaSearch]);

  const filteredMemories = useMemo(() => {
    return memories
      .filter((m) => {
        const matchCat = memCategoryFilter === 'ALL' || m.category === memCategoryFilter;
        const matchQuery = !memSearch.trim() || m.content.toLowerCase().includes(memSearch.toLowerCase());
        return matchCat && matchQuery;
      })
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [memories, memCategoryFilter, memSearch]);

  if (!isOpen) return null;

  return (
    <div
      id="workspace-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-4xl h-[92vh] sm:h-[720px] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100"
        style={{
          backgroundColor: 'var(--surface-color, #171717)',
          borderColor: 'var(--border-color, rgba(255,255,255,0.12))',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg shadow-sm"
              style={{
                backgroundColor: 'var(--accent-subtle, rgba(139, 92, 246, 0.15))',
                color: 'var(--accent-color, #8B5CF6)',
              }}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm"><UiText source={"Workspace & Assistants Hub"}/></h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                 <UiText source={"Configure tailored AI assistants, persistent personal memories, standing project constraints, and grounded knowledge bases."}/> </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b text-xs overflow-x-auto shrink-0 scrollbar-none" style={{ borderColor: 'var(--border-color)' }}>
          <TabButton
            active={activeTab === 'PERSONAS'}
            onClick={() => setActiveTab('PERSONAS')}
            icon={<Bot className="w-4 h-4" />}
            label={$t("Assistants & Personas ({0})",personas.length)}
          />
          <TabButton
            active={activeTab === 'MEMORY'}
            onClick={() => setActiveTab('MEMORY')}
            icon={<Brain className="w-4 h-4" />}
            label={$t("Long-Term Memory ({0})",memories.length)}
          />
          <TabButton
            active={activeTab === 'PROJECTS'}
            onClick={() => setActiveTab('PROJECTS')}
            icon={<FolderKanban className="w-4 h-4" />}
            label={$t("Projects ({0})",projects.length)}
          />
          <TabButton
            active={activeTab === 'KNOWLEDGE'}
            onClick={() => setActiveTab('KNOWLEDGE')}
            icon={<Database className="w-4 h-4" />}
            label={$t("Knowledge Bases ({0})",knowledgeBases.length)}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* ======================= PERSONAS TAB ======================= */}
          {activeTab === 'PERSONAS' && (
            <div className="space-y-4">
              {/* Active Assistant Banner (if current chat has one) */}
              {activePersona && (
                <div
                  className="p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  style={{
                    backgroundColor: 'var(--accent-subtle, rgba(139, 92, 246, 0.12))',
                    borderColor: 'var(--accent-border, rgba(139, 92, 246, 0.35))',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activePersona.symbol || '🤖'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-white">{activePersona.name}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            backgroundColor: 'var(--accent-color, #8B5CF6)',
                            color: '#ffffff',
                          }}
                        >
                           <UiText source={"Active In Current Chat"}/> </span>
                      </div>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {activePersona.description || activePersona.instructions.slice(0, 100) + '...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleDetachPersona}
                      className="px-3 py-1.5 rounded-xl border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 font-medium transition-colors cursor-pointer text-[11px]"
                    >
                       <UiText source={"Detach / Revert to Default"}/> </button>
                    <button
                      onClick={() => handleEditPersona(activePersona)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                      title={$t("Edit Assistant")}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Toolbar: Search + Category Chips + Create Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder={$t("Search assistants by name, directives, or style...")}
                    value={personaSearch}
                    onChange={(e) => setPersonaSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border bg-black/[0.02] dark:bg-white/5 border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-neutral-400 transition-colors"
                  />
                </div>

                <button
                  onClick={handleOpenCreatePersona}
                  className="px-3.5 py-1.5 rounded-xl text-white font-medium flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer hover:opacity-95 transition-opacity"
                  style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span><UiText source={"Create Assistant"}/></span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setPersonaCategory(cat.key)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                      personaCategory === cat.key
                        ? 'text-white shadow-2xs font-semibold'
                        : 'bg-black/[0.03] dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-transparent'
                    }`}
                    style={personaCategory === cat.key ? { backgroundColor: 'var(--accent-color, #8B5CF6)' } : {}}
                  >
                    {<UiText source={cat.label}/>}
                  </button>
                ))}
              </div>

              {/* Collapsible / Expandable Create or Edit Persona Form */}
              {showPersonaForm && (
                <div
                  className="p-4 rounded-3xl border space-y-3.5 shadow-md animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{
                    backgroundColor: 'var(--bg-color, #1e1e1e)',
                    borderColor: 'var(--accent-border, rgba(139, 92, 246, 0.35))',
                  }}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
                    <div className="font-semibold text-xs flex items-center gap-2">
                      <Sliders className="w-4 h-4" style={{ color: 'var(--accent-color, #8B5CF6)' }} />
                      <span>{editingPersonaId ? <UiText source={"Edit Assistant Profile & Hyperparameters"}/> : <UiText source={"Build Custom Assistant"}/>}</span>
                    </div>
                    <button
                      onClick={() => setShowPersonaForm(false)}
                      className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-1">
                      <label className="text-[10px] uppercase font-semibold text-neutral-500 mb-1 block"><UiText source={"Avatar / Symbol"}/></label>
                      <input
                        type="text"
                        value={pSymbol}
                        onChange={(e) => setPSymbol(e.target.value)}
                        placeholder={$t("🤖")}
                        className="w-full text-center text-lg bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-neutral-400"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] uppercase font-semibold text-neutral-500 mb-1 block"><UiText source={"Assistant Name"}/></label>
                      <input
                        type="text"
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        placeholder={$t("e.g. Lead React Architect, Bioethics Scholar...")}
                        className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-neutral-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-neutral-500 mb-1 block"><UiText source={"Short Description"}/></label>
                    <input
                      type="text"
                      value={pDescription}
                      onChange={(e) => setPDescription(e.target.value)}
                      placeholder={$t("Brief role and mission statement...")}
                      className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-neutral-400"
                    />
                  </div>

                  {/* Categorization & Model Binding */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-neutral-500 mb-1 block"><UiText source={"Category"}/></label>
                      <CustomSelect
                        value={pCategory}
                        onChange={(v) => setPCategory(v as PersonaCategory)}
                        options={[
                          { value: 'GENERAL', label: 'General' },
                          { value: 'CODING', label: 'Coding' },
                          { value: 'WRITING', label: 'Writing' },
                          { value: 'ANALYSIS', label: 'Analysis' },
                          { value: 'PRODUCTIVITY', label: 'Productivity' },
                          { value: 'ACADEMIC', label: 'Academic' },
                        ]}
                        size="sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-neutral-500 mb-1 block"><UiText source={"Response Style Guide"}/></label>
                      <CustomSelect
                        value={pResponseStyle}
                        onChange={(v) => setPResponseStyle(v as PersonaResponseStyle)}
                        options={[
                          { value: 'DEFAULT', label: 'Default / Balanced' },
                          { value: 'CONCISE', label: 'Ultra Concise & Direct' },
                          { value: 'DETAILED', label: 'Exhaustive & Detailed' },
                          { value: 'SOCRATIC', label: 'Socratic Inquiry' },
                          { value: 'FORMAL', label: 'Formal & Academic' },
                        ]}
                        size="sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-neutral-500 mb-1 block"><UiText source={"Pin Specific Model (Optional)"}/></label>
                      <CustomSelect
                        value={pModelId}
                        onChange={(v) => setPModelId(v)}
                        options={[
                          { value: '', label: 'Inherit Chat / Global Model' },
                          ...models.map((m) => ({ value: m.id, label: m.displayName || m.id })),
                        ]}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Sliders: Temperature, Top-P, Max Tokens */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-medium flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span><UiText source={"Temperature"}/></span>
                        </span>
                        <span className="font-mono font-semibold">{pTemperature.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={pTemperature}
                        onChange={(e) => setPTemperature(parseFloat(e.target.value))}
                        className="w-full accent-[var(--accent-color)] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-medium flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-blue-500" />
                          <span><UiText source={"Top-P"}/></span>
                        </span>
                        <span className="font-mono font-semibold">{pTopP.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={pTopP}
                        onChange={(e) => setPTopP(parseFloat(e.target.value))}
                        className="w-full accent-[var(--accent-color)] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-medium flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-purple-500" />
                          <span><UiText source={"Max Tokens"}/></span>
                        </span>
                        <span className="font-mono font-semibold">{pMaxTokens}</span>
                      </div>
                      <input
                        type="range"
                        min="512"
                        max="16384"
                        step="512"
                        value={pMaxTokens}
                        onChange={(e) => setPMaxTokens(parseInt(e.target.value))}
                        className="w-full accent-[var(--accent-color)] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Flags: Reasoning Effort & Web Search */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-medium flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-amber-500" />
                        <span><UiText source={"Reasoning Effort:"}/></span>
                      </span>
                      <div className="flex items-center gap-1">
                        {(['OFF', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setPReasoningEffort(lvl)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase transition-colors cursor-pointer ${
                              pReasoningEffort === lvl
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                                : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-[11px] font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pDefaultWebSearch}
                        onChange={(e) => setPDefaultWebSearch(e.target.checked)}
                        className="rounded accent-[var(--accent-color)]"
                      />
                      <Globe className="w-3.5 h-3.5 text-sky-500" />
                      <span><UiText source={"Auto-enable live web search for this persona"}/></span>
                    </label>
                  </div>

                  {/* System Prompt / Directives */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-neutral-500 mb-1">
                      <span><UiText source={"System Instructions & Persona Directives"}/></span>
                      <span><UiText source={"Markdown supported"}/></span>
                    </div>
                    <textarea
                      rows={4}
                      value={pInstructions}
                      onChange={(e) => setPInstructions(e.target.value)}
                      placeholder={$t("You are an expert in... Follow these principles: 1. ..., 2. ...")}
                      className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-2xl p-3 focus:outline-none resize-none font-mono text-[11px] leading-relaxed focus:border-neutral-400"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowPersonaForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 font-medium transition-colors cursor-pointer"
                    >
                       <UiText source={"Cancel"}/> </button>
                    <button
                      type="button"
                      onClick={handleSavePersona}
                      disabled={!pName.trim() || !pInstructions.trim()}
                      className="px-4 py-1.5 rounded-xl text-white font-medium shadow-xs disabled:opacity-40 transition-all cursor-pointer"
                      style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                    >
                      {editingPersonaId ? <UiText source={"Save Changes"}/> : <UiText source={"Create Assistant"}/>}
                    </button>
                  </div>
                </div>
              )}

              {/* Personas Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPersonas.map((p) => {
                  const isCurrentActive = currentChat?.personaId === p.id;
                  const boundModel = models.find((m) => m.id === p.modelId);

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-3xl border transition-all flex flex-col justify-between gap-2.5 ${
                        isCurrentActive
                          ? 'shadow-md ring-1'
                          : 'bg-black/[0.02] dark:bg-white/[0.03] hover:border-neutral-400/50'
                      }`}
                      style={{
                        backgroundColor: isCurrentActive
                          ? 'var(--accent-subtle, rgba(139, 92, 246, 0.08))'
                          : undefined,
                        borderColor: isCurrentActive
                          ? 'var(--accent-color, #8B5CF6)'
                          : 'var(--border-color, rgba(255,255,255,0.1))',
                      }}
                    >
                      <div>
                        {/* Top Bar: Icon + Name + Category + Badges */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xl shrink-0">{p.symbol || '🤖'}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs truncate text-neutral-900 dark:text-white">
                                  {p.name}
                                </span>
                                {p.category && (
                                  <span className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                                    {p.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isCurrentActive && (
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1"
                                style={{
                                  backgroundColor: 'var(--accent-color, #8B5CF6)',
                                  color: '#fff',
                                }}
                              >
                                <Check className="w-3 h-3" />
                                <span><UiText source={"Active"}/></span>
                              </span>
                            )}
                            <button
                              onClick={() => handleEditPersona(p)}
                              className="p-1 hover:text-neutral-900 dark:hover:text-white opacity-60 hover:opacity-100 cursor-pointer"
                              title={$t("Edit Assistant")}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!p.builtIn && (
                              <button
                                onClick={() => deletePersona(p.id)}
                                className="p-1 hover:text-red-500 opacity-60 hover:opacity-100 cursor-pointer"
                                title={$t("Delete Assistant")}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description / Instructions */}
                        <p className="text-[11px] opacity-75 leading-relaxed mt-2 line-clamp-2">
                          {p.description || p.instructions}
                        </p>

                        {/* Hyperparameter Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-2.5 text-[10px] font-mono opacity-80">
                          <span className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                             <UiText source={"Temp:"}/> {p.temperature ?? 0.7}
                          </span>
                          {p.responseStyle && p.responseStyle !== 'DEFAULT' && (
                            <span className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                               <UiText source={"Style:"}/> {p.responseStyle}
                            </span>
                          )}
                          {boundModel && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                               <UiText source={"Model:"}/> {boundModel.displayName || boundModel.id}
                            </span>
                          )}
                          {p.reasoningEffort && p.reasoningEffort !== 'OFF' && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                               <UiText source={"Reasoning:"}/> {p.reasoningEffort}
                            </span>
                          )}
                          {p.defaultWebSearch && (
                            <span className="px-1.5 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25">
                               <UiText source={"Web Search"}/> </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                        <button
                          onClick={() => handleActivatePersona(p)}
                          className={`flex-1 py-1.5 rounded-xl font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                            isCurrentActive
                              ? 'text-white'
                              : 'border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                          style={isCurrentActive ? { backgroundColor: 'var(--accent-color, #8B5CF6)' } : {}}
                        >
                          {isCurrentActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span><UiText source={"Active In Chat"}/></span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              <span><UiText source={"Activate for This Chat"}/></span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleStartNewChatWithPersona(p)}
                          title={$t("Start New Dedicated Chat")}
                          className="px-2.5 py-1.5 rounded-xl border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline"><UiText source={"New Chat"}/></span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================= MEMORY TAB ======================= */}
          {activeTab === 'MEMORY' && (
            <div className="space-y-4">
              {/* Global Memory Setting Bar */}
              <div
                className="p-3.5 rounded-3xl border flex items-center justify-between gap-3"
                style={{
                  backgroundColor: settings.memoryEnabled
                    ? 'var(--accent-subtle, rgba(139, 92, 246, 0.1))'
                    : 'var(--bg-color, #1e1e1e)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Brain
                    className="w-5 h-5"
                    style={{ color: settings.memoryEnabled ? 'var(--accent-color, #8B5CF6)' : '#888' }}
                  />
                  <div>
                    <div className="font-semibold text-xs"><UiText source={"Cross-Conversation Persistent Memory"}/></div>
                    <p className="text-[11px] opacity-75">
                       <UiText source={"When enabled, stored facts and preferences are automatically injected quietly into relevant prompts."}/> </p>
                  </div>
                </div>

                <button
                  onClick={() => updateSettings({ memoryEnabled: !settings.memoryEnabled })}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                    settings.memoryEnabled
                      ? 'text-white'
                      : 'border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  style={settings.memoryEnabled ? { backgroundColor: 'var(--accent-color, #8B5CF6)' } : {}}
                >
                  {settings.memoryEnabled ? <UiText source={"Memory Enabled"}/> : <UiText source={"Memory Paused"}/>}
                </button>
              </div>

              {/* Add Memory Form */}
              <div
                className="p-3.5 rounded-3xl border space-y-2.5"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
              >
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" style={{ color: 'var(--accent-color, #8B5CF6)' }} />
                  <span><UiText source={"Store Personal Knowledge Fact or Technical Preference"}/></span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder={$t("e.g. Always generate TypeScript with strict type inference; I work mainly on Next.js...")}
                    value={newMemory}
                    onChange={(e) => setNewMemory(e.target.value)}
                    className="w-full sm:flex-1 bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                  />
                  <div className="w-full sm:w-36 shrink-0">
                    <CustomSelect
                      value={newMemCat}
                      onChange={(val) => setNewMemCat(val as any)}
                      options={[
                        { value: 'FACT', label: 'Fact' },
                        { value: 'PREFERENCE', label: 'Preference' },
                        { value: 'BACKGROUND', label: 'Background & Bio' },
                        { value: 'INSTRUCTION', label: 'Instruction' },
                        { value: 'PROJECT', label: 'Project' },
                      ]}
                      size="sm"
                    />
                  </div>
                  <button
                    onClick={handleAddMemory}
                    disabled={!newMemory.trim()}
                    className="w-full sm:w-auto px-4 py-1.5 rounded-xl text-white font-medium disabled:opacity-40 cursor-pointer shadow-xs transition-opacity"
                    style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                  >
                     <UiText source={"Store Fact"}/> </button>
                </div>
              </div>

              {/* Memory Search & Category Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder={$t("Filter stored memory facts...")}
                    value={memSearch}
                    onChange={(e) => setMemSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border bg-black/[0.02] dark:bg-white/5 border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-neutral-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {MEMORY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setMemCategoryFilter(cat.key)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                        memCategoryFilter === cat.key
                          ? 'text-white font-semibold shadow-2xs'
                          : 'bg-black/[0.03] dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      style={memCategoryFilter === cat.key ? { backgroundColor: 'var(--accent-color, #8B5CF6)' } : {}}
                    >
                      {<UiText source={cat.label}/>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory Facts List */}
              <div className="space-y-2">
                {filteredMemories.length === 0 ? (
                  <div className="py-12 text-center opacity-40"><UiText source={"No memory facts match your criteria."}/></div>
                ) : (
                  filteredMemories.map((m) => {
                    const isEditing = editingMemoryId === m.id;

                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                          m.pinned
                            ? 'shadow-xs border-amber-500/40 bg-amber-500/5'
                            : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-mono font-semibold uppercase bg-black/5 dark:bg-white/10">
                              {m.category}
                            </span>
                            {m.pinned && (
                              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                <span><UiText source={"High Priority"}/></span>
                              </span>
                            )}
                            <span className="text-[10px] opacity-40">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {isEditing ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                value={editingMemoryContent}
                                onChange={(e) => setEditingMemoryContent(e.target.value)}
                                className="flex-1 bg-black/[0.05] dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl px-2.5 py-1 text-xs focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveMemoryEdit(m.id)}
                                className="px-3 py-1 rounded-xl text-white font-medium cursor-pointer"
                                style={{ backgroundColor: 'var(--accent-color)' }}
                              >
                                 <UiText source={"Save"}/> </button>
                              <button
                                onClick={() => setEditingMemoryId(null)}
                                className="px-2 py-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                              >
                                 <UiText source={"Cancel"}/> </button>
                            </div>
                          ) : (
                            <p className="text-xs leading-relaxed opacity-90">{m.content}</p>
                          )}
                        </div>

                        {/* Actions: Pin, Edit, Remove */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            onClick={() => togglePinMemory(m.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              m.pinned
                                ? 'text-amber-500 bg-amber-500/10'
                                : 'opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            title={$t(m.pinned ? 'Unpin fact' : 'Pin fact to prompt header')}
                          >
                            <Pin className={`w-3.5 h-3.5 ${m.pinned ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingMemoryId(m.id);
                              setEditingMemoryContent(m.content);
                            }}
                            className="p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                            title={$t("Edit fact")}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeMemory(m.id)}
                            className="p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                            title={$t("Delete fact")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ======================= PROJECTS TAB ======================= */}
          {activeTab === 'PROJECTS' && (
            <div className="space-y-4">
              {/* Create Project Card */}
              <div
                className="p-3.5 rounded-3xl border space-y-2.5"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
              >
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" style={{ color: 'var(--accent-color, #8B5CF6)' }} />
                  <span><UiText source={"Create Standing Project Rules & Boundaries"}/></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={$t("Project Name...")}
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                  />
                  <input
                    type="text"
                    placeholder={$t("Short Description...")}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder={$t("Standing Project Rules, Conventions, Constraints...")}
                  value={newProjInst}
                  onChange={(e) => setNewProjInst(e.target.value)}
                  className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-2xl p-2.5 focus:outline-none resize-none font-mono text-[11px] leading-relaxed focus:border-neutral-400"
                />

                <button
                  onClick={handleAddProject}
                  disabled={!newProjName.trim()}
                  className="px-4 py-1.5 rounded-xl text-white font-medium disabled:opacity-40 cursor-pointer shadow-xs transition-opacity"
                  style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                >
                   <UiText source={"Save Project"}/> </button>
              </div>

              {/* Projects List */}
              <div className="space-y-2.5">
                {projects.length === 0 ? (
                  <div className="py-12 text-center opacity-40"><UiText source={"No projects created yet."}/></div>
                ) : (
                  projects.map((p) => {
                    const isLinkedToCurrent = currentChat?.projectId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isLinkedToCurrent
                            ? 'border-emerald-500/50 bg-emerald-500/5 shadow-xs'
                            : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-2xl shrink-0">{p.emoji || '📁'}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs truncate text-neutral-900 dark:text-white">{p.name}</span>
                              {isLinkedToCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                   <UiText source={"Linked to Current Chat"}/> </span>
                              )}
                            </div>
                            {p.description && (
                              <p className="text-[11px] opacity-75 mt-0.5 truncate">{<UiText source={p.description}/>}</p>
                            )}
                            {p.standingInstructions && (
                              <p className="text-[10px] font-mono opacity-60 mt-1 line-clamp-1">
                                 <UiText source={"Rules:"}/> {p.standingInstructions}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Project Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isLinkedToCurrent ? (
                            <button
                              onClick={handleUnlinkChatProject}
                              className="px-3 py-1.5 rounded-xl border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 font-medium text-xs transition-colors cursor-pointer"
                            >
                               <UiText source={"Unlink"}/> </button>
                          ) : (
                            <button
                              onClick={() => handleLinkChatToProject(p.id)}
                              className="px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-medium text-xs transition-colors cursor-pointer"
                            >
                               <UiText source={"Link to Chat"}/> </button>
                          )}

                          <button
                            onClick={() => {
                              const newId = createChat({ title: `${p.name} Session`, projectId: p.id });
                              setActiveChat(newId);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl text-white font-medium text-xs shadow-xs cursor-pointer"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                          >
                             <UiText source={"New Chat"}/> </button>

                          <button
                            onClick={() => {
                              setProjectModalOpen(true, p.id);
                              onClose();
                            }}
                            className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                            title={$t("Edit Project")}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProject(p.id)}
                            className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                            title={$t("Delete Project")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ======================= KNOWLEDGE BASES TAB ======================= */}
          {activeTab === 'KNOWLEDGE' && (
            <div className="space-y-4">
              {/* Create Knowledge Base Container */}
              <div
                className="p-3.5 rounded-3xl border space-y-2.5"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
              >
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" style={{ color: 'var(--accent-color, #8B5CF6)' }} />
                  <span><UiText source={"Create Grounded Knowledge Base Container"}/></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={$t("Knowledge Base Name...")}
                    value={newKbName}
                    onChange={(e) => setNewKbName(e.target.value)}
                    className="bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                  />
                  <input
                    type="text"
                    placeholder={$t("Description or Domain...")}
                    value={newKbDesc}
                    onChange={(e) => setNewKbDesc(e.target.value)}
                    className="bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                  />
                </div>

                <button
                  onClick={handleAddKb}
                  disabled={!newKbName.trim()}
                  className="px-4 py-1.5 rounded-xl text-white font-medium disabled:opacity-40 cursor-pointer shadow-xs transition-opacity"
                  style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                >
                   <UiText source={"Save Knowledge Base"}/> </button>
              </div>

              {/* Upload document inline drawer if selected */}
              {selectedKbForUpload && (
                <div
                  className="p-4 rounded-3xl border space-y-3 bg-black/[0.03] dark:bg-white/[0.04] animate-in fade-in"
                  style={{ borderColor: 'var(--accent-color)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                      <span><UiText source={"Add Text Document to Knowledge Base"}/></span>
                    </div>
                    <button
                      onClick={() => setSelectedKbForUpload(null)}
                      className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder={$t("Document Title (e.g. Architecture Guide v2)...")}
                    value={kbDocTitle}
                    onChange={(e) => setKbDocTitle(e.target.value)}
                    className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  />

                  <textarea
                    rows={3}
                    placeholder={$t("Paste reference text, specifications, or notes to index into RAG vector chunks...")}
                    value={kbDocContent}
                    onChange={(e) => setKbDocContent(e.target.value)}
                    className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-2xl p-2.5 font-mono text-[11px] focus:outline-none resize-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedKbForUpload(null)}
                      className="px-3 py-1 rounded-xl border border-black/15 dark:border-white/15 cursor-pointer"
                    >
                       <UiText source={"Cancel"}/> </button>
                    <button
                      onClick={() => handleAddKbDocument(selectedKbForUpload)}
                      disabled={!kbDocTitle.trim() || !kbDocContent.trim()}
                      className="px-4 py-1 rounded-xl text-white font-medium disabled:opacity-40 cursor-pointer"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                       <UiText source={"Index Document"}/> </button>
                  </div>
                </div>
              )}

              {/* Knowledge Bases List */}
              <div className="space-y-2.5">
                {knowledgeBases.length === 0 ? (
                  <div className="py-12 text-center opacity-40"><UiText source={"No knowledge bases configured yet."}/></div>
                ) : (
                  knowledgeBases.map((kb) => {
                    const docCount = sources.filter((s) => s.knowledgeBaseId === kb.id).length;
                    const isAttached = currentChat?.knowledgeBaseIds?.includes(kb.id);

                    return (
                      <div
                        key={kb.id}
                        className={`p-3.5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isAttached
                            ? 'border-cyan-500/50 bg-cyan-500/5 shadow-xs'
                            : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-2xl shrink-0">{kb.emoji || '🗄️'}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs truncate text-neutral-900 dark:text-white">{kb.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400">
                                {docCount}  <UiText source={"document"}/>{docCount !== 1 ? <UiText source={"s"}/> : ''}
                              </span>
                              {isAttached && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                                   <UiText source={"Attached (Active RAG)"}/> </span>
                              )}
                            </div>
                            {kb.description && (
                              <p className="text-[11px] opacity-75 mt-0.5 truncate">{<UiText source={kb.description}/>}</p>
                            )}
                          </div>
                        </div>

                        {/* KB Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleAttachKb(kb.id)}
                            className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                              isAttached
                                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                                : 'border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'
                            }`}
                          >
                            {isAttached ? <UiText source={"Detach from Chat"}/> : <UiText source={"Attach to Chat (RAG)"}/>}
                          </button>

                          <button
                            onClick={() => setSelectedKbForUpload(kb.id)}
                            className="px-3 py-1.5 rounded-xl border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span><UiText source={"Add Doc"}/></span>
                          </button>

                          <button
                            onClick={() => deleteKnowledgeBase(kb.id)}
                            className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                            title={$t("Delete Knowledge Base")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-medium transition-all cursor-pointer whitespace-nowrap ${
        active
          ? 'text-white font-semibold shadow-xs'
          : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-transparent'
      }`}
      style={active ? { backgroundColor: 'var(--accent-color, #8B5CF6)' } : {}}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
