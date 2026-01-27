import * as readline from 'node:readline';

/**
 * Check if running in an interactive TTY.
 */
export function isTTY(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

/**
 * Prompt for a GitHub token with hidden input.
 * Throws if cancelled (Ctrl+C) or times out (60s).
 */
export async function promptToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Mute output for password-style input
    process.stdout.write('GitHub token: ');

    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;

    if (stdin.isTTY && stdin.setRawMode) {
      stdin.setRawMode(true);
    }

    let token = '';
    let resolved = false;

    const cleanup = () => {
      if (stdin.isTTY && stdin.setRawMode) {
        stdin.setRawMode(wasRaw ?? false);
      }
      stdin.removeListener('data', onData);
      rl.close();
    };

    const onData = (char: Buffer) => {
      const c = char.toString();

      if (c === '\n' || c === '\r') {
        resolved = true;
        cleanup();
        process.stdout.write('\n');
        resolve(token);
      } else if (c === '\u0003') {
        // Ctrl+C
        resolved = true;
        cleanup();
        process.stdout.write('\n');
        reject(new Error('Prompt cancelled'));
      } else if (c === '\u007f' || c === '\b') {
        // Backspace (DEL or BS)
        token = token.slice(0, -1);
      } else if (c.charCodeAt(0) >= 32) {
        // Printable characters only
        token += c;
      }
    };

    stdin.on('data', onData);

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        process.stdout.write('\n');
        reject(new Error('Prompt timed out'));
      }
    }, 60000);
  });
}

/**
 * Prompt for a repository in owner/repo format.
 * Throws if cancelled or times out (60s).
 */
export async function promptRepo(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let resolved = false;

    rl.question('Repository (owner/repo): ', (answer) => {
      if (resolved) return;
      resolved = true;
      rl.close();

      const trimmed = answer.trim();

      // Validate format
      if (!/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
        reject(new Error('Invalid format. Expected: owner/repo'));
        return;
      }

      resolve(trimmed);
    });

    // Handle Ctrl+C
    rl.on('close', () => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Prompt cancelled'));
      }
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        rl.close();
        reject(new Error('Prompt timed out'));
      }
    }, 60000);
  });
}
