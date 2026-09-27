/**
 * Encryption / Masking utility for API credentials and local security.
 */

export function maskApiKey(key: string): string {
  if (!key || key.trim() === '') return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '••••••••';
  return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

/** Decode old Base64 records only during migration. This is not encryption. */
export function decryptSecret(encrypted: string): string {
  if (!encrypted) return '';
  if (!encrypted.startsWith('enc:v1:')) return encrypted;
  const raw = encrypted.slice('enc:v1:'.length);
  try {
    return decodeURIComponent(atob(raw));
  } catch {
    return raw;
  }
}
