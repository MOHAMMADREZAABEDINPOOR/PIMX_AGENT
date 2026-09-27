'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { VISIBLE_PROVIDERS, parseBulkApiKeys } from '@/lib/providers/catalog';
import { ProviderSpec, AccountEntity, BuiltInModel, ModelEntity } from '@/lib/types';
import { maskApiKey } from '@/lib/crypto';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { compressImage } from '@/lib/client/images';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import {
  Key,
  Plus,
  Zap,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Layers,
  Search,
  Check,
  CheckCheck,
  XCircle,
  ShieldCheck,
  Info,
  ArrowLeft,
  Lock,
  Upload,
  Image as ImageIcon,
  X,
  Copy,
} from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

function generateUniqueId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`;
}

interface ProviderConfigPanelProps {
  providerId?: string | null;
  onBack?: () => void;
  onSelectProvider?: (id: string) => void;
}

export function ProviderConfigPanel({
  providerId,
  onBack,
  onSelectProvider,
}: ProviderConfigPanelProps) {
  const $t=useT();
  const {
    selectedProviderForConfig,
    setProviderConfigModalOpen,
    accounts,
    customProviders,
    removeAccount,
    upsertCustomProvider,
    deleteCustomProvider,
    bulkAddAccounts,
    testAccount,
    models,
    importModelsForProvider,
    clearAllModelsForProvider,
    enableAllModelsForProvider,
    disableAllModelsForProvider,
    filterWorkingModelsForProvider,
    addCustomModel,
    deleteModel,
    toggleModelVisibility,
    testModel,
  } = useAppStore();

  const allProviders: ProviderSpec[] = [...VISIBLE_PROVIDERS, ...customProviders];

  // Active selection state
  const [activeProviderId, setActiveProviderId] = useState<string>(
    providerId || selectedProviderForConfig || 'openai'
  );

  useEffect(() => {
    if (providerId) {
      setActiveProviderId(providerId);
    }
  }, [providerId]);

  const isCreatingCustom = activeProviderId === 'new_custom';
  const currentProvider: ProviderSpec | undefined = isCreatingCustom
    ? undefined
    : allProviders.find((p) => p.id === activeProviderId) || allProviders[0];

  const isCustomProvider = isCreatingCustom || !!currentProvider?.isCustom;
  const effectiveId = isCreatingCustom ? 'custom' : (currentProvider?.id || 'openai');

  // Active tab in management pane
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'MODELS' | 'ADD_MANUAL'>('CONFIG');

  const [isSaving,setIsSaving]=useState(false),[deleteDialog,setDeleteDialog]=useState(false);
  // Form States (Strictly preserved across tests and failures)
  const [formName, setFormName] = useState('');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formApiFormat, setCustomApiFormat] = useState<'OPENAI' | 'ANTHROPIC'>('OPENAI');
  const [formApiKey, setFormApiKey] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [tempCustomModels, setTempCustomModels] = useState<BuiltInModel[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset/populate form values when active provider changes
  useEffect(() => {
    if (isCreatingCustom) {
      setFormName('');
      setFormBaseUrl('http://localhost:11434/v1');
      setCustomApiFormat('OPENAI');
      setFormApiKey('');
      setFormDesc('');
      setFormIconUrl('');
      setTempCustomModels([]);
      setActiveTab('CONFIG');
    } else if (currentProvider) {
      setFormName(currentProvider.name);
      setFormBaseUrl(currentProvider.baseUrl);
      setCustomApiFormat(currentProvider.apiFormat || 'OPENAI');
      setFormApiKey(''); // fresh input for adding new key(s)
      setFormDesc(currentProvider.description || '');
      setFormIconUrl(currentProvider.iconUrl || '');
      setTempCustomModels([]);
      setActiveTab('CONFIG');
    }
    setConnTestResult(null);
    setImportResult(null);
    setSaveResult(null);
  }, [activeProviderId]);

  // Connection & Model Fetch State
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connTestResult, setConnTestResult] = useState<{
    ok: boolean;
    message: string;
    latency?: number;
  } | null>(null);

  const [isImportingModels, setIsImportingModels] = useState(false);
  const [importResult, setImportResult] = useState<{
    ok: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Model tab states
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testAllProgress, setTestAllProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorModalData, setErrorModalData] = useState<{ modelName: string; error: string } | null>(null);
  const [copiedError, setCopiedError] = useState(false);
  const [modelSearch, setModelSearch] = useState('');

  // Manual Model Form State
  const [manualModelId, setManualModelId] = useState('');
  const [manualModelName, setManualModelName] = useState('');
  const [manualContextWindow, setManualContextWindow] = useState(128000);
  const [manualMaxOutput, setManualMaxOutput] = useState(4096);
  const [manualVision, setManualVision] = useState(false);
  const [manualTools, setManualTools] = useState(true);
  const [manualReasoning, setManualReasoning] = useState(false);
  const [manualIsFree, setManualIsFree] = useState(false);

  // Provider accounts & models for active provider
  const providerAccounts = currentProvider
    ? accounts.filter((a) => a.providerId === currentProvider.id)
    : [];

  const providerModels = currentProvider
    ? models.filter((m) => m.providerId === currentProvider.id)
    : [];

  const handleSelectProvider = (id: string) => {
    setActiveProviderId(id);
    if (onSelectProvider) {
      onSelectProvider(id);
    } else {
      setProviderConfigModalOpen(true, id);
    }
  };

  // Provider selector options for the header dropdown
  const providerSelectOptions: SelectOption[] = [
    ...VISIBLE_PROVIDERS.map((p) => ({
      value: p.id,
      label: p.name,
      group: 'Standard Providers',
      icon: <ProviderLogo providerId={p.id} size="sm" />,
    })),
    ...customProviders.map((cp) => ({
      value: cp.id,
      label: cp.name,
      group: 'Custom Providers',
      badge: 'Custom',
      icon: <ProviderLogo providerId={cp.id} customIconUrl={cp.iconUrl} size="sm" />,
    })),
    {
      value: 'new_custom',
      label: '+ Add New Custom Provider...',
      group: 'Actions',
      icon: <Plus className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />,
    },
  ];

  // Handle Logo Upload from Local File
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { if(file.size>2*1024*1024)throw new Error('Logo images must be below 2 MB.');setFormIconUrl(await compressImage(file,256)); }
    catch(error){setSaveResult({ok:false,message:error instanceof Error?error.message:'Could not read this image.'});}
    e.target.value='';
  };

  // Helper to extract test API key without mangling
  const getEffectiveTestKey = (providerKey: string): string => {
    if (formApiKey.trim()) {
      const firstLine = formApiKey.trim().split(/[\r\n,;]+/)[0].trim();
      const matchBracket = firstLine.match(/^(\S+)\s*\[.*?\]$/);
      return matchBracket ? matchBracket[1].trim() : firstLine;
    }
    if (providerAccounts.length > 0) {
      const activeAcc = providerAccounts.find((a) => a.enabled) || providerAccounts[0];
      return '';
    }
    return '';
  };

  // 1. Connection Test Handler (Keeps ALL text boxes populated on failure or success)
  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setConnTestResult(null);

    try {
      const targetBase = isCreatingCustom
        ? formBaseUrl.trim() || 'http://localhost:11434/v1'
        : currentProvider?.isCustom
        ? formBaseUrl.trim() || currentProvider.baseUrl
        : currentProvider!.baseUrl;

      const targetFormat = isCreatingCustom
        ? formApiFormat
        : currentProvider?.apiFormat || 'OPENAI';

      const pId = isCreatingCustom ? 'custom' : currentProvider?.id || 'custom';
      const testKey = getEffectiveTestKey(pId);
      const credentialId = !testKey ? (providerAccounts.find(a => a.enabled) || providerAccounts[0])?.credentialId : undefined;

      // Built-in non-gemini providers require a key. Custom/local providers (e.g. Ollama) can run without a key.
      if (!testKey && !credentialId && !isCustomProvider && pId !== 'gemini') {
        setConnTestResult({
          ok: false,
          message: 'Please enter at least one API key before testing connection.',
        });
        setIsTestingConn(false);
        return;
      }

      const testRes = await fetch('/api/provider/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          providerId: pId,
          apiKey: testKey || undefined,
          credentialId,
          baseUrl: targetBase,
          apiFormat: targetFormat,
        }),
      });

      const testData = await testRes.json();
      if (!testData.ok) {
        setConnTestResult({
          ok: false,
          message: testData.error?.message || testData.error || 'Connection failed. Please check the API Prefix or API Key.',
          latency: testData.latencyMs,
        });
      } else {
        setConnTestResult({
          ok: true,
          message: `Connected successfully (${testData.latencyMs || 0}ms)`,
          latency: testData.latencyMs,
        });
      }
    } catch (err: any) {
      setConnTestResult({
        ok: false,
        message: err.message || 'Network test error. Check endpoint URL and connectivity.',
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  // 2. Import Available Models Handler (Works before and after saving)
  const handleImportModels = async () => {
    if (isCreatingCustom && !formName.trim()) {
      setImportResult({
        ok: false,
        message: 'Please enter a Provider Name first.',
      });
      return;
    }

    setIsImportingModels(true);
    setImportResult(null);

    try {
      const targetBase = isCreatingCustom
        ? formBaseUrl.trim() || 'http://localhost:11434/v1'
        : currentProvider?.isCustom
        ? formBaseUrl.trim() || currentProvider.baseUrl
        : currentProvider!.baseUrl;

      const pId = isCreatingCustom ? 'custom' : currentProvider!.id;
      const testKey = getEffectiveTestKey(pId);
      const credentialId = !testKey ? (providerAccounts.find(a => a.enabled) || providerAccounts[0])?.credentialId : undefined;

      let discoveredModels: BuiltInModel[] | undefined = undefined;
      try {
        const modelsRes = await fetch('/api/provider/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'fetch_models',
            providerId: pId,
            apiKey: testKey || undefined,
          credentialId,
            baseUrl: targetBase,
          }),
        });
        const modelsData = await modelsRes.json();
        if (modelsData.ok && Array.isArray(modelsData.models) && modelsData.models.length > 0) {
          discoveredModels = modelsData.models;
        }
      } catch {}

      if (!isCreatingCustom && currentProvider) {
        importModelsForProvider(currentProvider.id, discoveredModels);
        const count = discoveredModels ? discoveredModels.length : (currentProvider.models?.length || 0);
        setImportResult({
          ok: true,
          message: `Successfully imported ${count} models for ${currentProvider.name}`,
          count,
        });
      } else {
        if (discoveredModels && discoveredModels.length > 0) {
          setTempCustomModels(discoveredModels);
          setImportResult({
            ok: true,
            message: `Discovered ${discoveredModels.length} models. They will be imported when you save this provider.`,
            count: discoveredModels.length,
          });
        } else {
          setImportResult({
            ok: true,
            message: 'Endpoint reachable. Default standard models will be assigned.',
          });
        }
      }
    } catch (err: any) {
      setImportResult({
        ok: false,
        message: err.message || 'Failed to import models. Verify the API Key and endpoint URL.',
      });
    } finally {
      setIsImportingModels(false);
    }
  };

  // 3. Save / Update Provider Handler
  const handleSaveProvider = async () => {
    if(isSaving)return;setIsSaving(true);setSaveResult(null);
    try {
    if (isCreatingCustom) {
      if (!formName.trim()) {
        setSaveResult({ ok: false, message: 'Provider Name is required.' });
        return;
      }

      const newId = generateUniqueId('custom');
      const newProvider: ProviderSpec = {
        id: newId,
        name: formName.trim(),
        shortName: formName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'custom',
        baseUrl: formBaseUrl.trim() || 'http://localhost:11434/v1',
        apiFormat: formApiFormat,
        defaultStrategy: 'PRIORITY',
        isCustom: true,
        description: formDesc.trim() || 'Custom OpenAI / Anthropic compatible endpoint',
        iconUrl: formIconUrl.trim() || undefined,
        models: tempCustomModels.length > 0 ? tempCustomModels : [],
      };

      upsertCustomProvider(newProvider);

      if (formApiKey.trim()) {
        await bulkAddAccounts(newId, formApiKey, newProvider.baseUrl);
      }

      importModelsForProvider(newId, tempCustomModels.length > 0 ? tempCustomModels : undefined);

      setSaveResult({ ok: true, message: `Provider "${newProvider.name}" created successfully!` });
      handleSelectProvider(newId);
    } else if (currentProvider) {
      if (currentProvider.isCustom) {
        const updatedProvider: ProviderSpec = {
          ...currentProvider,
          name: formName.trim() || currentProvider.name,
          baseUrl: formBaseUrl.trim() || currentProvider.baseUrl,
          description: formDesc.trim(),
          apiFormat: formApiFormat,
          iconUrl: formIconUrl.trim() || undefined,
        };
        upsertCustomProvider(updatedProvider);
      }

      if (formApiKey.trim()) {
        const res = await bulkAddAccounts(
          currentProvider.id,
          formApiKey,
          currentProvider.isCustom ? formBaseUrl.trim() : undefined
        );
        setFormApiKey(''); // clear fresh input since keys are now in configured list
        setSaveResult({
          ok: true,
          message: `Saved changes and added ${res.addedCount} API key(s) to ${currentProvider.name}!`,
        });
      } else {
        setSaveResult({
          ok: true,
          message: `Provider settings for ${currentProvider.name} updated successfully!`,
        });
      }
    }
    } catch (error) { setSaveResult({ ok: false, message: error instanceof Error ? error.message : 'Could not save this provider.' }); } finally {setIsSaving(false);}
  };

  // Handle Single Model Test
  const handleTestSingleModel = async (modelId: string) => {
    setTestingModelId(modelId);
    await testModel(modelId);
    setTestingModelId(null);
  };

  // Handle Batch Test All Models
  const handleTestAllModels = async () => {
    if (providerModels.length === 0 || isTestingAll) return;
    setIsTestingAll(true);
    for (let i = 0; i < providerModels.length; i++) {
      setTestAllProgress({ current: i + 1, total: providerModels.length });
      await testModel(providerModels[i].id);
    }
    setIsTestingAll(false);
    setTestAllProgress(null);
  };

  // Handle Add Manual Model
  const handleSaveManualModel = async () => {
    if (!manualModelId.trim() || !currentProvider) return;
    const qualifiedId = `${currentProvider.id}/${manualModelId.trim()}`;

    const newModel: ModelEntity = {
      id: qualifiedId,
      providerId: currentProvider.id,
      upstreamId: manualModelId.trim(),
      displayName: manualModelName.trim() || manualModelId.trim(),
      displayId: `${currentProvider.shortName}/${manualModelId.trim()}`,
      apiFormat: currentProvider.apiFormat,
      endpoints: 'chat',
      visionCapable: manualVision,
      toolsCapable: manualTools,
      reasoningCapable: manualReasoning,
      streamingCapable: true,
      contextWindow: manualContextWindow,
      maxOutputTokens: manualMaxOutput,
      promptPricePerM: 0,
      completionPricePerM: 0,
      isFree: manualIsFree,
      builtIn: false,
      isCustom: true,
      visible: true,
      lastTestStatus: 'UNTESTED',
      sortOrder: models.length + 1,
    };

    addCustomModel(newModel);
    setManualModelId('');
    setManualModelName('');
    setActiveTab('MODELS');
    await testModel(newModel.id);
  };

  const handleReimportModels = async () => {
    if (!currentProvider) return;
    setIsImportingModels(true);
    setImportResult(null);
    try {
      const res = await importModelsForProvider(currentProvider.id);
      if (res.ok) {
        setImportResult({
          ok: true,
          message: `Successfully imported ${res.count} models (${res.source === 'LIVE' ? 'Live Provider API' : 'Catalog Preset'})`,
          count: res.count,
        });
      } else {
        setImportResult({
          ok: false,
          message: res.error || 'Failed to import models',
        });
      }
    } catch (err: any) {
      setImportResult({
        ok: false,
        message: err.message || 'Error importing models',
      });
    } finally {
      setIsImportingModels(false);
      setTimeout(() => {
        setImportResult(null);
      }, 6000);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4 text-neutral-900 dark:text-neutral-100">
      {deleteDialog && currentProvider && <ConfirmDialog title={$t("Delete provider")} description={$t("Remove {0}, its stored keys and its models?",currentProvider.name)} onClose={()=>setDeleteDialog(false)} onConfirm={()=>{void deleteCustomProvider(currentProvider.id).then(()=>{setDeleteDialog(false);handleSelectProvider('openai');},error=>{setDeleteDialog(false);setSaveResult({ok:false,message:error instanceof Error?error.message:'Could not remove this provider.'});});}}/>}
      {/* ========================================================================= */}
      {/* TOP HEADER BAR: Full width with Back Button, Selector, and Info            */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span><UiText source={"All Providers"}/></span>
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            <ProviderLogo
              providerId={effectiveId}
              customIconUrl={formIconUrl || (currentProvider?.iconUrl)}
              size="lg"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isCreatingCustom ? (
                <span className="font-bold text-sm"><UiText source={"Add Custom Provider"}/></span>
              ) : (
                <div className="w-56 sm:w-72">
                  <CustomSelect
                    value={activeProviderId}
                    onChange={handleSelectProvider}
                    options={providerSelectOptions}
                    size="sm"
                  />
                </div>
              )}

              {isCreatingCustom ? (
                <span
                  style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                    color: 'var(--accent-color)',
                    borderColor: 'rgba(var(--accent-rgb), 0.3)',
                  }}
                  className="px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono border"
                >
                   <UiText source={"New Provider"}/> </span>
              ) : currentProvider?.isCustom ? (
                <span
                  style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                    color: 'var(--accent-color)',
                    borderColor: 'rgba(var(--accent-rgb), 0.3)',
                  }}
                  className="px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono border"
                >
                   <UiText source={"Custom Provider"}/> </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  <Lock className="w-2.5 h-2.5" />
                  <span><UiText source={"Pre-configured Built-in"}/></span>
                </span>
              )}
            </div>

            <div className="text-[11px] text-muted font-mono truncate max-w-md mt-0.5">
              {isCreatingCustom
                ? <UiText source={"Connect any OpenAI / Anthropic / Ollama endpoint"}/>
                : currentProvider?.baseUrl}
            </div>
          </div>
        </div>

        {/* Quick Stats Indicator / Actions */}
        {!isCreatingCustom && currentProvider && (
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 font-mono shadow-2xs">
              {providerAccounts.length} {providerAccounts.length === 1 ? <UiText source={"Key"}/> : <UiText source={"Keys"}/>}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 font-mono shadow-2xs">
              {providerModels.length}  <UiText source={"Models"}/> </span>
          </div>
        )}
      </div>

      {/* Tab Navigation (Provider Details / Models / Add Custom Model) */}
      {!isCreatingCustom && (
        <div className="flex items-center gap-2 border-b-2 border-neutral-200 dark:border-neutral-800 text-xs font-medium px-1">
          <button
            type="button"
            onClick={() => setActiveTab('CONFIG')}
            style={
              activeTab === 'CONFIG'
                ? { borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }
                : undefined
            }
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CONFIG'
                ? 'font-bold'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span><UiText source={"Provider Settings & API Keys ("}/>{providerAccounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MODELS')}
            style={
              activeTab === 'MODELS'
                ? { borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }
                : undefined
            }
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MODELS'
                ? 'font-bold'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span><UiText source={"Models ("}/>{providerModels.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ADD_MANUAL')}
            style={
              activeTab === 'ADD_MANUAL'
                ? { borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }
                : undefined
            }
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ADD_MANUAL'
                ? 'font-bold'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span><UiText source={"Add Custom Model"}/></span>
          </button>
        </div>
      )}

      {/* Main Tab: Provider Settings & API Keys */}
      {(isCreatingCustom || activeTab === 'CONFIG') && (
        <div className="space-y-4">
          {/* Status Notifications (Connection Test / Import / Save) */}
          {connTestResult && (
            <div
              className={`p-3.5 rounded-xl border-2 flex items-start gap-3 text-xs animate-in fade-in duration-200 ${
                connTestResult.ok
                  ? 'border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                  : 'border-rose-500/40 bg-rose-50/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
              }`}
            >
              {connTestResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-semibold">
                  {connTestResult.ok ? <UiText source={"Connection Successful"}/> : <UiText source={"Connection Test Result"}/>}
                </div>
                <div className="text-[11px] leading-relaxed">{connTestResult.message}</div>
              </div>
            </div>
          )}

          {importResult && (
            <div
              className={`p-3.5 rounded-xl border-2 flex items-start gap-3 text-xs animate-in fade-in duration-200 ${
                importResult.ok
                  ? 'border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                  : 'border-rose-500/40 bg-rose-50/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
              }`}
            >
              {importResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-semibold">
                  {importResult.ok ? <UiText source={"Models Imported"}/> : <UiText source={"Model Import Notice"}/>}
                </div>
                <div className="text-[11px] leading-relaxed">{importResult.message}</div>
              </div>
            </div>
          )}

          {saveResult && (
            <div
              className={`p-3.5 rounded-xl border-2 flex items-start gap-3 text-xs animate-in fade-in duration-200 ${
                saveResult.ok
                  ? 'border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                  : 'border-rose-500/40 bg-rose-50/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
              }`}
            >
              {saveResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-semibold">
                  {saveResult.ok ? <UiText source={"Changes Saved"}/> : <UiText source={"Save Notice"}/>}
                </div>
                <div className="text-[11px] leading-relaxed">{saveResult.message}</div>
              </div>
            </div>
          )}

          {/* Form Container with High-Contrast Text Boxes */}
          <div className="p-5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 space-y-4 shadow-xs">
            {/* Field 1: Name */}
            <div>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                 <UiText source={"Provider Name"}/> </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                readOnly={!isCustomProvider && !isCreatingCustom}
                placeholder={$t("e.g. My Company vLLM or Local LMStudio")}
                className={
                  !isCustomProvider && !isCreatingCustom
                    ? 'w-full bg-neutral-100 dark:bg-neutral-800/80 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-semibold shadow-xs cursor-default'
                    : 'w-full bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all shadow-xs'
                }
              />
            </div>

            {/* Field 2: API Prefix (Base URL Endpoint) - Locked for Pre-configured Built-in Providers */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <span><UiText source={"API Prefix (Base URL)"}/></span>
                  {!isCustomProvider && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      <Lock className="w-3 h-3" />
                      <span><UiText source={"Locked (Pre-configured)"}/></span>
                    </span>
                  )}
                </label>
                {!isCustomProvider && (
                  <span className="text-[10px] text-muted font-mono"><UiText source={"Read-Only"}/></span>
                )}
              </div>

              <div className="relative">
                <input
                  type="url"
                  value={isCustomProvider ? formBaseUrl : currentProvider?.baseUrl || ''}
                  onChange={(e) => {
                    if (isCustomProvider) setFormBaseUrl(e.target.value);
                  }}
                  readOnly={!isCustomProvider || providerAccounts.length>0}
                  disabled={!isCustomProvider || providerAccounts.length>0}
                  placeholder={$t(isCustomProvider
                      ? 'e.g. http://localhost:11434/v1 or https://my-proxy.com/v1'
                      : currentProvider?.baseUrl)}
                  className={
                    !isCustomProvider
                      ? 'w-full bg-neutral-100 dark:bg-neutral-800/80 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-neutral-600 dark:text-neutral-400 font-mono cursor-not-allowed select-none shadow-xs'
                      : 'w-full bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all font-mono shadow-xs'
                  }
                />
                {!isCustomProvider && (
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              {!isCustomProvider ? (
                <p className="text-[10px] text-muted mt-1">
                   <UiText source={"The Base URL for pre-configured built-in providers is locked and cannot be modified."}/> </p>
              ) : (
                <p className="text-[10px] text-muted mt-1">
                   <UiText source={"Saved keys are bound to this endpoint. Remove its keys or create a new provider to change the endpoint."}/> </p>
              )}
            </div>

            {/* Protocol Option (For Custom Providers) */}
            {isCustomProvider && (
              <div>
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                   <UiText source={"API Protocol / Format"}/> </label>
                <CustomSelect
                  value={formApiFormat}
                  onChange={(val) => setCustomApiFormat(val as any)}
                  options={[
                    {
                      value: 'OPENAI',
                      label: 'OpenAI Compatible (Default)',
                      description: 'Standard /v1/chat/completions endpoint',
                    },
                    {
                      value: 'ANTHROPIC',
                      label: 'Anthropic Messages Format',
                      description: 'Native /v1/messages endpoint',
                    },
                  ]}
                  size="md"
                />
              </div>
            )}

            {/* Field 3: Unified API Key Field (Accepts One or Multiple Keys) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                  <span><UiText source={"API Key(s)"}/></span>
                </label>
                <span className="text-[10px] text-muted"><UiText source={"One or multiple keys"}/></span>
              </div>

              <textarea
                rows={3}
                placeholder={$t("Paste one key, or multiple keys (one per line, comma-separated, or sk-xxx [Label])")}
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl p-3.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all font-mono resize-y shadow-xs"
              />
              <p className="text-[10px] text-muted mt-1">
                 <UiText source={"Enter one API key or paste multiple keys. Multiple keys within the same provider are pooled and managed automatically."}/> </p>
            </div>

            {/* Field 4: Description */}
            <div>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                 <UiText source={"Description"}/> </label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder={$t("e.g. Private RTX 4090 cluster or local LMStudio")}
                className="w-full bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all shadow-xs"
              />
            </div>

            {/* Field 5: Custom Provider Icon / Logo Upload & Image Link */}
            {isCustomProvider && (
              <div className="p-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                    <span><UiText source={"Provider Icon / Logo (Optional)"}/></span>
                  </label>
                  {formIconUrl && (
                    <button
                      type="button"
                      onClick={() => setFormIconUrl('')}
                      className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span><UiText source={"Reset to default"}/></span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Current Icon Preview */}
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    <ProviderLogo
                      providerId="custom"
                      customIconUrl={formIconUrl}
                      size="lg"
                    />
                  </div>

                  {/* Image URL Input & File Upload Button */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      value={formIconUrl}
                      onChange={(e) => setFormIconUrl(e.target.value)}
                      placeholder={$t("Paste image URL (e.g. https://.../logo.png)")}
                      className="w-full bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--accent-color)] shadow-xs font-mono"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3 h-3" />
                        <span><UiText source={"Upload Image File"}/></span>
                      </button>
                      <span className="text-[10px] text-muted"><UiText source={"Supports PNG, SVG, JPG, WebP"}/></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConn}
                style={{
                  borderColor: 'rgba(var(--accent-rgb), 0.35)',
                  backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
                  color: 'var(--accent-color)',
                }}
                className="px-4 py-2.5 rounded-xl border-2 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Zap
                  className={`w-3.5 h-3.5 text-amber-500 ${isTestingConn ? 'animate-spin' : ''}`}
                />
                <span>{isTestingConn ? <UiText source={"Testing Connection..."}/> : <UiText source={"Test Connection"}/>}</span>
              </button>

              <button
                type="button"
                onClick={handleImportModels}
                disabled={isImportingModels}
                className="px-4 py-2.5 rounded-xl border-2 border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Layers
                  className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${
                    isImportingModels ? 'animate-spin' : ''
                  }`}
                />
                <span>{isImportingModels ? <UiText source={"Importing Models..."}/> : <UiText source={"Import Available Models"}/>}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveProvider}
                disabled={isSaving}
                style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff' }}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md transition-all flex items-center gap-2 ml-auto cursor-pointer hover:opacity-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving?<UiText source={"Saving securely..."}/>:isCreatingCustom ? <UiText source={"Create Provider"}/> : <UiText source={"Save Changes"}/>}</span>
              </button>

              {isCustomProvider && !isCreatingCustom && (
                <button
                  type="button"
                  onClick={()=>setDeleteDialog(true)}
                  className="p-2.5 rounded-xl border-2 border-rose-500/30 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
                  title={$t("Delete Custom Provider")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Configured API Keys List (If provider has saved keys) */}
          {!isCreatingCustom && currentProvider && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 px-1">
                <span><UiText source={"Configured Keys for"}/> {currentProvider.name} ({providerAccounts.length})</span>
                <span className="text-[10px] text-muted"><UiText source={"Active in failover & load balancing"}/></span>
              </div>

              {providerAccounts.length === 0 ? (
                <div className="p-5 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-1 bg-neutral-50/50 dark:bg-neutral-900/30">
                  <p className="text-xs text-muted">
                     <UiText source={"No keys saved for"}/> {currentProvider.name}  <UiText source={"yet."}/> </p>
                  <p className="text-[10px] text-muted/70">
                     <UiText source={"Enter key(s) in the API Key field above and click \"Save Changes\"."}/> </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {providerAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 flex items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 font-semibold">
                          <span>{<UiText source={acc.label}/>}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-sm text-[9px] font-mono ${
                              acc.status === 'CONNECTED'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : acc.status === 'NETWORK_FAILURE' || acc.status === 'INVALID_KEY'
                                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                : 'bg-neutral-200 dark:bg-neutral-800 text-muted'
                            }`}
                          >
                            {acc.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted font-mono truncate">
                          {acc.keyPreview || maskApiKey(acc.apiKey)}
                        </div>
                        {acc.statusMessage && (
                          <div className="text-[10px] opacity-70 italic">{acc.statusMessage}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => testAccount(acc.id)}
                          className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span><UiText source={"Test"}/></span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {try{await removeAccount(acc.id);}catch(error){setSaveResult({ok:false,message:error instanceof Error?error.message:'Could not remove the key.'});}}}
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-rose-500/20 text-muted hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                          title={$t("Remove Key")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Models List */}
      {!isCreatingCustom && activeTab === 'MODELS' && currentProvider && (
        <div className="space-y-4">
          {importResult && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-all ${
                importResult.ok
                  ? 'bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-2 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {importResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span>{importResult.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setImportResult(null)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={$t("Search imported models...")}
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReimportModels}
                disabled={isImportingModels}
                style={{
                  borderColor: 'rgba(var(--accent-rgb), 0.3)',
                  backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
                  color: 'var(--accent-color)',
                }}
                className="px-3.5 py-2 rounded-xl border-2 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isImportingModels ? 'animate-spin' : ''}`} />
                <span>{isImportingModels ? <UiText source={"Importing Models..."}/> : <UiText source={"Re-import Models"}/>}</span>
              </button>
              {providerModels.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAllModelsForProvider(currentProvider.id)}
                  className="px-3 py-2 rounded-xl border-2 border-rose-500/30 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span><UiText source={"Clear All"}/></span>
                </button>
              )}
            </div>
          </div>

          {/* Action controls row: Test all, Enable all, Disable all, Enable healthy & disable failed */}
          {providerModels.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50 text-xs">
              <button
                type="button"
                onClick={handleTestAllModels}
                disabled={isTestingAll}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isTestingAll ? 'animate-spin' : ''}`} />
                <span>
                  {isTestingAll && testAllProgress
                    ? `Testing (${testAllProgress.current}/${testAllProgress.total})...`
                    : <UiText source={"Test All Models"}/>}
                </span>
              </button>

              <button
                type="button"
                onClick={() => enableAllModelsForProvider(currentProvider.id)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span><UiText source={"Enable All"}/></span>
              </button>

              <button
                type="button"
                onClick={() => disableAllModelsForProvider(currentProvider.id)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span><UiText source={"Disable All"}/></span>
              </button>

              <button
                type="button"
                onClick={() => filterWorkingModelsForProvider(currentProvider.id)}
                style={{
                  borderColor: 'rgba(var(--accent-rgb), 0.35)',
                  backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
                  color: 'var(--accent-color)',
                }}
                className="px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                title={$t("Enable all models that passed tests and disable/hide all failed ones")}
              >
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                <span><UiText source={"Enable Active & Disable Failed"}/></span>
              </button>
            </div>
          )}

          {providerModels.length === 0 ? (
            <div className="p-8 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-3 bg-neutral-50/50 dark:bg-neutral-900/30">
              <Layers className="w-8 h-8 mx-auto" style={{ color: 'rgba(var(--accent-rgb), 0.5)' }} />
              <div className="space-y-1">
                <p className="text-xs font-semibold"><UiText source={"No models imported yet for"}/> {currentProvider.name}.</p>
                <p className="text-[11px] text-muted max-w-md mx-auto">
                   <UiText source={"Click \"Import Models\" to fetch models from this provider, or click \"Add Custom Model\" to manually specify a model."}/> </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => importModelsForProvider(currentProvider.id)}
                  style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff' }}
                  className="px-4 py-2 rounded-xl font-semibold text-xs shadow-xs cursor-pointer hover:opacity-95"
                >
                   <UiText source={"Import Models"}/> </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ADD_MANUAL')}
                  className="px-4 py-2 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 font-semibold text-xs cursor-pointer"
                >
                   <UiText source={"Add Custom Model"}/> </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {providerModels
                .filter((m) => {
                  if (!modelSearch) return true;
                  const q = modelSearch.toLowerCase();
                  return (
                    m.displayName.toLowerCase().includes(q) ||
                    m.upstreamId.toLowerCase().includes(q)
                  );
                })
                .map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs transition-all ${
                      !m.visible ? 'opacity-50 grayscale-30' : ''
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                        <ProviderLogo providerId={m.providerId} modelId={m.upstreamId} size="sm" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 font-semibold">
                          <span>{m.displayName}</span>
                          <span className="text-[10px] text-muted font-mono">({m.upstreamId})</span>
                          {m.isCustom && (
                            <span
                              style={{
                                backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                                color: 'var(--accent-color)',
                                borderColor: 'rgba(var(--accent-rgb), 0.3)',
                              }}
                              className="px-1.5 py-0.2 rounded-sm text-[9px] font-mono border"
                            >
                               <UiText source={"Manual"}/> </span>
                          )}
                          {!m.visible && (
                            <span className="px-1.5 py-0.2 rounded-sm text-[9px] bg-neutral-200 dark:bg-neutral-800 text-muted font-mono">
                               <UiText source={"Disabled"}/> </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono text-muted border border-neutral-200 dark:border-neutral-700">
                            {(m.contextWindow / 1000).toFixed(0)}<UiText source={"k ctx"}/> </span>
                          {m.visionCapable && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium">
                               <UiText source={"Vision"}/> </span>
                          )}
                          {m.toolsCapable && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">
                               <UiText source={"Tools"}/> </span>
                          )}
                          {m.reasoningCapable && (
                            <span
                              style={{
                                backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                                color: 'var(--accent-color)',
                              }}
                              className="px-1.5 py-0.5 rounded-md font-medium"
                            >
                               <UiText source={"Reasoning"}/> </span>
                          )}
                          {m.isFree && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
                               <UiText source={"Free"}/> </span>
                          )}
                        </div>

                        {m.lastTestStatus && m.lastTestStatus !== 'UNTESTED' && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {m.lastTestStatus === 'OK' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span><UiText source={"Passed ("}/>{m.lastLatencyMs || 0}<UiText source={"ms)"}/></span>
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold text-[10px]">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span><UiText source={"Failed"}/></span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setErrorModalData({
                                      modelName: m.displayName,
                                      error: m.lastTestDetail || 'Model test failed',
                                    })
                                  }
                                  className="px-2 py-0.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                                  title={$t("View full error details")}
                                >
                                  <Info className="w-2.5 h-2.5" style={{ color: 'var(--accent-color)' }} />
                                  <span><UiText source={"Details"}/></span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestSingleModel(m.id)}
                        disabled={testingModelId === m.id}
                        className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Zap
                          className={`w-3 h-3 ${
                            testingModelId === m.id ? 'animate-spin text-amber-500' : 'text-amber-500'
                          }`}
                        />
                        <span>{testingModelId === m.id ? <UiText source={"Testing..."}/> : <UiText source={"Test"}/>}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleModelVisibility(m.id)}
                        title={$t(m.visible ? 'Hide from picker' : 'Show in picker')}
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
                      >
                        {m.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteModel(m.id)}
                        title={$t("Delete model")}
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-rose-500/20 text-muted hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Add Custom Model Manually */}
      {!isCreatingCustom && activeTab === 'ADD_MANUAL' && currentProvider && (
        <div className="p-5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 space-y-4 max-w-2xl shadow-xs">
          <div className="space-y-1">
            <div className="font-bold text-xs"><UiText source={"Manual Model Specification"}/></div>
            <p className="text-[11px] text-muted">
               <UiText source={"Add any model identifier supported by this endpoint (e.g. fine-tunes or custom deployments)."}/> </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                 <UiText source={"Model ID (Upstream Identifier)"}/> </label>
              <input
                type="text"
                placeholder={$t("e.g. llama-3.3-70b-instruct or gpt-4o-2024-08-06")}
                value={manualModelId}
                onChange={(e) => setManualModelId(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 font-mono shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                 <UiText source={"Display Name"}/> </label>
              <input
                type="text"
                placeholder={$t("e.g. Llama 3.3 70B Custom")}
                value={manualModelName}
                onChange={(e) => setManualModelName(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                 <UiText source={"Context Window (Tokens)"}/> </label>
              <input
                type="number"
                value={manualContextWindow}
                onChange={(e) => setManualContextWindow(parseInt(e.target.value) || 128000)}
                className="w-full bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                 <UiText source={"Max Output Tokens"}/> </label>
              <input
                type="number"
                value={manualMaxOutput}
                onChange={(e) => setManualMaxOutput(parseInt(e.target.value) || 4096)}
                className="w-full bg-white dark:bg-neutral-900/90 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
               <UiText source={"Capabilities"}/> </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualVision}
                  onChange={(e) => setManualVision(e.target.checked)}
                  style={{ accentColor: 'var(--accent-color)' }}
                  className="rounded"
                />
                <span><UiText source={"Vision"}/></span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualTools}
                  onChange={(e) => setManualTools(e.target.checked)}
                  style={{ accentColor: 'var(--accent-color)' }}
                  className="rounded"
                />
                <span><UiText source={"Tools / Calls"}/></span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualReasoning}
                  onChange={(e) => setManualReasoning(e.target.checked)}
                  style={{ accentColor: 'var(--accent-color)' }}
                  className="rounded"
                />
                <span><UiText source={"Reasoning"}/></span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualIsFree}
                  onChange={(e) => setManualIsFree(e.target.checked)}
                  style={{ accentColor: 'var(--accent-color)' }}
                  className="rounded"
                />
                <span><UiText source={"Free Tier"}/></span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveManualModel}
              disabled={!manualModelId.trim()}
              style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff' }}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span><UiText source={"Save & Test Custom Model"}/></span>
            </button>
          </div>
        </div>
      )}

      {/* Error Details Modal */}
      {errorModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span><UiText source={"Model Test Error Details"}/></span>
              </div>
              <button
                type="button"
                onClick={() => setErrorModalData(null)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                 <UiText source={"Model:"}/> <span className="font-mono font-medium" style={{ color: 'var(--accent-color)' }}>{errorModalData.modelName}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-neutral-950 text-rose-800 dark:text-rose-300 font-mono text-[11px] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap break-all border border-rose-200/80 dark:border-neutral-800 text-left">
                {errorModalData.error}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  if (errorModalData?.error) {
                    navigator.clipboard.writeText(errorModalData.error);
                    setCopiedError(true);
                    setTimeout(() => setCopiedError(false), 3000);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-300 flex items-center gap-1.5 cursor-pointer select-none ${
                  copiedError
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 scale-[1.03] shadow-xs font-semibold'
                    : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {copiedError ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                    <span><UiText source={"Copied!"}/></span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 opacity-70" />
                    <span><UiText source={"Copy Error Message"}/></span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorModalData(null);
                  setCopiedError(false);
                }}
                style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff' }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold shadow-xs cursor-pointer hover:opacity-95"
              >
                 <UiText source={"Close"}/> </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
