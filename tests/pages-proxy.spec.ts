import {test,expect} from '@playwright/test';
import {createPagesWorker} from '../cloudflare-pages/runtime.js';
test('Pages enforces HTTPS and serves public assets without entering the private app',async()=>{
 let calls=0;const worker=createPagesWorker({fetch:()=>{calls++;return new Response('private');}}),env={ASSETS:{fetch:()=>new Response('public image')}};
 const redirect=await worker.fetch(new Request('http://pimxagent.pages.dev/contact'),env,{});expect(redirect.status).toBe(308);expect(redirect.headers.get('location')).toBe('https://pimxagent.pages.dev/contact');
 expect(await(await worker.fetch(new Request('https://pimxagent.pages.dev/media/pimx-workspace-dark.webp'),env,{})).text()).toBe('public image');expect(calls).toBe(0);
});
test('Pages strips spoofed headers and preserves D1 bindings, streaming and session cookies',async()=>{
 let captured:Request|undefined,bindings:unknown;const db={prepare:()=>{}};
 const worker=createPagesWorker({fetch:(request:Request,env:unknown)=>{captured=request;bindings=env;return new Response('data: hello\n\n',{headers:{'Content-Type':'text/event-stream','Cache-Control':'private, no-store','Set-Cookie':'__Host-pimx_session=fixture; Secure; HttpOnly; Path=/'}});}});
 const request=new Request('https://pimxagent.pages.dev/api/chat',{method:'POST',body:'{}',headers:{Cookie:'fixture=session','x-forwarded-for':'spoofed','x-pimx-proxy-secret':'spoofed','x-pimx-geo':'spoofed','cf-connecting-ip':'203.0.113.5'}});Object.defineProperty(request,'cf',{value:{country:'IR',city:'Tehran',region:'Tehran'}});
 const env={DB:db,APP_PROXY_SECRET:'test-only-proxy-fixture-with-32-characters'},response=await worker.fetch(request,env,{}),headers=captured!.headers;
 expect(bindings).toBe(env);expect(headers.get('x-pimx-proxy-secret')).toBe(env.APP_PROXY_SECRET);expect(headers.get('x-forwarded-for')).toBe('203.0.113.5');expect(headers.get('x-forwarded-proto')).toBe('https');expect(headers.get('x-forwarded-host')).toBe('pimxagent.pages.dev');expect(JSON.parse(headers.get('x-pimx-geo')!)).toEqual({country:'IR',city:'Tehran',region:'Tehran'});expect(await captured!.text()).toBe('{}');expect(headers.get('cookie')).toBe('fixture=session');expect(response.headers.get('cache-control')).toBe('private, no-store');expect(response.headers.get('set-cookie')).toContain('HttpOnly');expect(await response.text()).toBe('data: hello\n\n');
});
