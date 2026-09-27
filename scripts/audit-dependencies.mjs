import { spawn } from 'node:child_process';

// npm 12 passes install-only allow-scripts into lifecycle subprocesses, but
// rejects that inherited option for this read-only, project-scoped audit.
const env = { ...process.env };
for (const key of Object.keys(env)) if (key.toLowerCase() === 'npm_config_allow_scripts') delete env[key];
const options = { env, stdio: 'inherit' };
const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm audit --audit-level=moderate --ignore-scripts'] : ['audit', '--audit-level=moderate', '--ignore-scripts'];
const child = spawn(command, args, options);
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
