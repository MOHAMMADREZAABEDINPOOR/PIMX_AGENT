import 'server-only';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { localDeployment } from './config';

export function dataDirectory() { return resolve(/*turbopackIgnore: true*/ process.env.APP_DATA_DIR || '.data'); }
export function encryptionKey(): Buffer {
  const configured = process.env.APP_DATA_ENCRYPTION_KEY;
  if (configured) { const key = Buffer.from(configured, 'base64'); if (key.length !== 32) throw new Error('APP_DATA_ENCRYPTION_KEY must encode 32 bytes.'); return key; }
  if (!localDeployment()) throw new Error('A production encryption key is required.');
  mkdirSync(dataDirectory(), { recursive: true });
  const path = resolve(dataDirectory(), 'master.key');
  if (!existsSync(path)) { try { writeFileSync(path, randomBytes(32), { flag: 'wx', mode: 0o600 }); } catch { /* Another worker created it. */ } }
  const key = readFileSync(path); if (key.length !== 32) throw new Error('Invalid local encryption key.'); return key;
}
export function seal(value: string, context: string) { const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv); cipher.setAAD(Buffer.from(context)); const body = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]); return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), body.toString('base64url')].join('.'); }
export function unseal(value: string, context: string) { const [version, iv, tag, body] = value.split('.'); if (version !== 'v1' || !body) throw new Error('Invalid ciphertext.'); const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url')); decipher.setAAD(Buffer.from(context)); decipher.setAuthTag(Buffer.from(tag, 'base64url')); return Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]).toString('utf8'); }
export const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex');
