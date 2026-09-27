import {cpSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {build} from 'esbuild';
import {builtinModules} from 'node:module';
mkdirSync('.pages-output',{recursive:true});
cpSync('.open-next/assets','.pages-output',{recursive:true});
await build({entryPoints:['cloudflare-pages/app-worker.js'],outfile:'.pages-output/_worker.js',bundle:true,format:'esm',platform:'neutral',target:'es2022',external:['node:*','cloudflare:*'],conditions:['workerd','worker','browser'],minify:true,loader:{'.wasm':'binary','.bin':'binary'},legalComments:'none',banner:{js:'import {createRequire as __workerCreateRequire} from "node:module"; const require=__workerCreateRequire("/worker.js");'},plugins:[
 {name:'local-only-sqlite',setup(builder){
  builder.onResolve({filter:/^(?:node:)?sqlite$/},()=>({path:'local-only-sqlite',namespace:'local-only-sqlite'}));
  builder.onLoad({filter:/.*/,namespace:'local-only-sqlite'},()=>({contents:'export class DatabaseSync { constructor(){throw new Error("Cloudflare requires a D1 database binding.");} }',loader:'js'}));
 }},
 {name:'node-builtins',setup(builder){builder.onResolve({filter:new RegExp(`^(${builtinModules.filter(name=>!name.startsWith('node:')).map(name=>name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})$`)},args=>({path:`node:${args.path}`,external:true}));}}
]});
if(/\bimport\s*\(\s*["']node:sqlite["']/.test(readFileSync('.pages-output/_worker.js','utf8')))throw new Error('Local SQLite must not be statically imported by the Cloudflare Pages worker.');
writeFileSync('.pages-output/_routes.json',JSON.stringify({version:1,include:['/*'],exclude:['/_next/static/*','/media/*','/fonts/*','/icons/*','/sw.js','/offline.html','/brand-logo.webp']}));
console.log('Cloudflare Pages app, assets and D1 runtime packaged.');
