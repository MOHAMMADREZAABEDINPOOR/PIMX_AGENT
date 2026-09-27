export type ApiFormat = 'OPENAI' | 'ANTHROPIC';
export type RoutingStrategy = 'ROUND_ROBIN' | 'PRIORITY' | 'FAILOVER';

export type ChatTool =
  | 'NONE'
  | 'CANVAS'
  | 'ARTIFACTS'
  | 'SOURCE_QA'
  | 'DEEP_RESEARCH'
  | 'DEBATE'
  | 'WEB_DEV'
  | 'LEARN'
  | 'SLIDES'
  | 'MEMORY'
  | 'WEB_SEARCH'
  | 'THINK'
  | 'COMPARE'
  | 'COUNCIL';

export interface SlideItem {
  id: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  codeSnippet?: string;
  speakerNotes?: string;
  accentColor?: string;
  imageUrl?: string;
  imageQuery?: string;
  imageSourceUrl?: string;
  imageCaption?: string;
  imageDisabled?: boolean;
  icon?: string;
  layout?: 'cover' | 'content' | 'split' | 'cards' | 'statement' | 'closing';
}

export interface SlideDeckEntity {
  id: string;
  chatId: string;
  title: string;
  theme: 'MODERN_DARK' | 'CLEAN_LIGHT' | 'CYBERPUNK' | 'MINIMAL_PURPLE';
  slides: SlideItem[];
  updatedAt: number;
}

export type ArtifactKind = 'HTML' | 'REACT' | 'SVG' | 'MERMAID' | 'CODE' | 'DOCUMENT';

export type MemoryScope = 'GLOBAL' | 'PROJECT' | 'CHAT';
export type MemorySource = 'USER' | 'ASSISTANT' | 'IMPORTED';
export type MemoryCategory = 'PREFERENCE' | 'BACKGROUND' | 'INSTRUCTION' | 'PROJECT' | 'FACT';

export type LearnMode = 'SIMPLE' | 'DEEP_DIVE' | 'QUIZ' | 'EXERCISE';

export type AttachmentKind =
  | 'IMAGE'
  | 'PDF'
  | 'TEXT'
  | 'MARKDOWN'
  | 'CODE'
  | 'DATA'
  | 'DOCUMENT'
  | 'ARCHIVE'
  | 'AUDIO'
  | 'VIDEO'
  | 'UNKNOWN';

export interface Attachment {
  id: string;
  name: string;
  kind: AttachmentKind;
  size: number;
  mimeType: string;
  extractedText?: string;
  base64Data?: string; // For vision / images
  url?: string;
  progress?: number;
}

export interface BuiltInModel {
  id: string;
  name: string;
  vision?: boolean;
  tools?: boolean;
  reasoning?: boolean;
  streaming?: boolean;
  free?: boolean;
  contextWindow?: number;
  maxOutputTokens?: number;
  promptPricePerM?: number; // USD per 1M
  completionPricePerM?: number;
  description?: string;
}

export interface ProviderSpec {
  id: string;
  name: string;
  shortName: string;
  baseUrl: string;
  apiFormat: ApiFormat;
  defaultStrategy: RoutingStrategy;
  isLogin?: boolean;
  isCustom?: boolean;
  extraHeadersJson?: string;
  models: BuiltInModel[];
  description?: string;
  iconName?: string;
  iconUrl?: string;
}

export interface AccountEntity {
  id: string;
  providerId: string;
  label: string;
  apiKey: string; // Empty after vault migration; retained for legacy imports only
  credentialId?: string;
  keyPreview?: string;
  sessionToken?: string;
  baseUrlOverride?: string;
  proxy?: string;
  relay?: string;
  extraHeadersJson?: string;
  routingStrategy?: RoutingStrategy;
  priority: number;
  enabled: boolean;
  status: 'CONNECTED' | 'INVALID_KEY' | 'RATE_LIMITED' | 'NO_CREDIT' | 'BANNED' | 'NETWORK_FAILURE' | 'IDLE' | 'UNTESTED';
  statusMessage?: string;
  requestCount: number;
  failureCount: number;
  lastUsedAt?: number;
}

export interface ModelEntity {
  id: string; // e.g. "openai/gpt-4o"
  providerId: string;
  upstreamId: string;
  displayName: string;
  displayId: string;
  apiFormat: ApiFormat;
  targetFormat?: ApiFormat;
  endpoints?: string;
  visionCapable: boolean;
  toolsCapable: boolean;
  reasoningCapable: boolean;
  streamingCapable: boolean;
  contextWindow: number;
  maxOutputTokens: number;
  promptPricePerM: number;
  completionPricePerM: number;
  isFree: boolean;
  builtIn: boolean;
  isCustom: boolean;
  visible: boolean;
  lastTestStatus: 'UNTESTED' | 'OK' | 'FAILED';
  lastTestDetail?: string;
  lastTestedAt?: number;
  lastLatencyMs?: number;
  sortOrder: number;
}

export interface ToolStep {
  id: string;
  toolName: string;
  input: Record<string, any>;
  output?: string;
  status: 'CALLING' | 'DONE' | 'FAILED';
  timestamp: number;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface MessageReaction {
  emoji: string;
  by: 'user' | 'ai';
  at: number;
}

export interface MessageEntity {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  reactions?: MessageReaction[];
  parentId?: string | null;
  groupId?: string | null; // ties fan-out replies together
  superseded?: boolean;
  state: 'PENDING' | 'STREAMING' | 'DONE' | 'ERROR' | 'CANCELLED';
  reasoning?: string;
  reasoningMs?: number;
  toolSteps?: ToolStep[];
  attachments?: Attachment[];
  promptTokens?: number;
  completionTokens?: number;
  usageEstimated?: boolean;
  latencyMs?: number;
  modelId?: string;
  errorCode?: string;
  errorDetail?: string;
  createdAt: number;
}

export interface ChatEntity {
  id: string;
  title: string;
  modelIds: string[]; // CSV or Array for multi-model fan-out
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  webSearchEnabled?: boolean;
  thinkingEnabled?: boolean;
  activeTools?: ChatTool[];
  pinned?: boolean;
  temporary?: boolean;
  projectId?: string;
  personaId?: string;
  toolMode: ChatTool;
  knowledgeBaseIds?: string[];
  toolState?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface ArtifactEntity {
  id: string;
  chatId: string;
  messageId?: string;
  lineage: string;
  title: string;
  kind: ArtifactKind;
  language: string;
  content: string;
  version: number;
  edited?: boolean;
  createdAt: number;
}

export interface SourceEntity {
  id: string;
  chatId?: string;
  knowledgeBaseId?: string;
  title: string;
  origin: string; // URL, filename, or 'paste'
  mime: string;
  content: string;
  contentHash: string;
  chunkCount: number;
  createdAt: number;
}

export interface SourceChunkEntity {
  id: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  termsJson: string; // serialized term frequency map
}

export interface RetrievedPassage {
  sourceId: string;
  sourceTitle: string;
  origin: string;
  chunkIndex: number;
  citation: string; // e.g. [S1:C2]
  content: string;
  score: number;
}

export interface KnowledgeBaseEntity {
  id: string;
  name: string;
  description: string;
  emoji: string;
  colorIndex: number;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MemoryEntity {
  id: string;
  factKey: string;
  content: string;
  scope: MemoryScope;
  projectId?: string;
  chatId?: string;
  category: MemoryCategory;
  source: MemorySource;
  confidence: number; // 0..100
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export type PersonaCategory = 'GENERAL' | 'CODING' | 'WRITING' | 'ANALYSIS' | 'PRODUCTIVITY' | 'ACADEMIC';
export type PersonaResponseStyle = 'DEFAULT' | 'CONCISE' | 'DETAILED' | 'SOCRATIC' | 'FORMAL';

export interface PersonaEntity {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  category?: PersonaCategory;
  instructions: string;
  temperature: number; // -1 means inherit
  topP?: number;
  maxTokens?: number;
  modelId?: string;
  reasoningEffort?: 'OFF' | 'LOW' | 'MEDIUM' | 'HIGH';
  defaultWebSearch?: boolean;
  responseStyle?: PersonaResponseStyle;
  builtIn: boolean;
  createdAt: number;
}

export interface ProjectEntity {
  id: string;
  name: string;
  description: string;
  standingInstructions: string;
  color?: string;
  emoji?: string;
  memoryScope?: 'DEFAULT' | 'PROJECT_ONLY';
  sourceCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface LearningSessionEntity {
  id: string;
  chatId: string;
  topic: string;
  mode: LearnMode;
  completedLessons: number;
  totalLessons: number;
  notes: string;
  createdAt: number;
  updatedAt: number;
  lessons?: { num: number; title: string; completed: boolean }[];
  flashcards?: { question: string; answer: string }[];
}

export interface WebProjectEntity {
  id: string;
  chatId: string;
  name: string;
  framework: string;
  createdAt: number;
  updatedAt: number;
}

export interface WebFileEntity {
  id: string;
  projectId: string;
  path: string;
  language: string;
  content: string;
  version: number;
  createdAt: number;
}

export interface CanvasDocument {
  id: string;
  chatId: string;
  title: string;
  content: string;
  version: number;
  updatedAt: number;
}

export interface LanguageFontsConfig {
  persian: string;
  latin: string;
  arabic: string;
  mono: string;
  japanese?: string;
  korean?: string;
  hebrew?: string;
  devanagari?: string;
  thai?: string;
  cyrillic?: string;
  greek?: string;
  vietnamese?: string;
  serif?: string;
  display?: string;
}

export interface AppSettings {
  themeMode: 'SYSTEM' | 'DARK' | 'LIGHT';
  accent: string;
  themePreset: string;
  customAccentHex: string;
  appFont: string;
  monoFont: string;
  customFontPath: string;
  customFontName: string;
  fontMode?: 'GLOBAL' | 'PER_LANGUAGE';
  languageFonts?: LanguageFontsConfig;
  fontScale: number;
  messageWidth: number;
  uiDensity: number; // 0: Compact, 1: Default, 2: Comfortable
  globalProxy: string;
  globalRelay: string;
  globalSystemPrompt: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  defaultTopP: number;
  streamResponses: boolean;
  autoSyncModels: boolean;
  autoHideFailedModels: boolean;
  freeModelsFirst: boolean;
  verboseNetworkLogs: boolean;
  sendOnEnter: boolean;
  renderMarkdown: boolean;
  showTokenUsage: boolean;
  showCost: boolean;
  showLatency: boolean;
  showModelLine: boolean;
  thinkingMode: boolean;
  expandThinking: boolean;
  agentMode: boolean;
  autoSpeak: boolean;
  ttsVoice: string;
  memoryEnabled: boolean;
  reduceMotion: boolean;
  frequencyPenalty?: number;
  presencePenalty?: number;
  userProfileBio?: string;
  userResponsePreferences?: string;
  reasoningEffort?: 'LOW' | 'MEDIUM' | 'HIGH';
  bubbleStyle?: 'MODERN' | 'GLASS' | 'MINIMAL' | 'CARD';
  fontSizeLevel?: 'SMALL' | 'DEFAULT' | 'LARGE';
  smoothStreaming?: boolean;
  codeBlockWrap?: boolean;
  agentMaxSteps?: number;
  searchDepth?: 'QUICK' | 'DEEP';
  soundOnDone?: boolean;
  responseLanguage?: 'AUTO' | 'FA' | 'EN';
  responseStyle?: 'CONCISE' | 'BALANCED' | 'DETAILED';
  responseTone?: 'NATURAL' | 'PROFESSIONAL' | 'FRIENDLY';
  includeExamples?: boolean;
  contextMessageLimit?: number;
  defaultModelId?: string;
  defaultSlideCount?: number;
  defaultSlideTheme?: SlideDeckEntity['theme'];
  autoDetectTools?: boolean;
  autoOpenWorkspace?: boolean;
  repairOutputs?: boolean;
  defaultWebSearch?: boolean;
  readWebSources?: boolean;
  maxWebSources?: number;
  reasoningBudget?: number;
  workspaceWidth?: number;
  petEnabled?: boolean;
  showAgentActivity?: boolean;
  activityStyle?: 'IMMERSIVE' | 'COMPACT';
  reasoningTextSize?: number;
  reasoningMaxHeight?: number;
  autoScroll?: boolean;
  showReactions?: boolean;
  aiReactions?: boolean;
  showTimestamps?: boolean;
  chatLineHeight?: number;
  temporaryByDefault?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'INFO' | 'WARN' | 'ERROR';
  tag: string;
  message: string;
  detail?: string;
}

export interface UsageLine {
  modelId: string;
  providerId: string;
  requests: number;
  promptTokens: number;
  completionTokens: number;
  estimatedSpendUsd: number;
  estimatedTokens: boolean;
}

export interface CustomFontEntity {
  id: string;
  name: string;
  fontFamily: string;
  fileBase64?: string;
  format?: 'woff2' | 'woff' | 'ttf' | 'otf';
  url?: string;
  createdAt: number;
}
