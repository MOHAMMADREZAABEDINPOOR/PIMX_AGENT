import { NextRequest } from 'next/server';
import { requireUser,checkOrigin } from '@/lib/server/session';
import { query } from '@/lib/server/database';
import { unseal } from '@/lib/server/encryption';
import { apiFailure,privateJson,HttpError } from '@/lib/server/errors';
export async function GET(request:NextRequest){try{const user=await requireUser(request);if(request.nextUrl.searchParams.get('key')==='1'){const [record]=await query('SELECT workspace_key FROM app_users WHERE id=?',[user.id]);return privateJson({key:unseal(String(record.workspace_key),`workspace-key:${user.id}`)});}return privateJson({state:null,storage:'BROWSER'});}catch(error){return apiFailure(error);}}
export async function PUT(request:NextRequest){try{checkOrigin(request);await requireUser(request);throw new HttpError(410,'Private chats are stored only in your browser. Use encrypted database export to move them.','BROWSER_STORAGE_ONLY');}catch(error){return apiFailure(error);}}
