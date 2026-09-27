import 'server-only';

// Executable code has its own opaque origin. Relaxed compiler permissions are
// confined to this response and never apply to the authenticated application.
export const previewHeaders = {
  'Content-Security-Policy': [
    "default-src 'none'", "sandbox allow-scripts allow-modals",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.tailwindcss.com",
    "style-src 'unsafe-inline' https://fonts.googleapis.com",
    "font-src data: https://fonts.gstatic.com", "img-src data: blob: https:",
    "connect-src 'none'", "frame-src 'none'", "object-src 'none'",
    "base-uri 'none'", "form-action 'none'", "frame-ancestors 'self'",
  ].join('; '),
  'X-Frame-Options': 'SAMEORIGIN',
  'Cache-Control': 'private, no-store',
  'Content-Type': 'text/html; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};
