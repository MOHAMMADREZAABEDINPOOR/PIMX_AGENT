import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface D1Binding {
  prepare(sql: string): { bind(...values: (string | number | null)[]): { all<T>(): Promise<{ results: T[] }>; run(): Promise<unknown> }; all<T>(): Promise<{ results: T[] }> };
}
export interface RuntimeBindings { DB?: D1Binding; [key: string]: unknown }
export async function cloudflareBindings(): Promise<RuntimeBindings | null> {
  if (process.env.APP_RUNTIME !== 'cloudflare') return null;
  try { return (await getCloudflareContext({ async: true })).env as RuntimeBindings; }
  catch { return null; }
}
