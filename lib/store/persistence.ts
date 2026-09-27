/** Persist only saved conversations and their children. Temporary content stays in RAM. */
import type { ChatEntity, MessageEntity, ArtifactEntity, CanvasDocument, WebProjectEntity, WebFileEntity, SlideDeckEntity, LearningSessionEntity, MemoryEntity, SourceEntity, SourceChunkEntity, LogEntry } from '../types';
interface ConversationData {
  chats: ChatEntity[]; messages: Record<string, MessageEntity[]>; artifacts: ArtifactEntity[];
  canvasDocuments: Record<string, CanvasDocument>; webProjects: Record<string, WebProjectEntity>;
  webFiles: Record<string, WebFileEntity[]>; slideDecks: Record<string, SlideDeckEntity>;
  learningSessions: Record<string, LearningSessionEntity>; memories: MemoryEntity[];
  sources: SourceEntity[]; sourceChunks: SourceChunkEntity[]; logs: LogEntry[];
}
export function savedConversationData(state: ConversationData) {
  const chats = state.chats.filter(c => !c.temporary);
  const ids = new Set(chats.map(c => c.id));
  const records = <T,>(value: Record<string, T>) => Object.fromEntries(Object.entries(value).filter(([id]) => ids.has(id))) as Record<string, T>;
  const sources = state.sources.filter(s => !s.chatId || ids.has(s.chatId));
  const sourceIds = new Set(sources.map(s => s.id));
  return {
    chats,
    messages: records(state.messages),
    artifacts: state.artifacts.filter(a => ids.has(a.chatId)),
    canvasDocuments: records(state.canvasDocuments),
    webProjects: records(state.webProjects),
    webFiles: records(state.webFiles),
    slideDecks: records(state.slideDecks),
    learningSessions: records(state.learningSessions),
    memories: state.memories.filter(m => !m.chatId || ids.has(m.chatId)),
    sources,
    sourceChunks: state.sourceChunks.filter(c => sourceIds.has(c.sourceId)),
    // Diagnostics may include prompt snippets. Keep them in memory while a temporary chat exists.
    logs: state.chats.some(c => c.temporary) ? [] : state.logs.slice(0, 100),
  };
}
