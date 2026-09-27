import { ProviderSpec, BuiltInModel, ModelEntity } from '../types';

export const VISIBLE_PROVIDERS: ProviderSpec[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'PRIORITY',
    description: 'GPT-4o, o1, o3-mini, and standard chat completions',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (Omni)', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, promptPricePerM: 2.5, completionPricePerM: 10.0 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 16384, promptPricePerM: 0.15, completionPricePerM: 0.6, free: false },
      { id: 'o1', name: 'OpenAI o1', vision: true, tools: true, reasoning: true, streaming: true, contextWindow: 200000, maxOutputTokens: 100000, promptPricePerM: 15.0, completionPricePerM: 60.0 },
      { id: 'o3-mini', name: 'OpenAI o3-mini', vision: false, tools: true, reasoning: true, streaming: true, contextWindow: 200000, maxOutputTokens: 100000, promptPricePerM: 1.1, completionPricePerM: 4.4 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, promptPricePerM: 10.0, completionPricePerM: 30.0 },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    shortName: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    apiFormat: 'ANTHROPIC',
    defaultStrategy: 'PRIORITY',
    description: 'Claude 3.7 Sonnet, Claude 3.5 Haiku, Claude 3 Opus',
    models: [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', vision: true, tools: true, reasoning: true, streaming: true, contextWindow: 200000, maxOutputTokens: 64000, promptPricePerM: 3.0, completionPricePerM: 15.0 },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 200000, maxOutputTokens: 8192, promptPricePerM: 3.0, completionPricePerM: 15.0 },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 200000, maxOutputTokens: 8192, promptPricePerM: 0.8, completionPricePerM: 4.0 },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 200000, maxOutputTokens: 4096, promptPricePerM: 15.0, completionPricePerM: 75.0 },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    shortName: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiFormat: 'OPENAI',
    defaultStrategy: 'ROUND_ROBIN',
    description: 'Gemini 2.5 Pro, 2.5 Flash, 2.0 Flash Lite with native multimodal & search',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', vision: true, tools: true, reasoning: true, streaming: true, contextWindow: 1048576, maxOutputTokens: 8192, promptPricePerM: 0.1, completionPricePerM: 0.4, free: true },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 1048576, maxOutputTokens: 8192, promptPricePerM: 0.05, completionPricePerM: 0.2, free: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', vision: true, tools: true, reasoning: true, streaming: true, contextWindow: 2097152, maxOutputTokens: 8192, promptPricePerM: 1.25, completionPricePerM: 5.0 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 1048576, maxOutputTokens: 8192, promptPricePerM: 0.075, completionPricePerM: 0.3, free: true },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    shortName: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'PRIORITY',
    description: 'DeepSeek-V3 and DeepSeek-R1 reasoning models',
    models: [
      { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoner)', vision: false, tools: true, reasoning: true, streaming: true, contextWindow: 64000, maxOutputTokens: 8192, promptPricePerM: 0.55, completionPricePerM: 2.19 },
      { id: 'deepseek-chat', name: 'DeepSeek V3 (Chat)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 64000, maxOutputTokens: 8192, promptPricePerM: 0.14, completionPricePerM: 0.28 },
    ],
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    shortName: 'xai',
    baseUrl: 'https://api.x.ai/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'PRIORITY',
    description: 'Grok 2, Grok 2 Vision, Grok 3',
    models: [
      { id: 'grok-2-1212', name: 'Grok 2', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, promptPricePerM: 2.0, completionPricePerM: 10.0 },
      { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 32000, maxOutputTokens: 4096, promptPricePerM: 2.0, completionPricePerM: 10.0 },
      { id: 'grok-beta', name: 'Grok Beta', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, promptPricePerM: 5.0, completionPricePerM: 15.0 },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    shortName: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'ROUND_ROBIN',
    description: 'Ultra-fast LPU inference for Llama 3.3, DeepSeek R1, Gemma 2',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 32768, promptPricePerM: 0.59, completionPricePerM: 0.79, free: true },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B', vision: false, tools: true, reasoning: true, streaming: true, contextWindow: 128000, maxOutputTokens: 8192, promptPricePerM: 0.75, completionPricePerM: 0.99, free: true },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Groq)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 32768, maxOutputTokens: 4096, promptPricePerM: 0.24, completionPricePerM: 0.24, free: true },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B (Groq)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 8192, maxOutputTokens: 4096, promptPricePerM: 0.2, completionPricePerM: 0.2, free: true },
    ],
  },
  {
    id: 'moonshot',
    name: 'Moonshot (Kimi)',
    shortName: 'moonshot',
    baseUrl: 'https://api.moonshot.cn/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'PRIORITY',
    description: 'Moonshot Kimi 8k, 32k, 128k context models',
    models: [
      { id: 'moonshot-v1-128k', name: 'Moonshot Kimi 128k', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, promptPricePerM: 1.5, completionPricePerM: 1.5 },
      { id: 'moonshot-v1-32k', name: 'Moonshot Kimi 32k', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 32000, maxOutputTokens: 4096, promptPricePerM: 0.8, completionPricePerM: 0.8 },
      { id: 'moonshot-v1-8k', name: 'Moonshot Kimi 8k', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 8000, maxOutputTokens: 4096, promptPricePerM: 0.2, completionPricePerM: 0.2 },
    ],
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    shortName: 'minimax',
    baseUrl: 'https://api.minimax.chat/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'PRIORITY',
    description: 'MiniMax abab 6.5 and text models with long context',
    models: [
      { id: 'abab6.5s-chat', name: 'MiniMax abab 6.5s', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 245760, maxOutputTokens: 4096, promptPricePerM: 0.15, completionPricePerM: 0.15 },
      { id: 'abab6.5-chat', name: 'MiniMax abab 6.5', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 245760, maxOutputTokens: 4096, promptPricePerM: 0.5, completionPricePerM: 0.5 },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    shortName: 'mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'PRIORITY',
    description: 'Mistral Large 2, Mistral Small, Codestral, Pixtral',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large 2', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, promptPricePerM: 2.0, completionPricePerM: 6.0 },
      { id: 'pixtral-large-latest', name: 'Pixtral Large (Vision)', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, promptPricePerM: 2.0, completionPricePerM: 6.0 },
      { id: 'codestral-latest', name: 'Codestral (Code)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 256000, maxOutputTokens: 8192, promptPricePerM: 0.2, completionPricePerM: 0.6 },
      { id: 'mistral-small-latest', name: 'Mistral Small', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 32000, maxOutputTokens: 4096, promptPricePerM: 0.2, completionPricePerM: 0.6, free: false },
    ],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    shortName: 'nvidia',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'ROUND_ROBIN',
    description: 'NVIDIA hosted NIM endpoints (Llama 3.1 405B, Nemotron)',
    models: [
      { id: 'meta/llama-3.1-405b-instruct', name: 'Llama 3.1 405B (NVIDIA)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, free: true },
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B (NVIDIA)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, free: true },
      { id: 'deepseek-ai/deepseek-r1', name: 'DeepSeek R1 (NVIDIA)', vision: false, tools: true, reasoning: true, streaming: true, contextWindow: 128000, maxOutputTokens: 8192, free: true },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    shortName: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'ROUND_ROBIN',
    description: 'Local on-premise AI models running through Ollama',
    models: [
      { id: 'llama3.3:latest', name: 'Llama 3.3 (Local)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 8192, maxOutputTokens: 4096, free: true },
      { id: 'qwen2.5-coder:latest', name: 'Qwen 2.5 Coder (Local)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 32768, maxOutputTokens: 8192, free: true },
      { id: 'deepseek-r1:latest', name: 'DeepSeek R1 (Local)', vision: false, tools: true, reasoning: true, streaming: true, contextWindow: 32768, maxOutputTokens: 8192, free: true },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    shortName: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'FAILOVER',
    description: 'Unified aggregator across 200+ AI models including free tiers',
    models: [
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', vision: true, tools: true, reasoning: true, streaming: true, contextWindow: 1048576, maxOutputTokens: 8192, promptPricePerM: 0, completionPricePerM: 0, free: true },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free OpenRouter)', vision: false, tools: true, reasoning: true, streaming: true, contextWindow: 64000, maxOutputTokens: 8192, promptPricePerM: 0, completionPricePerM: 0, free: true },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 8192, promptPricePerM: 0, completionPricePerM: 0, free: true },
      { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet (Router)', vision: true, tools: true, reasoning: true, streaming: true, contextWindow: 200000, maxOutputTokens: 8192, promptPricePerM: 3.0, completionPricePerM: 15.0 },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    shortName: 'perplexity',
    baseUrl: 'https://api.perplexity.ai',
    apiFormat: 'OPENAI',
    defaultStrategy: 'PRIORITY',
    description: 'Online live web search grounded models',
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro (Search)', vision: false, tools: false, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 8192, promptPricePerM: 3.0, completionPricePerM: 15.0 },
      { id: 'sonar', name: 'Sonar (Search)', vision: false, tools: false, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, promptPricePerM: 1.0, completionPricePerM: 1.0 },
      { id: 'sonar-reasoning-pro', name: 'Sonar Reasoning Pro', vision: false, tools: false, reasoning: true, streaming: true, contextWindow: 128000, maxOutputTokens: 8192, promptPricePerM: 5.0, completionPricePerM: 20.0 },
    ],
  },
  {
    id: 'dashscope',
    name: 'DashScope (Qwen)',
    shortName: 'dashscope',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'PRIORITY',
    description: 'Alibaba Qwen 2.5, Qwen Max, Qwen Plus, Qwen Coder',
    models: [
      { id: 'qwen-max', name: 'Qwen Max', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 32000, maxOutputTokens: 8192, promptPricePerM: 2.8, completionPricePerM: 8.4 },
      { id: 'qwen-plus', name: 'Qwen Plus', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 8192, promptPricePerM: 0.5, completionPricePerM: 1.5 },
      { id: 'qwen2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 8192, promptPricePerM: 0.3, completionPricePerM: 0.8 },
      { id: 'qwen-vl-max', name: 'Qwen VL Max (Vision)', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 32000, maxOutputTokens: 4096, promptPricePerM: 2.8, completionPricePerM: 8.4 },
    ],
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi (MiMo)',
    shortName: 'xiaomi',
    baseUrl: 'https://api.mimo.xiaomi.com/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'PRIORITY',
    description: 'Xiaomi MiMo enterprise AI models',
    models: [
      { id: 'mimo-pro', name: 'Xiaomi MiMo Pro', vision: true, tools: true, reasoning: false, streaming: true, contextWindow: 64000, maxOutputTokens: 4096, promptPricePerM: 0.6, completionPricePerM: 1.8 },
      { id: 'mimo-lite', name: 'Xiaomi MiMo Lite', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 32000, maxOutputTokens: 4096, promptPricePerM: 0.1, completionPricePerM: 0.3, free: true },
    ],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    shortName: 'huggingface',
    baseUrl: 'https://api-inference.huggingface.co/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'ROUND_ROBIN',
    description: 'Hugging Face serverless inference API endpoints',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B (HF)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, free: true },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B v0.3 (HF)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 32768, maxOutputTokens: 4096, free: true },
    ],
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Workers AI',
    shortName: 'cloudflare',
    baseUrl: 'https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1',
    apiFormat: 'OPENAI',
    defaultStrategy: 'ROUND_ROBIN',
    description: 'Edge-distributed Workers AI serverless endpoints',
    models: [
      { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', name: 'Llama 3.3 70B (Cloudflare)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 128000, maxOutputTokens: 4096, free: true },
      { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', name: 'DeepSeek R1 32B (Cloudflare)', vision: false, tools: true, reasoning: true, streaming: true, contextWindow: 32768, maxOutputTokens: 4096, free: true },
      { id: '@cf/meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B (Cloudflare)', vision: false, tools: true, reasoning: false, streaming: true, contextWindow: 8192, maxOutputTokens: 2048, free: true },
    ],
  },
];

export function buildModelsForProvider(provider: ProviderSpec, startIndex = 0): ModelEntity[] {
  return provider.models.map((m, idx) => ({
    id: `${provider.id}/${m.id}`,
    providerId: provider.id,
    upstreamId: m.id,
    displayName: m.name,
    displayId: `${provider.shortName}/${m.id}`,
    apiFormat: provider.apiFormat,
    endpoints: 'chat',
    visionCapable: !!m.vision,
    toolsCapable: !!m.tools,
    reasoningCapable: !!m.reasoning,
    streamingCapable: m.streaming ?? true,
    contextWindow: m.contextWindow || 32000,
    maxOutputTokens: m.maxOutputTokens || 4096,
    promptPricePerM: m.promptPricePerM || 0,
    completionPricePerM: m.completionPricePerM || 0,
    isFree: !!m.free,
    builtIn: !provider.isCustom,
    isCustom: !!provider.isCustom,
    visible: true,
    lastTestStatus: 'UNTESTED',
    sortOrder: startIndex + idx,
  }));
}

export function parseBulkApiKeys(
  rawText: string,
  providerId: string
): Array<{ apiKey: string; label: string }> {
  if (!rawText || !rawText.trim()) return [];

  // Split by newlines, commas, or semicolons
  const lines = rawText.split(/\r?\n|[,;]/).map((l) => l.trim()).filter(Boolean);
  const result: Array<{ apiKey: string; label: string }> = [];

  lines.forEach((line, index) => {
    let key = line.trim();
    let label = `${providerId.toUpperCase()} Key #${index + 1}`;

    // Format: "sk-xxxx [Key Label]"
    const matchBracket = line.match(/^(\S+)\s*\[(.*?)\]$/);
    // Format: "sk-xxxx // Key Label" or "sk-xxxx # Key Label"
    const matchComment = line.match(/^(\S+)\s*(?:\/\/|#)\s*(.+)$/);

    if (matchBracket) {
      key = matchBracket[1].trim();
      label = matchBracket[2].trim() || label;
    } else if (matchComment) {
      key = matchComment[1].trim();
      label = matchComment[2].trim() || label;
    }

    if (key.length >= 3) {
      result.push({ apiKey: key, label });
    }
  });

  return result;
}

export function buildInitialModelEntities(): ModelEntity[] {
  return [];
}

export function qualifyModelId(providerId: string, upstreamId: string): string {
  return `${providerId}/${upstreamId}`;
}

export function parseModelId(qualifiedId: string): { providerId: string; upstreamId: string } {
  const parts = qualifiedId.split('/');
  if (parts.length >= 2) {
    return { providerId: parts[0], upstreamId: parts.slice(1).join('/') };
  }
  return { providerId: 'custom', upstreamId: qualifiedId };
}
