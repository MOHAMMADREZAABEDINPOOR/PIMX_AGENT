import 'server-only';

export function appOrigin() { return new URL(process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://pimxagent.pages.dev' : 'http://localhost:3000')).origin; }
export function localDeployment() { return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(appOrigin()).hostname); }
