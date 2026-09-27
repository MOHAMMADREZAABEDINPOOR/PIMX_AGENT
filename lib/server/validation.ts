import 'server-only';
import { z } from 'zod';
import { HttpError } from './errors';

export const idSchema = z.string().min(1).max(140).regex(/^[a-zA-Z0-9_-]+$/);
const text = (max: number) => z.string().max(max);
const boundedNumber = (min: number, max: number) => z.number().finite().min(min).max(max).optional();
export const chatSchema = z.object({ messages: z.array(z.object({ role: z.enum(['user','assistant','system','tool']), content: text(200000), images: z.array(z.string().max(3_000_000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/)).max(8).optional() }).strict()).min(1).max(200), model: text(200).min(1), providerId: idSchema.optional(), credentialId: idSchema.optional(), baseUrl: text(2048).optional(), apiFormat: z.enum(['OPENAI','ANTHROPIC']).optional(), temperature: boundedNumber(0,2), maxTokens: boundedNumber(1,200000), topP: boundedNumber(0,1), systemPrompt: text(100000).optional(), thinking: z.boolean().optional(), stream: z.boolean().optional(), reasoningEffort: z.enum(['LOW','MEDIUM','HIGH']).optional(), reasoningBudget: boundedNumber(0,100000), frequencyPenalty: boundedNumber(-2,2), presencePenalty: boundedNumber(-2,2) }).strict();
export const credentialSchema = z.object({ providerId: idSchema, label: text(100).min(1), apiKey: text(4096).min(1), baseUrl: text(2048).optional(), apiFormat: z.enum(['OPENAI','ANTHROPIC']).default('OPENAI') }).strict();
export const providerTestSchema = z.object({ action: z.enum(['test_connection','test_model','fetch_models']), providerId: idSchema, credentialId: idSchema.optional(), apiKey: text(4096).optional(), baseUrl: text(2048).optional(), apiFormat: z.enum(['OPENAI','ANTHROPIC']).optional(), modelId: text(200).optional() }).strict();
export const titleSchema = z.object({ prompt: text(100000), replySnippet: text(100000).optional(), toolMode: text(32).optional(), model: text(200).optional(), providerId: idSchema.optional(), credentialId: idSchema.optional(), baseUrl: text(2048).optional(), apiFormat: z.enum(['OPENAI','ANTHROPIC']).optional() }).strict();
export const authSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(12).max(128), confirmPassword: z.string().max(128).optional(), username: z.string().trim().min(3).max(32).regex(/^[\p{L}\p{N}_]+$/u).optional(), birthYear: z.number().int().min(1900).max(new Date().getUTCFullYear()).optional(), displayName: z.string().trim().min(1).max(80).optional(), locale: z.enum(['en','fa']).optional(), turnstileToken: text(2048).optional(), website: text(500).default('') }).strict();
export const contactSchema = z.object({ name: z.string().trim().min(1).max(100), message: z.string().trim().min(10).max(5000), website: text(500).default(''), turnstileToken: text(2048).optional() }).strict();
export async function readBody(request: Request, maxBytes: number): Promise<string> {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new HttpError(413, 'This request is too large.');
  const reader = request.body?.getReader(); if (!reader) throw new HttpError(400, 'A request body is required.');
  const decoder = new TextDecoder(); let bytes = 0, raw = '';
  try { while (true) { const { value, done } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > maxBytes) { await reader.cancel(); throw new HttpError(413, 'This request is too large.'); } raw += decoder.decode(value, { stream: true }); } raw += decoder.decode(); } finally { reader.releaseLock(); }
  return raw;
}
export async function readJson<T extends z.ZodType>(request: Request, schema: T, maxBytes = 512 * 1024): Promise<z.infer<T>> {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) throw new HttpError(415, 'Send JSON using application/json.');
  const raw = await readBody(request, maxBytes);
  let json: unknown; try { json = JSON.parse(raw); } catch { throw new HttpError(400, 'The JSON request is invalid.'); }
  const result = schema.safeParse(json); if (!result.success) throw new HttpError(400, `Check ${result.error.issues.slice(0,3).map(issue => issue.path.join('.') || 'request fields').join(', ')}.`, 'VALIDATION_ERROR'); return result.data;
}
