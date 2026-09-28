import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
if(process.argv[2]!=='migrate')throw new Error('Use: node scripts/database-admin.mjs migrate [--local]');
if(process.argv.includes('--local'))console.log('The local Next SQLite database initializes automatically.');
else execFileSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'d1','migrations','apply','DB','--remote','--config','wrangler.jsonc'],{stdio:'inherit'});
