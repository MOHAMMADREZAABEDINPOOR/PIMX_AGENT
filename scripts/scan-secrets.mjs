import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const options={encoding:'utf8',stdio:['ignore','pipe','pipe']};
let tracked=false,files;
try{files=execFileSync('git',['ls-files'],options).trim().split('\n');tracked=true;}catch{files=execFileSync('rg',['--files','--hidden','-g','!node_modules/**','-g','!.next/**','-g','!.data/**','-g','!artifacts/**','-g','!public/fonts/**','-g','!package-lock.json'],options).trim().split('\n');}
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bAIza[0-9A-Za-z_-]{35}\b/,/\b(?:sk-(?:proj-|ant-api\d+-|or-v1-)?|ghp_|github_pat_)[0-9A-Za-z_-]{30,}\b/,/\bAKIA[0-9A-Z]{16}\b/,/\b(?:postgres(?:ql)?|mysql):\/\/[^\s:"']+:[^\s@"']+@/];
const findings=[];
for(const file of files){if(!/\.(?:[cm]?js|jsx|ts|tsx|json|md|txt|toml|sql|ya?ml|example)$/.test(file) && !/(?:^|[\\/])\.env(?:\.[\w-]+)*$/.test(file))continue;const lines=readFileSync(file,'utf8').split('\n');lines.forEach((line,index)=>{if(patterns.some(pattern=>pattern.test(line)))findings.push(`${file}:${index+1}`);});}
if(tracked){const commits=execFileSync('git',['rev-list','--all'],options).trim().split('\n').filter(Boolean);for(const commit of commits){const diff=execFileSync('git',['show','--format=','--no-ext-diff',commit],{...options,maxBuffer:50*1024*1024});if(patterns.some(pattern=>pattern.test(diff)))findings.push(`Git commit ${commit}`);}console.log('Tracked files and available Git history scanned.');}else console.log('Workspace files scanned. Git history is not present in this directory.');
if(findings.length){console.error('Possible secrets found; values withheld:\n'+findings.join('\n'));process.exitCode=1;}else console.log('No supported secret patterns found.');
