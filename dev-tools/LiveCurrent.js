import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { green, yellow, red, blue, magent, cyan, bold } from '../utils/console.js';

class LiveCurrent {
    constructor(entryPoint) {
        this.entryPoint = entryPoint;
        this.process = null;
        this.debounceTimer = null;
        this.isReloading = false;
        this.startTime = 0;

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

        // Cleanup on exit
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

        // Spawn with 'pipe' for stdio to intercept logs
        // capturing stdout/stderr allows us to filter/highlight/detect state
        this.process = spawn('node', [this.entryPoint], {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        this.process.stdout.on('data', (data) => this.handleStdout(data));
        this.process.stderr.on('data', (data) => this.handleStderr(data));

        this.process.on('error', (err) => {
            console.error(red(`❌ Failed to start process: ${err.message}`));
            this.state = 'CRASHED';
        });

        this.process.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                this.state = 'CRASHED';
                process.stdout.write('\x07'); // Bell
                console.log(red(`\n🔴 App crashed with code ${code}. Waiting for changes...`));
            }
        });
    }

    handleStdout(data) {
        const text = data.toString();

        // Smart URL detection
        if (text.includes('http://') || text.includes('listening')) {
            if (this.state !== 'READY') {
                const duration = Date.now() - this.startTime;
                console.log(green(`🟢 Ready in ${duration}ms`));
                this.state = 'READY';
            }
        }

        // Pass through logs
        process.stdout.write(text);
    }

    handleStderr(data) {
        const text = data.toString();
        // Highlight stack traces
        const formatted = text.replace(/(\/[^:]+:\d+:\d+)/g, bold(cyan('$1')));
        process.stderr.write(formatted);
    }

    async reload(trigger = 'manual') {
        if (this.isReloading) return;
        this.isReloading = true;
        this.state = 'BOOTING';

        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(async () => {
            // Smart clear: only clear if we are not in a crash loop or if requested
            // For now, always clear to give fresh view
            console.clear();
            this.printBanner(); // Reprint banner
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
                // CTRL+C (Exit)
                if (key === '\u0003') {
                    this.cleanup();
                }

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
        if (this.process) {
            this.process.kill();
        }
        process.exit();
    }
}

export default LiveCurrent;