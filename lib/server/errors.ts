import 'server-only';
import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = 'REQUEST_REJECTED', public retryAfter?: number) { super(message); }
}
export function apiFailure(error: unknown) {
  const known = error instanceof HttpError;
  return NextResponse.json({ error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'The request could not be completed. Please try again.' } }, { status: known ? error.status : 500, headers: { 'Cache-Control': 'no-store', ...(known && error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : {}) } });
}
export function privateJson(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } }); }
