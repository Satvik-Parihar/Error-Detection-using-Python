const { spawn } = require('child_process');
const path = require('path');

function runProcess(command, args, name, color) {
    const proc = spawn(command, args, {
        shell: true,
        stdio: 'pipe',
        cwd: process.cwd() // Run from root
    });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) console.log(`${color}[${name}] \x1b[0m${line.trim()}`);
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) console.error(`\x1b[31m[${name} ERROR] \x1b[0m${line.trim()}`);
        });
    });

    return proc;
}

console.log('\x1b[36mStarting Error Detection Project...\x1b[0m');

// Start Backend
const backend = runProcess('python', ['-m', 'uvicorn', 'main:app', '--reload', '--port', '8000', '--app-dir', 'backend'], 'BACKEND', '\x1b[32m');

// Start Frontend
const frontend = runProcess('npm', ['run', 'dev', '--prefix', 'frontend'], 'FRONTEND', '\x1b[33m');

process.on('SIGINT', () => {
    console.log('\n\x1b[36mStopping services...\x1b[0m');
    backend.kill();
    frontend.kill();
    process.exit();
});
