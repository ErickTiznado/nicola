import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import readline from 'readline';
import { green, yellow, red, blue, magent, cyan, bold } from '../utils/console.js';

class LiveCurrent {
    constructor(entryPoint) {
        this.entryPoint = entryPoint;
        this.process = null;
        this.debounceTimer = null;
        this.isReloading = false;
        this.startTime = 0;

        // Error handling
        this.stderrBuffer = '';

        // Configuration
        this.debounceDelay = 200;
        this.allowedExtensions = ['.js', '.json', '.env'];
        this.ignoredDirs = ['node_modules', '.git', 'logs', 'coverage', 'test'];

        // Status tracking
        this.state = 'IDLE'; // IDLE, BOOTING, READY, CRASHED
    }

    boot() {
        console.clear();
        this.printBanner();
        this.setupInteractiveMode();
        this.watch();
        this.reload('Initial boot');

        process.on('SIGINT', () => this.cleanup());
        process.on('SIGTERM', () => this.cleanup());
    }

    printBanner() {
        console.log(bold(cyan(`\n🚀 Nicola Framework`)));
        console.log(blue(`   Press 'h' for help\n`));
    }

    printHelp() {
        console.log(bold('\n   Shortcuts:'));
        console.log(`   ${bold('r')} - Hard Restart`);
        console.log(`   ${bold('c')} - Clear Console`);
        console.log(`   ${bold('i')} - Show Inspector/Config`);
        console.log(`   ${bold('q')} - Quit`);
        console.log(`   ${bold('h')} - Show this help\n`);
    }

    printInspector() {
        console.log(bold('\n   Configuration Inspector:'));
        console.log(`   Entry Point: ${cyan(this.entryPoint)}`);
        console.log(`   Watched Ext: ${yellow(this.allowedExtensions.join(', '))}`);
        console.log(`   Ignored Dirs: ${yellow(this.ignoredDirs.join(', '))}`);
        console.log(`   Current State: ${this.getStateColor(this.state)(this.state)}\n`);
    }

    getStateColor(state) {
        switch (state) {
            case 'READY': return green;
            case 'CRASHED': return red;
            case 'BOOTING': return yellow;
            default: return blue;
        }
    }

    async ignite() {
        this.state = 'BOOTING';
        this.startTime = Date.now();
        this.stderrBuffer = ''; // Reset buffer

        this.process = spawn('node', [this.entryPoint], {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        this.process.stdout.on('data', (data) => this.handleStdout(data));
        this.process.stderr.on('data', (data) => {
            this.handleStderr(data);
            this.stderrBuffer += data.toString();
        });

        this.process.on('error', (err) => {
            console.error(red(`❌ Failed to start process: ${err.message}`));
            this.state = 'CRASHED';
        });

        this.process.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                this.state = 'CRASHED';
                process.stdout.write('\x07'); // Bell

                // Smart Crash Analysis
                this.analyzeCrash(code);
            }
        });
    }

    handleStdout(data) {
        const text = data.toString();
        if (text.includes('http://') || text.includes('listening')) {
            if (this.state !== 'READY') {
                const duration = Date.now() - this.startTime;
                console.log(green(`🟢 Ready in ${duration}ms`));
                this.state = 'READY';
            }
        }
        process.stdout.write(text);
    }

    handleStderr(data) {
        // Just pass through live, we buffer it for analysis on exit
        process.stderr.write(data);
    }

    analyzeCrash(code) {
        console.log(''); // New line
        const errorText = this.stderrBuffer;

        // Try to parse file location
        // Common format: /path/to/file.js:line:col
        // Or SyntaxError: ... \n    at ... (/path/to/file.js:line:col)
        let match = errorText.match(/\((.+):(\d+):(\d+)\)/); // Stack trace style
        if (!match) {
            match = errorText.match(/^(.+):(\d+)$/m); // Syntax Error style top line
            if (!match) {
                // Try loose match for file path at start of line
                match = errorText.match(/^(.+\.js):(\d+)/m);
            }
        }

        const boxWidth = 60;
        const line = '━'.repeat(boxWidth);
        const title = ' 💥 APP CRASHED ';
        const padding = ' '.repeat(Math.max(0, boxWidth - title.length - 2));

        console.log(red(` ┏${line}┓`));
        console.log(red(` ┃${title}${padding}┃`));
        console.log(red(` ┗${line}┛`));

        if (match) {
            const filePath = match[1];
            const lineNum = parseInt(match[2]);
            const relativePath = path.relative(process.cwd(), filePath);

            console.log(bold(`\n 📂 Location:`));
            console.log(`    ${cyan(relativePath)}:${yellow(lineNum)}`);

            this.printCodeFrame(filePath, lineNum);
        } else {
            console.log(yellow(`\n ⚠️  Could not pinpoint file location.`));
        }

        console.log(red(`\n 🔄 Waiting for changes...`));
    }

    printCodeFrame(filePath, lineNum) {
        try {
            if (!fs.existsSync(filePath)) return;

            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const start = Math.max(0, lineNum - 3);
            const end = Math.min(lines.length, lineNum + 2);

            console.log(bold(`\n 💻 Code:`));

            for (let i = start; i < end; i++) {
                const currentLine = i + 1;
                const isErrorLine = currentLine === lineNum;
                const prefix = isErrorLine ? red(' > ') : '   ';
                const lineContent = lines[i].replace(/\r$/, ''); // Remove \r

                let output = `${prefix}${String(currentLine).padEnd(3)} | ${lineContent}`;
                if (isErrorLine) {
                    console.log(bold(output));
                } else {
                    console.log(canary(output)); // Using a dim color if available, else just log
                }
            }
        } catch (e) {
            // Ignore errors reading file
        }
    }

    // ... helper for weak color


    async reload(trigger = 'manual') {
        if (this.isReloading) return;
        this.isReloading = true;
        this.state = 'BOOTING';

        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(async () => {
            console.clear();
            this.printBanner();
            console.log(magent(`\n🔄 Reloading... (${trigger})`));

            await this.killProcess();
            await this.ignite();

            this.isReloading = false;
        }, this.debounceDelay);
    }

    killProcess() {
        return new Promise((resolve) => {
            if (!this.process || this.process.killed) {
                resolve();
                return;
            }
            this.process.once('exit', () => {
                this.process = null;
                resolve();
            });
            this.process.kill();
        });
    }

    watch() {
        fs.watch(process.cwd(), { recursive: true }, (eventType, filename) => {
            if (!filename || this.shouldIgnore(filename)) return;
            this.reload(`File changed: ${filename}`);
        });
    }

    shouldIgnore(filename) {
        const normalized = filename.replace(/\\/g, '/');
        const parts = normalized.split('/');
        for (const part of parts) {
            if (this.ignoredDirs.includes(part) || (part.startsWith('.') && part !== '.env')) {
                if (part === '.env') return false;
                return true;
            }
        }
        const ext = path.extname(filename);
        if (ext && !this.allowedExtensions.includes(ext)) return true;
        return false;
    }

    setupInteractiveMode() {
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', (key) => {
                if (key === '\u0003') this.cleanup();
                const input = key.toString().trim().toLowerCase();
                if (input === 'q') this.cleanup();
                if (input === 'r') this.reload('Manual Shortcut');
                if (input === 'c') console.clear();
                if (input === 'h') this.printHelp();
                if (input === 'i') this.printInspector();
            });
        }
    }

    cleanup() {
        if (this.process) this.process.kill();
        process.exit();
    }
}

// Adding a helper for dim text since it wasn't in original imports
function canary(text) { return `\x1b[90m${text}\x1b[0m`; }

export default LiveCurrent;