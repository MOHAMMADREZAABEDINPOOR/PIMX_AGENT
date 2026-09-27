import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';

mkdirSync('artifacts/qa/product',{recursive:true});
const photos=['pimx-workspace-dark','pimx-workspace-light','pimx-desk-background'];
const html=`<!doctype html><html><body style="margin:0;background:#080a17"><canvas width="1280" height="720"></canvas><script>
window.renderFilm=async()=>{
 const images=await Promise.all(${JSON.stringify(photos)}.map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src='/'+name+'.webp';})));
 const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),chunks=[],duration=15;
 const recorder=new MediaRecorder(canvas.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2500000});
 recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
 const complete=new Promise(resolve=>recorder.onstop=resolve),start=performance.now();
 const drawPhoto=(img,alpha,scale)=>{const width=1280*scale,height=720*scale;ctx.globalAlpha=alpha;ctx.drawImage(img,(1280-width)/2,(720-height)/2,width,height);ctx.globalAlpha=1;};
 const frame=now=>{
  const seconds=(now-start)/1000,phase=Math.min(2,Math.floor(seconds/5)),progress=(seconds%5)/5;
  ctx.fillStyle='#080a17';ctx.fillRect(0,0,1280,720);
  const next=phase===1?0:1,blend=Math.max(0,(progress-.84)/.16);
  drawPhoto(images[phase===1?1:0],1,1.015+progress*.035);if(blend>0&&phase<2)drawPhoto(images[next],blend,1.015);
  const gradient=ctx.createLinearGradient(0,540,0,720);gradient.addColorStop(0,'transparent');gradient.addColorStop(1,'rgba(8,10,23,.92)');ctx.fillStyle=gradient;ctx.fillRect(0,540,1280,180);
  ctx.fillStyle='#c4acff';ctx.font='600 13px sans-serif';ctx.fillText('PIMX AGENT / YOUR IDEAS, IN MOTION',48,614);
  ctx.fillStyle='#fff';ctx.font='500 30px sans-serif';ctx.fillText(['Research. Build. Present.','One workspace. On every device.','Your models. Your next idea.'][phase],48,661);
  ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillRect(48,686,1184,2);ctx.fillStyle='#b595ff';ctx.fillRect(48,686,1184*Math.min(seconds/duration,1),2);
  if(seconds<duration)requestAnimationFrame(frame);else recorder.stop();
 };
 frame(start);recorder.start();await complete;
 const bytes=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());let data='';for(let i=0;i<bytes.length;i+=32768)data+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(data);
};</script></body></html>`;
const server=createServer((req,res)=>{const name=photos.find(name=>req.url==='/'+name+'.webp');if(name){res.setHeader('Content-Type','image/webp');res.end(readFileSync('public/media/'+name+'.webp'));}else{res.setHeader('Content-Type','text/html');res.end(html);}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
try{const page=await browser.newPage({viewport:{width:1280,height:720}});await page.goto('http://127.0.0.1:'+server.address().port);const data=await page.evaluate(()=>window.renderFilm());writeFileSync('public/media/pimx-product-film.webm',Buffer.from(data,'base64'));await page.screenshot({path:'artifacts/qa/product/product-film-frame.png'});console.log('Created 15-second product film:',readFileSync('public/media/pimx-product-film.webm').length,'bytes');}
finally{await browser.close();server.close();}
