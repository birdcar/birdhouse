import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import { chmod } from 'fs/promises';
import { join } from 'path';
import { platform, arch } from 'os';

async function run() {
  try {
    const version = core.getInput('version') || 'latest';

    // Determine platform
    const os = platform();
    const architecture = arch();

    const platformMap: Record<string, string> = {
      'linux-x64': 'linux-x64',
      'darwin-x64': 'darwin-x64',
      'darwin-arm64': 'darwin-arm64',
      'win32-x64': 'win32-x64',
    };

    const target = platformMap[`${os}-${architecture}`];
    if (!target) {
      throw new Error(`Unsupported platform: ${os}-${architecture}`);
    }

    const ext = os === 'win32' ? '.exe' : '';
    const binaryName = `bh-${target}${ext}`;

    // Download binary
    const downloadUrl =
      version === 'latest'
        ? `https://github.com/birdcar/birdhouse/releases/latest/download/${binaryName}`
        : `https://github.com/birdcar/birdhouse/releases/download/v${version}/${binaryName}`;

    core.info(`Downloading Birdhouse from ${downloadUrl}`);
    const downloadPath = await tc.downloadTool(downloadUrl);

    // Make executable
    const binDir = join(process.env.RUNNER_TEMP!, 'birdhouse', 'bin');
    await io.mkdirP(binDir);

    const binPath = join(binDir, `bh${ext}`);
    await io.cp(downloadPath, binPath);

    if (os !== 'win32') {
      await chmod(binPath, '755');
    }

    // Add to PATH
    core.addPath(binDir);
    core.info('Birdhouse installed and added to PATH');

    // Set GITHUB_TOKEN for CLI
    const token = core.getInput('token');
    if (token) {
      core.exportVariable('GITHUB_TOKEN', token);
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
