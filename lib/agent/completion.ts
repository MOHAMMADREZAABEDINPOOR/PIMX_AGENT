/** Reads small auxiliary completions in OpenAI-compatible and native Anthropic streams. */
export async function readCompletion(response: Response): Promise<string> {
  if (!response.ok) throw new Error(`Model request failed (${response.status})`);
  if (!response.body) throw new Error('Empty model response');
  if (response.headers.get('content-type')?.includes('application/json')) {
    const json = await response.json();
    return json.choices?.[0]?.message?.content || json.content?.filter((block: { type: string }) => block.type === 'text').map((block: { text: string }) => block.text).join('') || '';
  }
  const reader = response.body.getReader(); const decoder = new TextDecoder();
  let buffer = '', output = '';
  const consume = (line: string) => {
    if (!line.trim().startsWith('data:')) return;
    const payload = line.trim().slice(5).trim();
    if (!payload || payload === '[DONE]') return;
    try {
      const json = JSON.parse(payload);
      if (json.error) throw new Error(json.error.message || 'Provider error');
      const text = json.choices?.[0]?.delta?.content ?? (json.type === 'content_block_delta' && json.delta?.type === 'text_delta' ? json.delta.text : '') ?? '';
      if (typeof text === 'string') output += text;
    } catch (error) { if (error instanceof Error && !(error instanceof SyntaxError)) throw error; }
  };
  try {
    for (;;) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = buffer.split('\n'); buffer = lines.pop() || '';
      lines.forEach(consume);
      if (done) { consume(buffer); break; }
    }
  } finally { reader.releaseLock(); }
  return output;
}
