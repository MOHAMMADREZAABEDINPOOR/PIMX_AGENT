import {existsSync,realpathSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {spawn} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
const directory=resolve('.data/tests'),database=resolve(directory,'pimx.sqlite');
if(existsSync(database)){if(!realpathSync(database).startsWith(directory+sep))throw new Error('The test database must remain inside the isolated test directory.');const db=new DatabaseSync(database);try{db.prepare('DELETE FROM app_limits').run();}finally{db.close();}}
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3010'],{stdio:'inherit',env:{...process.env,APP_URL:'http://localhost:3010',APP_DATA_DIR:directory,ALLOW_LOCAL_PROVIDERS:'true',TRUST_PROXY:'false'}});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{child.kill(signal);});
child.on('exit',code=>{process.exit(code || 0);});
