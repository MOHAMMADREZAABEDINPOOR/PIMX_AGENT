export function createPagesWorker(app){return {async fetch(request,env,ctx){
 const url=new URL(request.url);
 if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname)){url.protocol='https:';return Response.redirect(url,308);}
 if(/^\/(?:_next\/static\/|media\/|logos\/|fonts\/|icons\/|pdf\.worker)/.test(url.pathname)||['/sw.js','/offline','/offline.html','/brand-logo.webp','/favicon.ico'].includes(url.pathname))return env.ASSETS.fetch(request);
 const headers=new Headers(request.headers);
 for(const name of ['x-pimx-proxy-secret','x-pimx-geo','x-pimx-locale','x-forwarded-host','x-forwarded-proto','x-forwarded-for'])headers.delete(name);
 // Preserve the original locale before OpenNext rewrites /fa to the shared route.
 const faPath=url.pathname==='/fa'||url.pathname.startsWith('/fa/');
 const faCookie=/(?:^|;\s*)pimx_locale=fa(?:;|$)/.test(headers.get('cookie')||'');
 headers.set('x-pimx-locale',faPath||faCookie?'fa':'en');
 headers.set('x-pimx-proxy-secret',env.APP_PROXY_SECRET||'');
 headers.set('x-forwarded-proto',url.protocol.replace(':',''));
 headers.set('x-forwarded-host',url.host);
 headers.set('x-forwarded-for',request.headers.get('cf-connecting-ip')||'unknown');
 headers.set('x-pimx-geo',JSON.stringify({country:request.cf?.country,city:request.cf?.city,region:request.cf?.region}));
 return app.fetch(new Request(request,{headers}),env,ctx);
}};}
