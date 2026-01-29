# Birdhouse

CLI tool for managing GitHub workflow templates and daily thread automation.

## Quick Reference

```bash
bun install          # Install dependencies
bun test             # Run tests
bun run typecheck    # Type check
bun run build        # Build for npm
bun run dev          # Run from source
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── cli.ts                # Clipanion CLI setup
├── commands/             # CLI commands (init, daily, render, publish, migrate)
├── config/               # Config loading and validation (typanion schemas)
├── credentials/          # GitHub auth resolution
├── github/               # GitHub API client (Octokit)
├── tasks/                # Task parsing from markdown
├── template/             # Template rendering (remark)
├── publish/              # Workflow/template publishing
└── utils/                # Shared utilities
```

## Code Conventions

- **TypeScript**: Strict mode, ES2022, NodeNext modules, `.js` extensions in imports
- **Testing**: Bun test runner, colocated `*.test.ts` files
- **Organization**: One export per file, re-exported through `index.ts`

## Build & Release

### ⚠️ CRITICAL: Static Assets Must Be Inlined

Bun's bundler does NOT include files read via `Bun.file()`. Static assets must be inlined as TypeScript strings.

```typescript
// BROKEN - file won't exist after bundling
const content = await Bun.file(join(import.meta.dir, 'template.md')).text();

// CORRECT - inline in src/publish/assets.ts
export const ASSET_CONTENTS = { 'template.md': `# Content...` };
```

When adding publishable assets:
1. Add file to `src/publish/assets/` for source control
2. Add content to `ASSET_CONTENTS` in `src/publish/assets.ts`

### ⚠️ CRITICAL: npm OIDC Publishing

The release workflow uses OIDC Trusted Publishing. **NEVER** add `NODE_AUTH_TOKEN` or `NPM_TOKEN` to publish steps - it breaks authentication.

### Release Process

PRs auto-release on merge based on labels (all labels use `release.*` prefix):

| Label | Version Bump |
|-------|--------------|
| `release.major`, `release.breaking` | Major (x.0.0) |
| `release.minor`, `release.feature` | Minor (0.x.0) |
| `release.patch`, `release.fix` | Patch (0.0.x) |
| `release.skip`, `release.docs`, `release.ci` | No release |

If no label is present, `release.patch` is auto-applied.

### PR Format

PR title becomes the changelog entry. Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).

```
## Summary
Brief description of what changed and why.

---
(Everything below --- is ignored in releases)

## Test plan
- [ ] Tests pass
```

**Rules:**
- No "Generated with Claude Code" attribution
- No task checklists above `---`

### Homebrew Updates

The homebrew-tap polls daily at 6am UTC. For immediate updates:
```bash
gh workflow run update-formula.yml --repo birdcar/homebrew-tap
```

## Common Tasks

### Adding a Command

1. Create `src/commands/newcmd.ts` extending `Command`
2. Register in `src/cli.ts`
3. Export from `src/commands/index.ts`
4. Add tests in `src/commands/newcmd.test.ts`

### Adding Config Options

1. Update schema in `src/config/schema.ts`
2. Update defaults in `src/config/defaults.ts`
