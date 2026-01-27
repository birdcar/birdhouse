# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
