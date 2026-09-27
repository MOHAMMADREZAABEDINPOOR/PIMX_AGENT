import { NextRequest } from 'next/server';
import { randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query } from '@/lib/server/database';
import { hashPassword, verifyPassword, seal, unseal, tokenHash, emailLookup } from '@/lib/server/encryption';
import { currentUser, checkOrigin, issueSession } from '@/lib/server/session';
import { sessionCookie, appOrigin } from '@/lib/server/config';
import { authSchema, readJson } from '@/lib/server/validation';
import { apiFailure, HttpError, privateJson } from '@/lib/server/errors';
import { rateLimit, clearLimit, requestIp } from '@/lib/server/rate-limit';
import { checkBot } from '@/lib/server/bot';
import { mailConfigured, sendAccountEmail } from '@/lib/server/mail';
import { recordAuthEvent } from '@/lib/server/telemetry';

export const runtime = 'nodejs';
const password = z.string().min(12).max(128);
const forgotSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254), website: z.string().max(500).default(''), turnstileToken: z.string().max(2048).optional(), locale: z.enum(['en','fa']).default('en') }).strict();
const resetSchema = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/), password, confirmPassword: password }).strict().refine(value => value.password === value.confirmPassword, { path: ['confirmPassword'] });
export async function GET(request: NextRequest, {params}: {params: Promise<{action: string}>}) {
  if ((await params).action !== 'session') return privateJson({error:{message:'Not found.'}},404);
  try { return privateJson({user:await currentUser(request)}); } catch (error) { return apiFailure(error); }
}
export async function POST(request: NextRequest, {params}: {params: Promise<{action: string}>}) {
  try {
    checkOrigin(request); const {action} = await params;
    if (action === 'logout') {
      const token = request.cookies.get(sessionCookie())?.value; if (token) await query('DELETE FROM app_sessions WHERE token_hash=?',[tokenHash(token)]);
      const response = privateJson({ok:true}); response.cookies.set(sessionCookie(),'',{path:'/',httpOnly:true,secure:sessionCookie().startsWith('__Host-'),sameSite:'lax',maxAge:0}); return response;
    }
    if (action === 'forgot-password') {
      const input = await readJson(request,forgotSchema,4096), ip = requestIp(request);
      await rateLimit(`forgot-ip:${ip}`,6,15*60_000); await rateLimit(`forgot-email:${input.email}`,3,60*60_000); await checkBot(input,action);
      if (!mailConfigured()) throw new HttpError(503,'Email delivery is not configured yet. Please contact support.','MAIL_NOT_CONFIGURED');
      const [user] = await query('SELECT id,display_name,profile FROM app_users WHERE email=?',[emailLookup(input.email)]);
      if (user) {
        const token = randomBytes(32).toString('base64url'), id = String(user.id), now = Date.now();
        await query('DELETE FROM app_password_resets WHERE user_id=?',[id]);
        await query('INSERT INTO app_password_resets(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)',[tokenHash(token),id,now+30*60_000,now]);
        const link = `${appOrigin()}${input.locale==='fa'?'/fa':''}/reset-password?token=${token}`;
        await sendAccountEmail(input.email,'reset',input.locale,String(user.display_name),link);
      }
      return privateJson({ok:true,message:'If an account exists, you will receive a password reset email.'},202);
    }
    if (action === 'reset-password') {
      await rateLimit(`reset:${requestIp(request)}`,10,15*60_000);
      const input = await readJson(request,resetSchema,2048), hash = tokenHash(input.token);
      const [record] = await query('SELECT user_id FROM app_password_resets WHERE token_hash=? AND expires_at>?',[hash,Date.now()]);
      if (!record) throw new HttpError(400,'This reset link has expired or has already been used. Request a new one.','RESET_EXPIRED');
      const newHash = await hashPassword(input.password);
      // Claim the token atomically before changing the password: concurrent reuse fails.
      const claimed = await query('DELETE FROM app_password_resets WHERE token_hash=? AND expires_at>? RETURNING user_id',[hash,Date.now()]);
      if (!claimed.length) throw new HttpError(400,'This reset link has expired or has already been used. Request a new one.','RESET_EXPIRED');
      const id = String(record.user_id);
      await query('UPDATE app_users SET password_hash=? WHERE id=?',[newHash,id]);
      await query('DELETE FROM app_sessions WHERE user_id=?',[id]);
      await recordAuthEvent(request,id,'PASSWORD_RESET');
      const [account]=await query('SELECT profile,display_name FROM app_users WHERE id=?',[id]);
      if(account.profile && mailConfigured()){const profile=JSON.parse(unseal(String(account.profile),`profile:${id}`));try{await sendAccountEmail(profile.email,'changed',profile.locale||'en',String(account.display_name));}catch{}}
      return privateJson({ok:true});
    }
    if (!['login','signup'].includes(action)) throw new HttpError(404,'Not found.');
    const input = await readJson(request,authSchema,16*1024), ip = requestIp(request), bucket = `login:${ip}:${input.email}`;
    await rateLimit(`login-ip:${ip}`,60,60_000); await rateLimit(bucket,6,15*60_000); await checkBot(input,action);
    const emailId = emailLookup(input.email);
    let [record] = await query('SELECT * FROM app_users WHERE email IN (?,?)',[emailId,input.email]);
    let emailSent = false;
    if (action === 'signup') {
      await rateLimit(`signup:${ip}`,10,60*60_000);
      if (!input.username || !input.birthYear || input.password !== input.confirmPassword) throw new HttpError(400,'Enter a username, birth year and matching passwords.','SIGNUP_FIELDS');
      if (record) throw new HttpError(400,'An account could not be created with these details. Try signing in.');
      const username = input.username.normalize('NFKC').toLowerCase();
      if ((await query('SELECT id FROM app_users WHERE username=?',[username])).length) throw new HttpError(400,'This username is already taken. Choose another.','USERNAME_TAKEN');
      const id = randomUUID(), passwordHash = await hashPassword(input.password), key = seal(randomBytes(32).toString('base64'),`workspace-key:${id}`);
      const profile = seal(JSON.stringify({email:input.email,birthYear:input.birthYear,locale:input.locale || 'en'}),`profile:${id}`);
      await query('INSERT INTO app_users(id,email,username,display_name,profile,password_hash,role,workspace_key,created_at,last_login) VALUES(?,?,?,?,?,?,?,?,?,?)',[id,emailId,username,username,profile,passwordHash,'USER',key,Date.now(),Date.now()]);
      [record] = await query('SELECT * FROM app_users WHERE id=?',[id]);
      if (mailConfigured()) { try { await sendAccountEmail(input.email,'welcome',input.locale || 'en',username); emailSent = true; } catch { /* Account remains valid; the response honestly reports delivery status. */ } }
      await recordAuthEvent(request,id,'SIGNUP');
    } else {
      const valid = record ? await verifyPassword(input.password,String(record.password_hash)) : (await hashPassword(input.password),false);
      if (!valid) throw new HttpError(401,'Email or password is incorrect.','INVALID_LOGIN');
      if (record.email !== emailId) await query('UPDATE app_users SET email=? WHERE id=?',[emailId,String(record.id)]);
      if (!String(record.password_hash).startsWith('scrypt-v2:')) await query('UPDATE app_users SET password_hash=? WHERE id=?',[await hashPassword(input.password),String(record.id)]);
      if (!record.profile) await query('UPDATE app_users SET profile=? WHERE id=?',[seal(JSON.stringify({email:input.email,locale:input.locale || 'en'}),`profile:${record.id}`),String(record.id)]);
      await query('UPDATE app_users SET last_login=? WHERE id=?',[Date.now(),String(record.id)]);
      await recordAuthEvent(request,String(record.id),'LOGIN');
    }
    await clearLimit(bucket);
    const {token,options} = await issueSession(String(record.id),request.cookies.get(sessionCookie())?.value);
    const response = privateJson({user:{id:record.id,displayName:record.display_name,role:record.role},...(action==='signup'?{emailSent}:{})},action==='signup'?201:200);
    response.cookies.set(sessionCookie(),token,options); return response;
  } catch (error) { return apiFailure(error); }
}
