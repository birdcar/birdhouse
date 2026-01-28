// scripts/generate-checksums.ts
import { $ } from 'bun';
import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const distDir = join(import.meta.dir, '..', 'dist');
const binaries = readdirSync(distDir).filter(f => f.startsWith('bh-'));

let checksums = '';
for (const binary of binaries) {
  const path = join(distDir, binary);
  const result = await $`shasum -a 256 ${path}`.text();
  // Extract just hash and filename
  const [hash] = result.trim().split(/\s+/);
  checksums += `${hash}  ${binary}\n`;
}

writeFileSync(join(distDir, 'SHA256SUMS'), checksums);
console.log('Generated SHA256SUMS:');
console.log(checksums);
