import { requireUser, checkOrigin } from '@/lib/server/session';
import { readJson, titleSchema } from '@/lib/server/validation';
import { resolveCredential } from '@/lib/server/credentials';
import { apiFailure } from '@/lib/server/errors';
import { rateLimit } from '@/lib/server/rate-limit';
import { safeFetch as secureFetch } from '@/lib/server/network';
const safeFetch = (url: string, options: RequestInit = {}) => secureFetch(url, options, true);
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TitleRequestBody {
  prompt: string;
  replySnippet?: string;
  toolMode?: string;
  model?: string;
  providerId?: string;
  credentialId?: string;
  baseUrl?: string;
  apiFormat?: 'OPENAI' | 'ANTHROPIC';
}

export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const user = await requireUser(req);
    await rateLimit('titleSchema:'+user.id, 120, 60*1000);
    const validated = await readJson(req, titleSchema, 256*1024);
    const resolved = await resolveCredential(user.id, validated);
    const body = { ...validated, apiKey: resolved.apiKey, baseUrl: resolved.baseUrl, apiFormat: resolved.apiFormat as 'OPENAI' | 'ANTHROPIC' };
    const {
      prompt,
      replySnippet = '',
      toolMode,
      model = 'gemini-2.0-flash',
      providerId = 'gemini',
      apiKey,
      baseUrl,
      apiFormat = 'OPENAI',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ title: 'New Conversation' });
    }

    const keyToUse = apiKey;
    if (!keyToUse) {
      return NextResponse.json({ title: extractFallbackTitle(prompt, toolMode) });
    }

    const systemInstruction = `You are an elite title generator for an AI platform (like ChatGPT and Gemini).
Your task is to generate a concise, elegant, and descriptive title (strictly 2 to 5 words, maximum 35 characters) representing the core topic and essence of the conversation.
CRITICAL RULES:
1. Language: Output ONLY in the exact same language as the user's prompt (Persian for Persian, English for English).
2. Essence over command: Focus on the subject matter, not the command. For example:
   - "ی اسلاید برام درست کن درمورد ماشین های بنز" -> "اسلایدهای مرسدس بنز"
   - "یک سایت فروشگاهی برام طراحی کن" -> "طراحی فروشگاه آنلاین"
   - "سلام چطوری؟" -> "شروع گفتگو"
   - "الگوریتم جستجوی عمقی رو توضیح بده" -> "الگوریتم جستجوی عمقی (DFS)"
3. Output format: Return ONLY the raw title text. No quotation marks, no markdown, no punctuation at the end, and no labels like "Title:".`;

    const userMessageContent = `User Prompt: ${prompt.trim().slice(0, 300)}${
      replySnippet ? `\nAssistant Summary: ${replySnippet.slice(0, 200)}` : ''
    }`;

    let rawTitle = '';

    if (providerId === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: keyToUse });
      const cleanModel = model
        .replace(/^gemini\//, '')
        .replace(/^models\//, '')
        .trim() || 'gemini-2.0-flash';

      try {
        const response = await ai.models.generateContent({
          model: cleanModel,
          contents: [{ role: 'user', parts: [{ text: userMessageContent }] }],
          config: {
            systemInstruction,
            temperature: 0.3,
            maxOutputTokens: 30,
          },
        });
        rawTitle = response.text || '';
      } catch {
        // Fallback to gemini-2.0-flash if preview/custom model failed
        try {
          const fallbackResp = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: userMessageContent }] }],
            config: {
              systemInstruction,
              temperature: 0.3,
              maxOutputTokens: 30,
            },
          });
          rawTitle = fallbackResp.text || '';
        } catch {
          rawTitle = '';
        }
      }
    } else if (apiFormat === 'ANTHROPIC') {
      const url = `${(baseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, '')}/messages`;
      const res = await safeFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model.replace(/^anthropic\//, ''),
          system: systemInstruction,
          messages: [{ role: 'user', content: userMessageContent }],
          max_tokens: 30,
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        rawTitle = data.content?.[0]?.text || '';
      }
    } else {
      // OpenAI-compatible
      const url = `${(baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '')}/chat/completions`;
      const res = await safeFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: model.includes('/') ? model.split('/')[1] : model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userMessageContent },
          ],
          max_tokens: 30,
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        rawTitle = data.choices?.[0]?.message?.content || '';
      }
    }

    const cleanTitle = cleanUpGeneratedTitle(rawTitle) || extractFallbackTitle(prompt, toolMode);
    return NextResponse.json({ title: cleanTitle });
  } catch (error) {
    return apiFailure(error);
  }
}

function cleanUpGeneratedTitle(title: string): string {
  if (!title) return '';
  let cleaned = title
    .replace(/^["'«“`]+|["'»”`]+$/g, '')
    .replace(/^(Title|عنوان|موضوع|Subject)\s*[:：\-—]\s*/i, '')
    .replace(/[#*`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip trailing periods or commas
  cleaned = cleaned.replace(/[.,:;!?،؟]+$/, '').trim();

  if (cleaned.length > 40) {
    cleaned = cleaned.slice(0, 40).trim();
  }
  return cleaned;
}

function extractFallbackTitle(prompt: string, toolMode?: string): string {
  if (!prompt) return 'New Conversation';

  let text = prompt.trim();

  // Greeting check
  if (/^(سلام|درود|hi|hello|hey|good morning|good evening)[!.,\s]*$/i.test(text)) {
    return 'شروع گفتگو و احوالپرسی';
  }

  // Strip conversational Persian boilerplates
  text = text
    .replace(/^(سلام|درود|لطفا|لطفاً|میشه|میتونی|میخواستم|میخوام)\s+/i, '')
    .replace(/^(ی|یک)?\s*(اسلاید|ارائه|پرزنتیشن)\s*(برام|برای من)?\s*(درست کن|بساز|آماده کن|طراحی کن)\s*(در مورد|درمورد|درباره|راجع به)?\s*/i, 'اسلاید ')
    .replace(/^(ی|یک)?\s*(سایت|وبسایت|پروژه وب|برنامه)\s*(برام|برای من)?\s*(درست کن|بساز|آماده کن|طراحی کن)\s*(در مورد|درمورد|درباره|برای)?\s*/i, 'طراحی ')
    .replace(/^(درباره|در مورد|درمورد|راجع به|توضیح بده در مورد|بررسی کن)\s*/i, 'بررسی ')
    .replace(/^(کد|برنامه|اسکریپت)\s*(پایتون|جاوااسکریپت|ری‌اکت)?\s*(بنویس|بساز)?\s*(برای|جهت)?\s*/i, 'کد ')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip conversational English boilerplates
  text = text
    .replace(/^(can you|please|could you|i want you to|help me)\s+/i, '')
    .replace(/^(create|make|generate|build|write)\s+(a|an)?\s+(slide|presentation|deck|slides)\s+(about|on|for)?\s*/i, 'Slides: ')
    .replace(/^(create|make|generate|build|write)\s+(a|an)?\s+(website|web app|landing page)\s+(about|on|for)?\s*/i, 'Web: ')
    .replace(/^(explain|tell me about|analyze|overview of)\s*/i, '')
    .trim();

  if (toolMode === 'SLIDES' && !text.toLowerCase().includes('اسلاید') && !text.toLowerCase().includes('slide')) {
    text = `اسلاید ${text}`;
  } else if (toolMode === 'WEB_DEV' && !text.toLowerCase().includes('طراحی') && !text.toLowerCase().includes('وب') && !text.toLowerCase().includes('web')) {
    text = `طراحی وب ${text}`;
  }

  if (text.length > 36) {
    text = text.slice(0, 36).trim();
  }

  return text || 'New Conversation';
}
