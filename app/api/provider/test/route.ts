import { requireWorkspace, checkOrigin } from '@/lib/server/workspace';
import { readJson, providerTestSchema } from '@/lib/server/validation';
import { resolveCredential } from '@/lib/server/credentials';
import { apiFailure } from '@/lib/server/errors';
import { rateLimit } from '@/lib/server/rate-limit';
import { safeFetch as secureFetch } from '@/lib/server/network';
const safeFetch = (url: string, options: RequestInit = {}) => secureFetch(url, options, true);
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TestRequest {
  action: 'test_connection' | 'test_model' | 'fetch_models';
  providerId: string;
  apiKey?: string;
  baseUrl?: string;
  apiFormat?: 'OPENAI' | 'ANTHROPIC';
  modelId?: string;
}

export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const user = await requireWorkspace(req);
    await rateLimit('providerTestSchema:'+user.id, 120, 60*1000);
    const validated = await readJson(req, providerTestSchema, 32*1024);
    const resolved = await resolveCredential(user.id, validated, validated.apiKey);
    const body = { ...validated, apiKey: resolved.apiKey, baseUrl: resolved.baseUrl, apiFormat: resolved.apiFormat as 'OPENAI' | 'ANTHROPIC' };
    const { action, providerId, apiKey, baseUrl, apiFormat = 'OPENAI', modelId } = body;

    const startTime = Date.now();

    // =========================================================================
    // 1. ACTION: Test Connection (Lightweight auth check, no deprecated models)
    // =========================================================================
    if (action === 'test_connection') {
      // 1A. Google Gemini: Check API key validity via official models list endpoint
      if (providerId === 'gemini') {
        const keyToUse = apiKey;
        if (!keyToUse) {
          return NextResponse.json({
            ok: false,
            error: 'No Gemini API key provided and no server environment key found.',
          });
        }

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(keyToUse.trim())}`;
          const res = await safeFetch(url, { method: 'GET' });
          const latencyMs = Date.now() - startTime;

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `HTTP ${res.status}: Invalid Gemini API key`;
            return NextResponse.json({
              ok: false,
              latencyMs,
              error: `Provider HTTP ${res.status}`,
            });
          }

          const data = await res.json().catch(() => ({}));
          const count = Array.isArray(data.models) ? data.models.length : 0;
          return NextResponse.json({
            ok: true,
            latencyMs,
            message: `Connected to Google Gemini successfully (${count} models verified)`,
          });
        } catch (err: any) {
          return NextResponse.json({
            ok: false,
            latencyMs: Date.now() - startTime,
            error: 'The provider request failed. Check the endpoint and key.',
          });
        }
      }

      // 1B. Anthropic: Check API key validity via /v1/models endpoint
      if (apiFormat === 'ANTHROPIC' || providerId === 'anthropic') {
        const targetUrl = `${(baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '')}/models`;
        const testKey = (apiKey || '').trim();
        if (!testKey) {
          return NextResponse.json({ ok: false, error: 'Anthropic API key is required.' });
        }

        try {
          const res = await safeFetch(targetUrl, {
            method: 'GET',
            headers: {
              'x-api-key': testKey,
              'anthropic-version': '2023-06-01',
            },
          });

          const latencyMs = Date.now() - startTime;
          if (res.ok) {
            return NextResponse.json({
              ok: true,
              latencyMs,
              message: 'Connected to Anthropic successfully',
            });
          }

          if (res.status === 401 || res.status === 403) {
            return NextResponse.json({
              ok: false,
              latencyMs,
              error: 'Invalid Anthropic API key (HTTP 401 Unauthorized)',
            });
          }

          const errText = await res.text().catch(() => '');
          let parsed: any = {};
          try { parsed = JSON.parse(errText); } catch {}
          return NextResponse.json({
            ok: false,
            latencyMs,
            error: `Provider HTTP ${res.status}`,
          });
        } catch (err: any) {
          return NextResponse.json({
            ok: false,
            latencyMs: Date.now() - startTime,
            error: 'The provider request failed. Check the endpoint and key.',
          });
        }
      }

      // 1C. Standard OpenAI and OpenAI-Compatible (DeepSeek, Groq, Mistral, Ollama, Proxies, etc.)
      const targetBase = (baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
      const testKey = (apiKey || '').trim();

      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (testKey) {
        authHeaders['Authorization'] = `Bearer ${testKey}`;
      }

      try {
        const modelsRes = await safeFetch(`${targetBase}/models`, {
          method: 'GET',
          headers: authHeaders,
        });

        const latencyMs = Date.now() - startTime;

        if (modelsRes.ok) {
          const data = await modelsRes.json().catch(() => ({}));
          const count = Array.isArray(data.data) ? data.data.length : Array.isArray(data) ? data.length : 0;
          return NextResponse.json({
            ok: true,
            latencyMs,
            message: `Connected successfully (${count > 0 ? `${count} models discovered` : 'Endpoint verified'})`,
            modelsCount: count,
          });
        }

        if (modelsRes.status === 401 || modelsRes.status === 403) {
          return NextResponse.json({
            ok: false,
            latencyMs,
            error: `Invalid API key for endpoint (HTTP ${modelsRes.status})`,
          });
        }

        // If /models returns 404 or is blocked, try a minimal completion test without forcing a specific model
        const compRes = await safeFetch(`${targetBase}/chat/completions`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            model: modelId || 'default',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 1,
          }),
        });

        const compLatency = Date.now() - startTime;
        if (compRes.ok) {
          return NextResponse.json({
            ok: true,
            latencyMs: compLatency,
            message: 'Connected to endpoint successfully',
          });
        }

        if (compRes.status === 401 || compRes.status === 403) {
          return NextResponse.json({
            ok: false,
            latencyMs: compLatency,
            error: `Invalid API key for endpoint (HTTP ${compRes.status})`,
          });
        }

        // If status is 400 (e.g. model not found), but auth passed:
        const errText = await compRes.text().catch(() => '');
        let parsed: any = {};
        try { parsed = JSON.parse(errText); } catch {}
        if (compRes.status === 400 && !errText.includes('key') && !errText.includes('auth')) {
          // Authentication succeeded! Endpoint is online and key was accepted
          return NextResponse.json({
            ok: true,
            latencyMs: compLatency,
            message: 'Endpoint online and API key accepted',
          });
        }

        return NextResponse.json({
          ok: false,
          latencyMs: compLatency,
          error: `Provider HTTP ${compRes.status}`,
        });
      } catch (err: any) {
        return NextResponse.json({
          ok: false,
          latencyMs: Date.now() - startTime,
          error: 'The provider request failed. Check the endpoint and key.',
        });
      }
    }

    // =========================================================================
    // 2. ACTION: Test Specific Model
    // =========================================================================
    if (action === 'test_model') {
      if (!modelId) {
        return NextResponse.json({ ok: false, error: 'Model ID is required for model test.' });
      }

      if (providerId === 'gemini') {
        const keyToUse = apiKey;
        const cleanId = modelId.replace(/^(gemini\/|models\/)+/g, '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanId)}:generateContent?key=${encodeURIComponent(keyToUse || '')}`;
        const resp = await safeFetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say OK' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        });
        const latencyMs = Date.now() - startTime;
        if (!resp.ok) {
          const err = await resp.text().catch(() => '');
          return NextResponse.json({ ok: false, latencyMs, error: 'The provider rejected this model request.' });
        }
        return NextResponse.json({ ok: true, latencyMs, replySnippet: 'OK' });
      }

      if (apiFormat === 'ANTHROPIC') {
        const targetUrl = `${(baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '')}/messages`;
        const res = await safeFetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey || '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: modelId,
            max_tokens: 5,
            messages: [{ role: 'user', content: 'Say OK' }],
          }),
        });
        const latencyMs = Date.now() - startTime;
        if (!res.ok) {
          const err = await res.text().catch(() => '');
          return NextResponse.json({ ok: false, latencyMs, error: 'The provider rejected this model request.' });
        }
        const data = await res.json().catch(() => ({}));
        const snippet = data.content?.[0]?.text || 'OK';
        return NextResponse.json({ ok: true, latencyMs, replySnippet: snippet });
      }

      // OpenAI format
      const targetUrl = `${(baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`;
      const res = await safeFetch(targetUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 5,
        }),
      });

      const latencyMs = Date.now() - startTime;
      if (!res.ok) {
        const err = await res.text().catch(() => '');
        return NextResponse.json({ ok: false, latencyMs, error: 'The provider rejected this model request.' });
      }
      const data = await res.json().catch(() => ({}));
      const snippet = data.choices?.[0]?.message?.content || 'OK';
      return NextResponse.json({ ok: true, latencyMs, replySnippet: snippet });
    }

    // =========================================================================
    // 3. ACTION: Fetch Remote Models (Clean model IDs, no models/ prefix)
    // =========================================================================
    if (action === 'fetch_models') {
      // 3A. Google Gemini models
      if (providerId === 'gemini') {
        const keyToUse = apiKey;
        if (!keyToUse) {
          return NextResponse.json({ ok: false, error: 'No Gemini API key provided' });
        }
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(keyToUse.trim())}`;
          const res = await safeFetch(url);
          if (!res.ok) {
            return NextResponse.json({
              ok: false,
              error: `Failed to fetch Gemini models: HTTP ${res.status}`,
            });
          }
          const data = await res.json();
          const rawList = Array.isArray(data.models) ? data.models : [];
          // Filter to models that support text/chat generation
          const models = rawList
            .filter((m: any) =>
              !m.supportedGenerationMethods ||
              m.supportedGenerationMethods.includes('generateContent')
            )
            .map((m: any) => {
              // Strip 'models/' prefix so model id is clean e.g. "gemini-2.0-flash"
              const cleanId = (m.name || '').replace(/^models\//, '');
              return {
                id: cleanId,
                name: m.displayName || cleanId,
                contextWindow: m.inputTokenLimit || 1000000,
                maxOutputTokens: m.outputTokenLimit || 8192,
                vision: cleanId.includes('flash') || cleanId.includes('pro'),
                reasoning: cleanId.includes('thinking') || cleanId.includes('pro'),
                tools: true,
                streaming: true,
                isFree: cleanId.includes('flash'),
              };
            });

          return NextResponse.json({ ok: true, models, count: models.length });
        } catch (err: any) {
          return NextResponse.json({
            ok: false,
            error: 'The provider request failed. Check the endpoint and key.',
          });
        }
      }

      // 3B. Anthropic models
      if (apiFormat === 'ANTHROPIC' || providerId === 'anthropic') {
        const targetUrl = `${(baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '')}/models`;
        try {
          const res = await safeFetch(targetUrl, {
            headers: {
              'x-api-key': apiKey || '',
              'anthropic-version': '2023-06-01',
            },
          });
          if (res.ok) {
            const data = await res.json();
            const rawList = Array.isArray(data.data) ? data.data : [];
            const models = rawList.map((m: any) => ({
              id: m.id,
              name: m.display_name || m.id,
              contextWindow: 200000,
              maxOutputTokens: 8192,
              vision: true,
              reasoning: m.id.includes('3-7') || m.id.includes('sonnet'),
              tools: true,
              streaming: true,
              isFree: false,
            }));
            if (models.length > 0) {
              return NextResponse.json({ ok: true, models, count: models.length });
            }
          }
        } catch {}
      }

      // 3C. Standard OpenAI & OpenAI-compatible
      const targetBase = (baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
        const res = await safeFetch(`${targetBase}/models`, {
          method: 'GET',
          headers,
        });

        if (!res.ok) {
          return NextResponse.json({
            ok: false,
            error: `Failed to fetch models: HTTP ${res.status}`,
          });
        }

        const data = await res.json();
        const rawList = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        const models = rawList.map((m: any) => {
          const rawId = typeof m === 'string' ? m : m.id || m.name;
          const cleanId = rawId.replace(/^models\//, '');
          return {
            id: cleanId,
            name: m.name || m.display_name || cleanId,
            contextWindow: m.context_length || 128000,
            maxOutputTokens: 4096,
            vision:
              cleanId.includes('vision') ||
              cleanId.includes('4o') ||
              cleanId.includes('vl') ||
              cleanId.includes('gemini') ||
              cleanId.includes('claude'),
            reasoning:
              cleanId.includes('reasoner') ||
              cleanId.includes('r1') ||
              cleanId.includes('o1') ||
              cleanId.includes('o3'),
            tools: true,
            streaming: true,
            isFree: false,
          };
        });

        return NextResponse.json({ ok: true, models, count: models.length });
      } catch (err: any) {
        return NextResponse.json({ ok: false, error: 'The provider request failed. Check the endpoint and key.' });
      }
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return apiFailure(error);
  }
}
