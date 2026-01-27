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
├── index.ts              # Entry point (shebang, runs cli)
├── cli.ts                # Clipanion CLI setup, registers commands
├── commands/             # CLI commands (init, daily, render, publish, migrate)
├── config/               # Config loading and validation (typanion schemas)
├── credentials/          # GitHub auth resolution (gh CLI, env, prompts)
├── github/               # GitHub API client (Octokit wrapper, issues)
├── tasks/                # Task parsing from markdown (remark plugins)
├── template/             # Template rendering (remark, variable substitution)
├── publish/              # Workflow/template publishing logic
└── utils/                # Shared utilities (logger, paths, schedule)
```

## Architecture

### CLI Framework
Uses [Clipanion](https://mael.dev/clipanion/) for command parsing. Commands extend `Command` class with static `paths` and `usage`, and implement `execute()`.

### Config System
- Config lives in `.birdhouse/config.yaml`
- Schema defined with [typanion](https://github.com/arcanis/typanion) in `src/config/schema.ts`
- Defaults in `src/config/defaults.ts`

### GitHub Integration
- Octokit for REST/GraphQL API
- Credential resolution chain: gh CLI → CLI flags → env vars → git remote → interactive prompts
- GraphQL required for issue pinning (not in REST API)

### Template System
- Uses [remark](https://remark.js.org/) for markdown processing
- Custom remark plugin for variable substitution (`{{date}}`, `{{time}}`, etc.)
- Templates stored in `.birdhouse/templates/`

## Code Conventions

### TypeScript
- Strict mode enabled
- ES2022 target, NodeNext modules
- Use `.js` extensions in imports (for ESM compatibility)
- Prefer explicit types over inference for function signatures
- Use `type` imports for type-only imports

### Testing
- Bun test runner (`bun:test`)
- Test files colocated with source: `*.test.ts`
- Tests use temp directories, clean up in `afterEach`
- Run CLI commands via `cli.run(['command', 'args'])`

### Error Handling
- Custom error classes for specific scenarios (e.g., `CredentialResolutionError`)
- Commands return exit codes (0 = success, 1 = error)
- Use `logger.error()` for user-facing errors

### File Organization
- One export per file, re-exported through `index.ts`
- Keep commands thin, delegate to domain modules
- Colocate tests with source files

## Commands

| Command | Description |
|---------|-------------|
| `bh init` | Initialize `.birdhouse/` directory |
| `bh daily` | Create daily thread issue |
| `bh render <template>` | Render a template to stdout |
| `bh publish` | Publish workflows/templates to repo |
| `bh migrate` | Migrate tasks between daily threads |

### Command Flags

Commands that interact with GitHub (`daily`, `migrate`) support these flags:

| Flag | Description |
|------|-------------|
| `--token, -t` | GitHub token (overrides auto-detection) |
| `--repo, -r` | Target repository in `owner/repo` format |
| `--no-prompt` | Disable interactive credential prompts |
| `--dry-run, -n` | Preview without making changes |

The `migrate` command also supports `--from <issue>` to specify source issue number.

## Local Usage

When running locally (not in GitHub Actions), credentials resolve in order:

1. **GitHub CLI** - `gh auth token` and repo context from `gh`
2. **CLI flags** - `--token` and `--repo` override everything
3. **Environment** - `GITHUB_TOKEN` and `GITHUB_REPOSITORY`
4. **Git remote** - Parses `origin` URL to detect repository
5. **Interactive prompts** - Asks for missing credentials (TTY only)

```bash
# Recommended: authenticate with gh CLI
gh auth login
bh daily

# Or explicit credentials
bh daily --token ghp_xxx --repo owner/name

# Or via environment
GITHUB_TOKEN=ghp_xxx GITHUB_REPOSITORY=owner/name bh daily

# CI/scripts: disable prompts
bh daily --no-prompt
```

### GitHub Actions

In workflows, the automatic `GITHUB_TOKEN` works - no PAT required:

```yaml
permissions:
  contents: read
  issues: write
steps:
  - uses: actions/checkout@v4
  - uses: birdcar/birdhouse@main
  - run: bh daily
```

## Dependencies

### Runtime
- `clipanion` + `typanion` - CLI framework and validation
- `@actions/*` - GitHub Actions toolkit (for action mode)
- `@octokit/*` - GitHub API (via `@actions/github`)
- `remark` + `unified` - Markdown processing
- `yaml` - Config parsing
- `isomorphic-git` - Git operations

### Dev
- `bun` - Runtime, bundler, test runner
- `typescript` - Type checking only (Bun handles compilation)
- `husky` - Git hooks

## Build & Release

### Build Commands
```bash
bun run build        # Build ESM for npm (dist/index.js + types)
bun run build:bin    # Build standalone binary
bun run build:all    # Build all platform binaries
```

### Release Process

**Automated via PR labels** - Do NOT manually edit versions.

1. Create PR with changes
2. Add appropriate label:
   - `release.major` / `release.breaking` - Breaking changes
   - `release.minor` / `release.feature` - New features
   - `release.patch` / `release.fix` - Bug fixes
   - `release.skip` - No release needed
3. Merge PR to `main`
4. Workflow automatically:
   - Updates CHANGELOG.md
   - Creates git tag and GitHub release
   - Bumps package.json version
   - Builds platform binaries
   - Publishes to npm (OIDC trusted publishing)

### Pre-commit Hooks

Husky enforces:
- No manual changes to `package.json` version field
- No manual changes to CHANGELOG.md version headers (edit `[Unreleased]` only)
- Tests must pass

Bypass with `git commit --no-verify` (not recommended).

### Changelog Format

Uses [Keep a Changelog](https://keepachangelog.com/) format:
- Add entries under `## [Unreleased]`
- Categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Auto-release moves unreleased to versioned section

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub API token (fallback if gh CLI unavailable) |
| `GITHUB_REPOSITORY` | Repository in `owner/repo` format |
| `CI` / `GITHUB_ACTIONS` | Skips pre-commit hooks in CI |

## Common Tasks

### Adding a New Command

1. Create `src/commands/newcmd.ts`:
```typescript
import { Command, Option } from 'clipanion';

export class NewCommand extends Command {
  static override paths = [['newcmd']];
  static override usage = Command.Usage({
    description: 'What it does',
    examples: [['Example', 'bh newcmd --flag']],
  });

  flag = Option.Boolean('--flag,-f', false, {
    description: 'Flag description',
  });

  async execute(): Promise<number> {
    // Implementation
    return 0;
  }
}
```

2. Register in `src/cli.ts`:
```typescript
import { NewCommand } from './commands/newcmd.js';
cli.register(NewCommand);
```

3. Export from `src/commands/index.ts`
4. Add tests in `src/commands/newcmd.test.ts`

### Adding Config Options

1. Update schema in `src/config/schema.ts`
2. Update defaults in `src/config/defaults.ts`
3. Update type exports if needed

### Working with GitHub API

```typescript
import { getGitHubClient } from '../github/index.js';
import { createIssue } from '../github/issues.js';

const client = await getGitHubClient({ token, repo });
const issue = await createIssue(client, { title, body, labels });
```

## Troubleshooting

### "GitHub credentials required"
Run `gh auth login` or provide `--token` and `--repo` flags.

### Tests failing locally
Ensure you're in the repo root. Tests create temp directories relative to test file location.

### Build failing
Check TypeScript errors: `bun run typecheck`
