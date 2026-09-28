import {NextRequest} from 'next/server';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {checkOrigin} from '@/lib/server/workspace';
import {query} from '@/lib/server/database';
import {readJson} from '@/lib/server/validation';
import {apiFailure,privateJson} from '@/lib/server/errors';
import {rateLimit,requestIp} from '@/lib/server/rate-limit';
import {deviceInfo,visitorHash} from '@/lib/server/telemetry';
let cleanupAt=0;
export async function POST(request:NextRequest){try{checkOrigin(request);await rateLimit(`analytics:${requestIp(request)}`,60,60000);const {path,visitor}=await readJson(request,z.object({path:z.enum(['/','/chat','/data','/privacy','/terms','/contact','/thank-you']),visitor:z.string().uuid().optional()}).strict(),1024);const day=new Date().toISOString().slice(0,10);if(Date.now()>cleanupAt){const cutoff=Date.now()-90*86400000;await query('DELETE FROM app_visits WHERE created_at<?',[cutoff]);await query('DELETE FROM app_pageviews WHERE day<?',[new Date(cutoff).toISOString().slice(0,10)]);cleanupAt=Date.now()+3600000;}await query('INSERT INTO app_pageviews(day,path,count) VALUES(?,?,1) ON CONFLICT(day,path) DO UPDATE SET count=app_pageviews.count+1',[day,path]);const device=deviceInfo(request);await query('INSERT INTO app_visits(id,visitor_hash,user_id,path,device,browser,country,city,region,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',[randomUUID(),visitorHash(visitor||requestIp(request)+day),null,path,device.device,device.browser,device.country||null,device.city||null,device.region||null,Date.now()]);return privateJson({ok:true});}catch(error){return apiFailure(error);}}
