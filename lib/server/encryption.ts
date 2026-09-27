import 'server-only';
import { createCipheriv, createDecipheriv, randomBytes, scrypt, timingSafeEqual, createHash,createHmac } from 'node:crypto';
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
export const emailLookup = (value:string) => 'email:v1:'+createHmac('sha256',encryptionKey()).update('login-email\0'+value.trim().toLowerCase()).digest('hex');
const pepper = (password: string) => createHmac('sha256', encryptionKey()).update('password\0' + password).digest('hex');
const derive = (password: string, salt: Buffer, legacy = false) => new Promise<Buffer>((resolveKey, reject) => scrypt(password, salt, 64, { N: legacy ? 131072 : 65536, r: 8, p: legacy ? 1 : 2, maxmem: legacy ? 256 * 1024 * 1024 : 96 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolveKey(key)));
// 64 MiB / two passes, with a server-only pepper, fits Workers' memory budget.
export async function hashPassword(password: string) { const salt = randomBytes(16), key = await derive(pepper(password), salt); return `scrypt-v2:65536:8:2:${salt.toString('base64url')}:${key.toString('base64url')}`; }
export async function verifyPassword(password: string, encoded: string) { const [algorithm, n, r, p, salt, expected] = encoded.split(':'); const legacy = algorithm === 'scrypt' && n === '131072' && r === '8' && p === '1'; if ((!legacy && !(algorithm === 'scrypt-v2' && n === '65536' && r === '8' && p === '2')) || !expected) return false; const derived = await derive(legacy ? password : pepper(password), Buffer.from(salt, 'base64url'), legacy), target = Buffer.from(expected, 'base64url'); return target.length === derived.length && timingSafeEqual(target, derived); }
