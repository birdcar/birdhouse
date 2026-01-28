import { $ } from 'bun';
import { readFileSync, writeFileSync, copyFileSync, chmodSync } from 'fs';
import { join } from 'path';

const ROOT = import.meta.dir + '/..';
const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;

const platforms = [
  { name: 'darwin-arm64', binary: 'bh-darwin-arm64', outName: 'bh' },
  { name: 'darwin-x64', binary: 'bh-darwin-x64', outName: 'bh' },
  { name: 'linux-arm64', binary: 'bh-linux-arm64', outName: 'bh' },
  { name: 'linux-x64', binary: 'bh-linux-x64', outName: 'bh' },
  { name: 'win32-x64', binary: 'bh-win32-x64.exe', outName: 'bh.exe' },
];

// Update main package version
const mainPkgPath = join(ROOT, 'npm/birdhouse/package.json');
const mainPkg = JSON.parse(readFileSync(mainPkgPath, 'utf8'));
mainPkg.version = version;
for (const { name } of platforms) {
  mainPkg.optionalDependencies[`@birdcar/birdhouse-${name}`] = version;
}
writeFileSync(mainPkgPath, JSON.stringify(mainPkg, null, 2) + '\n');

// Update platform packages
for (const { name, binary, outName } of platforms) {
  const pkgDir = join(ROOT, `npm/birdhouse-${name}`);
  const pkgPath = join(pkgDir, 'package.json');
  const binDir = join(pkgDir, 'bin');

  // Update version
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // Copy binary
  await $`mkdir -p ${binDir}`;
  copyFileSync(join(ROOT, 'dist', binary), join(binDir, outName));
  chmodSync(join(binDir, outName), 0o755);

  console.log(`Prepared @birdcar/birdhouse-${name}@${version}`);
}

console.log(`Prepared @birdcar/birdhouse@${version}`);
