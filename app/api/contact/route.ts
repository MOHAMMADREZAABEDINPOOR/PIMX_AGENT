import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { checkOrigin } from '@/lib/server/session';
import { query } from '@/lib/server/database';
import { seal } from '@/lib/server/encryption';
import { contactSchema,readJson } from '@/lib/server/validation';
import { apiFailure,privateJson } from '@/lib/server/errors';
import { checkBot } from '@/lib/server/bot';
import { rateLimit,requestIp } from '@/lib/server/rate-limit';
export async function POST(request:NextRequest){try{checkOrigin(request);await rateLimit(`contact:${requestIp(request)}`,5,60*60*1000);const input=await readJson(request,contactSchema,16*1024);await checkBot(input,'contact');const id=randomUUID();await query('INSERT INTO app_contacts(id,payload,created_at) VALUES(?,?,?)',[id,seal(JSON.stringify({name:input.name,message:input.message}),`contact:${id}`),Date.now()]);return privateJson({ok:true},201);}catch(error){return apiFailure(error);}}
