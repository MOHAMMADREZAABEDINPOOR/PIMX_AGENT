import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const args=process.argv.slice(2),local=args.includes('--local'),[action,value]=args.filter(arg=>arg!=='--local');
if(!['migrate','promote'].includes(action))throw new Error('Use: node scripts/database-admin.mjs migrate | promote USER_ID [--local]');
if(action==='promote'&&!/^[a-zA-Z0-9_-]{1,140}$/.test(value||''))throw new Error('A valid existing user id is required.');
if(local){
 if(action==='migrate'){console.log('The local Next SQLite database initializes automatically when the app runs.');process.exit(0);}
 const {DatabaseSync}=await import('node:sqlite'),db=new DatabaseSync(resolve(process.env.APP_DATA_DIR||'.data','pimx.sqlite'));
 try{if(!db.prepare("UPDATE app_users SET role='ADMIN' WHERE id=? RETURNING id").get(value))throw new Error('User not found.');console.log('Existing local user promoted.');}finally{db.close();}
}else{
 const cli=resolve('node_modules/wrangler/bin/wrangler.js');
 if(action==='migrate')execFileSync(process.execPath,[cli,'d1','migrations','apply','DB','--remote','--config','wrangler.jsonc'],{stdio:'inherit'});
 else{const output=execFileSync(process.execPath,[cli,'d1','execute','DB','--remote','--config','wrangler.jsonc','--command',"UPDATE app_users SET role='ADMIN' WHERE id='"+value+"' RETURNING id",'--json'],{encoding:'utf8'}),results=JSON.parse(output);if(!results.some(result=>result.results?.some(row=>row.id===value)))throw new Error('User not found.');console.log('Existing Cloudflare D1 user promoted.');}
}
