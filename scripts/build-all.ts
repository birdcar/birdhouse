import { $ } from 'bun';

const targets = [
  { name: 'darwin-arm64', target: 'bun-darwin-arm64' },
  { name: 'darwin-x64', target: 'bun-darwin-x64' },
  { name: 'linux-arm64', target: 'bun-linux-arm64' },
  { name: 'linux-x64', target: 'bun-linux-x64' },
  { name: 'win32-x64.exe', target: 'bun-windows-x64' },
];

console.log('Building for all platforms...\n');

for (const { name, target } of targets) {
  console.log(`Building ${name}...`);
  await $`bun build src/index.ts --compile --target=${target} --outfile dist/bh-${name}`;
  console.log(`  ✓ dist/bh-${name}\n`);
}

console.log('All builds complete!');
