import 'server-only';
import {cookies} from 'next/headers';
import {randomBytes,randomUUID} from 'node:crypto';
import type {NextRequest} from 'next/server';
import {query} from './database';
import {seal,tokenHash} from './encryption';
import {appOrigin,localDeployment} from './config';
import {HttpError} from './errors';

export const workspaceCookie=()=>localDeployment()?'pimx_workspace':'__Host-pimx_workspace';
export interface WorkspaceIdentity {id:string;displayName:string}
export async function currentWorkspace(request:NextRequest):Promise<WorkspaceIdentity|null>{
 const token=request.cookies.get(workspaceCookie())?.value;
 if(!token||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
 const [record]=await query('SELECT id FROM app_browser_workspaces WHERE token_hash=?',[tokenHash(token)]);
 return record?{id:String(record.id),displayName:'This device'}:null;
}
// Private ownership is automatic. No email, password, signup or account is created.
export async function requireWorkspace(request:NextRequest):Promise<WorkspaceIdentity>{
 const existing=await currentWorkspace(request);if(existing)return existing;
 const id=randomUUID(),token=randomBytes(32).toString('base64url'),now=Date.now();
 await query('INSERT INTO app_browser_workspaces(id,token_hash,workspace_key,created_at) VALUES(?,?,?,?)',[id,tokenHash(token),seal(randomBytes(32).toString('base64'),`workspace-key:${id}`),now]);
 (await cookies()).set(workspaceCookie(),token,{path:'/',httpOnly:true,secure:!localDeployment(),sameSite:'lax',maxAge:365*86400});
 return {id,displayName:'This device'};
}
export function checkOrigin(request:Request){
 if(['GET','HEAD','OPTIONS'].includes(request.method))return;
 if(request.headers.get('origin')!==appOrigin())throw new HttpError(403,'This request origin is not allowed.','CSRF_REJECTED');
 const site=request.headers.get('sec-fetch-site');if(site&&!['same-origin','none'].includes(site))throw new HttpError(403,'Cross-site requests are not allowed.');
}
