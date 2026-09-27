import { NextRequest,NextResponse } from 'next/server';
import {timingSafeEqual} from 'node:crypto';
export function proxy(request:NextRequest){
  const secret=process.env.APP_PROXY_SECRET;
  if(secret){const supplied=Buffer.from(request.headers.get('x-pimx-proxy-secret') || ''),expected=Buffer.from(secret);if(supplied.length!==expected.length || !timingSafeEqual(supplied,expected))return NextResponse.json({error:{message:'Access is not allowed.'}},{status:403,headers:{'Cache-Control':'no-store'}});}
  const configured=process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://pimxagent.pages.dev' : undefined);
  const incoming = new Headers(request.headers),faPath = request.nextUrl.pathname === '/fa' || request.nextUrl.pathname.startsWith('/fa/');
  const locale = faPath || request.cookies.get('pimx_locale')?.value==='fa'?'fa':'en'; incoming.set('x-pimx-locale',locale);
  const forward = () => { if(faPath){const target=request.nextUrl.clone();target.pathname=target.pathname.replace(/^\/fa(?=\/|$)/,'') || '/';return NextResponse.rewrite(target,{request:{headers:incoming}});} return NextResponse.next({request:{headers:incoming}}); };
  if(!configured)return forward();
  const canonical=new URL(configured),local=['localhost','127.0.0.1','[::1]'].includes(canonical.hostname);
  if(local)return forward();
  if(process.env.TRUST_PROXY==='true' && (!secret || secret.length<32))return NextResponse.json({error:{message:'The deployment proxy is not configured.'}},{status:503,headers:{'Cache-Control':'no-store'}});
  const protocol=process.env.TRUST_PROXY==='true' ? request.headers.get('x-forwarded-proto')?.split(',')[0] || request.nextUrl.protocol.replace(':','') : request.nextUrl.protocol.replace(':','');
  if(canonical.protocol!=='https:')return NextResponse.json({error:{message:'HTTPS deployment configuration is required.'}},{status:503});
  if(protocol!=='https'){const target=new URL(request.nextUrl.pathname+request.nextUrl.search,canonical.origin);return NextResponse.redirect(target,308);}
  return forward();
}
export const config={matcher:'/((?!_next/static|_next/image).*)'};
