# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Verify that auto binary publishing works with OIDC Trusted Publishing

### Added

- **Workday startup ritual** (`workday-startup.md`) - Prioritize your Big 3, check calendar, and prepare for focused work
- **Workday shutdown ritual** (`workday-shutdown.md`) - Review progress on Big 3, process loose ends, and mentally transition out of work mode
- **New schedule config options** - `schedule.rituals.workdayStartup` and `schedule.rituals.workdayShutdown` for configuring ritual times
- **Updated rituals workflow** - Now supports all 5 Full Focus rituals (morning, workday-startup, workday-shutdown, evening, weekly-preview)

## [v0.1.15] - 2026-01-28

### Changed

- [ ] Merge and verify publish job succeeds

## [v0.1.14] - 2026-01-28

### Changed

- Add `pr-label-check` workflow to auto-apply `release.patch` when no release label found
- Simplify pre-commit hook to only run tests (remove validation)
- Update release workflow to use keep-a-changelog merge behavior
- Update CLAUDE.md documentation for new release process
- Add platform-specific packages: darwin-arm64, darwin-x64, linux-arm64, linux-x64, win32-x64
- Add main `birdhouse` package with optionalDependencies and wrapper script
- Add `scripts/prepare-npm.ts` to copy binaries and sync versions at publish time
- Platform binaries are gitignored (copied from `dist/` at publish time)
- [x] Unit tests pass (`bun test`)
- [ ] Create PR without release label → verify `release.patch` auto-applied
- [ ] End-to-end release test after auto-release action PR is merged

## [v0.1.13] - 2026-01-27

### Changed

- Adds two missing Full Focus rituals: workday-startup and workday-shutdown
- Updates config schema with new ritual time settings (`schedule.rituals.workdayStartup`, `schedule.rituals.workdayShutdown`)
- Updates schedule generation for new cron expressions
- Updates rituals workflow to support all 5 Full Focus rituals
- [x] TypeScript compiles without errors
- [x] All 170 tests pass
- [x] README and CHANGELOG updated
- [ ] Verify rituals workflow generates correct cron expressions after publish

## [v0.1.12] - 2026-01-27

### Changed

- Added command flags table (`--token`, `--repo`, `--no-prompt`, `--dry-run`, `--from`)
- Added Local Usage section with credential resolution chain
- Added GitHub Actions example with permissions block
- CLAUDE.md now includes local usage and command flag documentation

## [v0.1.11] - 2026-01-27

### Added

- **npm/bun installation** - Document `npm install -g @birdcar/birdhouse` and `bunx` usage
- **Local Usage section** - Document credential resolution chain (gh CLI → flags → env → git remote → prompts)
- **Command flags** - Document `--token`, `--repo`, `--no-prompt` on `daily` and `migrate`
- **Migrate `--from`** - Document option to specify source issue number
- **Rituals documentation** - Document morning/evening/weekly-preview templates
- **Template locations** - Added location column to templates table

### Changed

- Expanded command examples to show all available flags
- Clarified that automatic GITHUB_TOKEN works (no PAT required)
- Added permissions block to GitHub Action examples
- README now accurately documents all CLI features including local usage

## [v0.1.10] - 2026-01-27

### Added

- CLAUDE.md with comprehensive project documentation for AI agents
- AGENTS.md symlink for alternative naming convention

### Changed

- Adds comprehensive `CLAUDE.md` with project context for AI agents
- Creates `AGENTS.md` symlink pointing to `CLAUDE.md`
- Quick reference commands
- Project structure overview
- Architecture documentation (CLI framework, config, GitHub integration, templates)
- Code conventions (TypeScript, testing, error handling)
- Command reference table
- Dependencies documentation
- Build and release process (including automated release workflow)
- Environment variables
- Common tasks (adding commands, config options, GitHub API usage)
- Troubleshooting guide

## [v0.1.9] - 2026-01-27

### Changed

- Removes symlinked README.md that was pointing to .github/README.md
- Moves the actual README content to the root README.md file
- Fixes npm publish issue where symlinks are not properly resolved

### Fixed

- npm publish now works correctly with README.md as a regular file instead of a symlink

## [v0.1.8] - 2026-01-27

### Added

- **Husky** for git hooks management
- **Pre-commit hook** that:
- Blocks manual changes to `package.json` version field
- Blocks manual changes to `CHANGELOG.md` version headers (e.g., `## [0.1.7]`)
- Allows editing the `[Unreleased]` section in CHANGELOG.md
- Skips checks in CI environments
- Runs tests before commit
- Provides clear error messages with bypass instructions

## [v0.1.7] - 2026-01-27

### Changed

- chore: Use native bun pm version command

## [v0.1.6] - 2026-01-27

### Changed

- Use `bunx npm version` instead of `jq` for cleaner version updates
- Add bun setup to the release job
- Pull latest main before bumping to avoid push conflicts

### Fixed

- Release job now properly updates package.json and syncs main branch

## [v0.1.5] - 2026-01-27

### Fixed

- package.json version now matches release tag
- npm publish should succeed with correct version

## [v0.1.4] - 2026-01-27

### Fixed

- Build job checkout now uses correct tag reference
- Publish job checkout now uses correct tag reference
- Binary upload now uses correct tag for release

## [v0.1.3] - 2026-01-27

### Changed

- `release.yml` - auto-release (creates tag + release)
- `build.yml` - triggered by tag push
- `publish.yml` - triggered by release published
- Merged `build.yml` and `publish.yml` into `release.yml`
- Removed separate `build.yml` and `publish.yml` workflows

## [v0.1.2] - 2026-01-27

### Added

- **CHANGELOG.md** in [Keep a Changelog](https://keepachangelog.com/) format with existing release history
- **Auto-release workflow** that triggers on PR merge and:
- Bumps version based on `release.*` labels (major/minor/patch)
- Updates CHANGELOG.md automatically
- Creates and pushes git tags
- **Build workflow** triggered by version tags that:
- Creates GitHub releases from changelog content
- Builds platform binaries (linux/darwin/win32, x64/arm64)
- Uploads binaries to releases via `gh` CLI
- **NPM publish workflow** with OIDC trusted publishing (no token secrets required)
- **Release labels** (`release.major`, `release.minor`, `release.patch`, `release.skip`, etc.)

### Changed

- Release workflow now uses `birdcar/actions/auto-release` instead of manual version management

## [0.1.1] - 2025-01-26

### Added

- Interactive prompts and git remote detection
- Flexible credential resolution for local execution
- Installation via npm

## [0.1.0] - 2025-01-25

### Added

- Initial release
- CLI tool for managing GitHub workflow templates
- Support for listing and installing workflow templates from birdcar/actions

[Unreleased]: https://github.com/birdcar/birdhouse/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/birdcar/birdhouse/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/birdcar/birdhouse/releases/tag/v0.1.0
