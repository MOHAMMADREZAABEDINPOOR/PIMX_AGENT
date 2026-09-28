import { requireWorkspace, checkOrigin } from '@/lib/server/workspace';
import { readJson, chatSchema } from '@/lib/server/validation';
import { resolveCredential } from '@/lib/server/credentials';
import { apiFailure } from '@/lib/server/errors';
import { rateLimit } from '@/lib/server/rate-limit';
import { safeFetch as secureFetch } from '@/lib/server/network';
const safeFetch = (url: string, options: RequestInit = {}) => secureFetch(url, options, true);
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequestBody {
  messages: Array<{
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    images?: string[]; // base64 images
  }>;
  model: string;
  providerId?: string;
  credentialId?: string;
  baseUrl?: string;
  apiFormat?: 'OPENAI' | 'ANTHROPIC';
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
  thinking?: boolean;
  stream?: boolean;
  reasoningEffort?: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoningBudget?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

type RequestOptions = Pick<ChatRequestBody, 'stream' | 'reasoningEffort' | 'reasoningBudget' | 'frequencyPenalty' | 'presencePenalty'> & { providerId?: string; signal?: AbortSignal };
function completedSse(content: string, reasoning = '') {
  return new Response(`data: ${JSON.stringify({ choices: [{ delta: { content, reasoning_content: reasoning } }] })}\n\ndata: [DONE]\n\n`, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const user = await requireWorkspace(req);
    await rateLimit('chatSchema:'+user.id, 120, 60*1000);
    const validated = await readJson(req, chatSchema, 12*1024*1024);
    const resolved = await resolveCredential(user.id, validated);
    const body = { ...validated, apiKey: resolved.apiKey, baseUrl: resolved.baseUrl, apiFormat: resolved.apiFormat as 'OPENAI' | 'ANTHROPIC' };
    const {
      messages,
      model,
      providerId = 'gemini',
      apiKey,
      baseUrl,
      apiFormat = 'OPENAI',
      temperature = 0.7,
      maxTokens = 4096,
      topP = 1.0,
      systemPrompt = '',
      thinking = false,
    } = body;
    const options: RequestOptions = { stream: body.stream !== false, reasoningEffort: body.reasoningEffort, reasoningBudget: body.reasoningBudget, frequencyPenalty: body.frequencyPenalty, presencePenalty: body.presencePenalty, providerId, signal: req.signal };
    const upstreamId = model.startsWith(`${providerId}/`) ? model.slice(providerId.length + 1) : model;

    // Verify API key before dispatching
    const keyToUse = apiKey;
    if (!keyToUse) {
      return NextResponse.json(
        {
          error: {
            message: `No API key configured for ${providerId.toUpperCase()}. Please configure your API key in Settings > Providers.`,
          },
        },
        { status: 400 }
      );
    }

    // Handle Gemini using GoogleGenAI
    if (providerId === 'gemini') {
      return await handleGeminiServerGenAI(
        keyToUse,
        model,
        messages,
        systemPrompt,
        temperature,
        maxTokens,
        thinking,
        options
      );
    }

    // Direct proxy to Upstream Provider (OpenAI, Anthropic, DeepSeek, Groq, OpenRouter, etc.)
    if (apiFormat === 'ANTHROPIC') {
      return await handleAnthropicUpstream(
        baseUrl || 'https://api.anthropic.com/v1',
        keyToUse,
        upstreamId,
        messages,
        systemPrompt,
        temperature,
        maxTokens,
        topP,
        thinking,
        options
      );
    } else {
      return await handleOpenAIUpstream(
        baseUrl || 'https://api.openai.com/v1',
        keyToUse,
        upstreamId,
        messages,
        systemPrompt,
        temperature,
        maxTokens,
        topP,
        { ...options, reasoningEffort: thinking ? options.reasoningEffort : 'LOW' }
      );
    }
  } catch (error: unknown) { return apiFailure(error); }
}

async function handleGeminiServerGenAI(
  serverKey: string,
  modelName: string,
  messages: Array<{ role: string; content: string; images?: string[] }>,
  systemPrompt: string,
  temperature: number,
  maxTokens: number,
  thinking: boolean = false,
  options: RequestOptions = {}
) {
  const ai = new GoogleGenAI({ apiKey: serverKey });
  // Clean all prefixes: "gemini/models/gemini-..." -> "gemini-..."
  const cleanModel = modelName
    .replace(/^gemini\//, '')
    .replace(/^models\//, '')
    .trim();

  // Convert messages to Gemini format and sanitize
  const validMessages = messages.filter(
    (m) => m.role !== 'system' && (m.content?.trim() || (m.images && m.images.length > 0))
  );

  if (validMessages.length === 0) {
    validMessages.push({ role: 'user', content: 'Hello' });
  }

  const formattedContents: any[] = [];
  for (const m of validMessages) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts: any[] = [];
    if (m.content?.trim()) {
      parts.push({ text: m.content.trim() });
    }
    if (m.images && m.images.length > 0) {
      for (const img of m.images) {
        const match = img.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      }
    }
    if (parts.length > 0) {
      // Merge consecutive same-role messages to satisfy Gemini API constraints
      const prev = formattedContents[formattedContents.length - 1];
      if (prev && prev.role === role) {
        prev.parts.push(...parts);
      } else {
        formattedContents.push({ role, parts });
      }
    }
  }

  const baseConfig: any = {
    temperature,
    maxOutputTokens: maxTokens,
  };
  if (systemPrompt) {
    baseConfig.systemInstruction = systemPrompt;
  }
  const configWithThinking = thinking
    ? { ...baseConfig, thinkingConfig: /^gemini-[3-9]/.test(cleanModel) ? { thinkingLevel: (options.reasoningEffort || 'MEDIUM'), includeThoughts: true } : { thinkingBudget: Math.max(1024, Math.min(options.reasoningBudget || 2048, maxTokens - 512)), includeThoughts: true } }
    : /^gemini-[3-9]/.test(cleanModel)
      ? { ...baseConfig, thinkingConfig: { thinkingLevel: /pro|gemini-3\.[78]-flash(?!-lite)/i.test(cleanModel) ? 'LOW' : 'MINIMAL', includeThoughts: false } }
      : /^gemini-2\.5/.test(cleanModel)
        ? { ...baseConfig, thinkingConfig: { thinkingBudget: /pro/i.test(cleanModel) ? 128 : 0, includeThoughts: false } }
        : baseConfig;

  try {
    if (options.stream === false) {
      const response = await ai.models.generateContent({ model: cleanModel, contents: formattedContents, config: configWithThinking });
      const parts = response.candidates?.[0]?.content?.parts || [];
      return completedSse(parts.filter(p => !p.thought).map(p => p.text || '').join(''), parts.filter(p => p.thought).map(p => p.text || '').join(''));
    }
    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: cleanModel || 'gemini-2.0-flash',
        contents: formattedContents as any,
        config: configWithThinking,
      });
    } catch (modelErr: any) {
      const msg = String(modelErr?.message || modelErr);
      // Model rejects thinkingConfig (e.g. older flash models) — retry plain.
      if (thinking && (modelErr.status === 400 || /thinking/i.test(msg))) {
        console.warn(`[Gemini] Thinking not supported by ${cleanModel}, retrying without thinkingConfig...`);
        responseStream = await ai.models.generateContentStream({
          model: cleanModel || 'gemini-2.0-flash',
          contents: formattedContents as any,
          config: baseConfig,
        });
      } else {
        throw modelErr;
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            let text = '';
            let thought = '';
            // Native thinking parts (thought === true) go to the reasoning channel.
            const parts = (chunk as any).candidates?.[0]?.content?.parts;
            if (Array.isArray(parts)) {
              for (const p of parts) {
                if (typeof p?.text === 'string' && p.text) {
                  if (p.thought === true) thought += p.text;
                  else text += p.text;
                }
              }
            } else {
              try {
                text = typeof (chunk as any).text === 'function' ? (chunk as any).text() : ((chunk as any).text || '');
              } catch {
                text = (chunk as any).candidates?.[0]?.content?.parts?.[0]?.text || '';
              }
            }
            if (text || thought) {
              const delta: any = {};
              if (text) delta.content = text;
              if (thought) delta.reasoning_content = thought;
              const sseData = `data: ${JSON.stringify({
                choices: [{ delta }],
              })}\n\n`;
              controller.enqueue(encoder.encode(sseData));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err: any) {
          controller.error(new Error('The provider stream was interrupted.'));
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'private, no-store',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    const status = err.status || 500;
    let message = err.message || 'Gemini API call failed';
    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message);
        if (parsed?.error?.message) {
          message = parsed.error.message;
        }
      } catch {}
    }
    return NextResponse.json(
      { error: { message: `Google Gemini (${cleanModel}): The provider request failed.` } },
      { status }
    );
  }
}

async function handleOpenAIUpstream(
  baseUrl: string,
  apiKey: string,
  modelName: string,
  messages: Array<{ role: string; content: string; images?: string[] }>,
  systemPrompt: string,
  temperature: number,
  maxTokens: number,
  topP: number,
  options: RequestOptions = {}
) {
  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const upstreamModel = modelName;

  const openaiMessages: any[] = [];
  if (systemPrompt) {
    openaiMessages.push({ role: 'system', content: systemPrompt });
  }

  for (const m of messages) {
    if (m.images && m.images.length > 0) {
      const contentParts: any[] = [{ type: 'text', text: m.content || '' }];
      for (const img of m.images) {
        contentParts.push({
          type: 'image_url',
          image_url: { url: img },
        });
      }
      openaiMessages.push({ role: m.role, content: contentParts });
    } else {
      openaiMessages.push({ role: m.role, content: m.content });
    }
  }

  const reasoningModel = options.providerId === 'openai' && /^(o[1-9]|gpt-[5-9])/.test(upstreamModel);
  const res = await safeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: upstreamModel,
      messages: openaiMessages,
      ...(reasoningModel ? { max_completion_tokens: maxTokens, ...(options.reasoningEffort ? { reasoning_effort: options.reasoningEffort.toLowerCase() } : {}) } : { temperature, max_tokens: maxTokens, top_p: topP, ...(options.frequencyPenalty ? { frequency_penalty: options.frequencyPenalty } : {}), ...(options.presencePenalty ? { presence_penalty: options.presencePenalty } : {}) }),
      stream: options.stream !== false,
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    await res.body?.cancel();
    return NextResponse.json(
      { error: { message: `Upstream HTTP ${res.status}: The provider rejected this request.` } },
      { status: res.status }
    );
  }

  if (options.stream === false) {
    const data = await res.json();
    return completedSse(data.choices?.[0]?.message?.content || '', data.choices?.[0]?.message?.reasoning_content || '');
  }
  return new Response(res.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'private, no-store',
      Connection: 'keep-alive',
    },
  });
}

async function handleAnthropicUpstream(
  baseUrl: string,
  apiKey: string,
  modelName: string,
  messages: Array<{ role: string; content: string; images?: string[] }>,
  systemPrompt: string,
  temperature: number,
  maxTokens: number,
  topP: number,
  thinking: boolean,
  options: RequestOptions = {}
) {
  const url = `${baseUrl.replace(/\/+$/, '')}/messages`;
  const upstreamModel = modelName;

  const anthropicMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  const payload: any = {
    model: upstreamModel,
    messages: anthropicMessages,
    max_tokens: maxTokens || 4096,
    temperature,
    stream: options.stream !== false,
  };

  if (systemPrompt) {
    payload.system = systemPrompt;
  }
  if (thinking) {
    if (payload.max_tokens <= 1024) return NextResponse.json({ error: { message: 'Extended thinking requires an output token limit above 1024. Increase Max Tokens in Prompt & Model Defaults.' } }, { status: 400 });
    payload.thinking = { type: 'enabled', budget_tokens: Math.max(1024, Math.min(options.reasoningBudget || 2048, payload.max_tokens - 512)) };
    delete payload.temperature;
  } else {
    payload.top_p = topP;
  }

  const res = await safeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  if (!res.ok) {
    await res.body?.cancel();
    return NextResponse.json(
      { error: { message: `Anthropic HTTP ${res.status}: The provider rejected this request.` } },
      { status: res.status }
    );
  }

  if (options.stream === false) {
    const data = await res.json();
    return completedSse((data.content || []).filter((p: any) => p.type === 'text').map((p: any) => p.text).join(''), (data.content || []).filter((p: any) => p.type === 'thinking').map((p: any) => p.thinking).join(''));
  }
  return new Response(res.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'private, no-store',
      Connection: 'keep-alive',
    },
  });
}
