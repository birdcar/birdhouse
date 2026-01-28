# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Install script** (`install.sh`) - One-liner installation via `curl -fsSL https://raw.githubusercontent.com/birdcar/birdhouse/main/install.sh | sh`
- **SHA256 checksums** - All release binaries now include SHA256SUMS for verification
- **Workday startup ritual** (`workday-startup.md`) - Prioritize your Big 3, check calendar, and prepare for focused work
- **Workday shutdown ritual** (`workday-shutdown.md`) - Review progress on Big 3, process loose ends, and mentally transition out of work mode
- **New schedule config options** - `schedule.rituals.workdayStartup` and `schedule.rituals.workdayShutdown` for configuring ritual times

### Changed

- Updated rituals workflow to support all 5 Full Focus rituals (morning, workday-startup, workday-shutdown, evening, weekly-preview)

## [v0.1.16] - 2026-01-28

### Changed

- Verify OIDC Trusted Publishing works with npm after configuration

## [v0.1.15] - 2026-01-28

### Fixed

- Remove NODE_AUTH_TOKEN to enable OIDC Trusted Publishing for npm

## [v0.1.14] - 2026-01-28

### Added

- Platform-specific npm packages: darwin-arm64, darwin-x64, linux-arm64, linux-x64, win32-x64
- Main `birdhouse` package with optionalDependencies and wrapper script
- `scripts/prepare-npm.ts` to copy binaries and sync versions at publish time

### Changed

- Add `pr-label-check` workflow to auto-apply `release.patch` when no release label found
- Simplify pre-commit hook to only run tests (remove validation)
- Update release workflow to use keep-a-changelog merge behavior

## [v0.1.13] - 2026-01-27

### Added

- Two missing Full Focus rituals: workday-startup and workday-shutdown

### Changed

- Update config schema with new ritual time settings (`schedule.rituals.workdayStartup`, `schedule.rituals.workdayShutdown`)
- Update schedule generation for new cron expressions
- Update rituals workflow to support all 5 Full Focus rituals

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

## [v0.1.10] - 2026-01-27

### Added

- CLAUDE.md with comprehensive project documentation for AI agents
- AGENTS.md symlink for alternative naming convention

## [v0.1.9] - 2026-01-27

### Changed

- Removes symlinked README.md that was pointing to .github/README.md
- Moves the actual README content to the root README.md file

### Fixed

- npm publish now works correctly with README.md as a regular file instead of a symlink

## [v0.1.8] - 2026-01-27

### Added

- **Husky** for git hooks management
- **Pre-commit hook** that runs tests before commit and skips checks in CI environments

## [v0.1.7] - 2026-01-27

### Changed

- Use native bun pm version command

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

- Consolidate release, build, and publish into single `release.yml` workflow
- Auto-release creates tag and GitHub release on PR merge

## [v0.1.2] - 2026-01-27

### Added

- **CHANGELOG.md** in [Keep a Changelog](https://keepachangelog.com/) format
- **Auto-release workflow** triggered on PR merge with version bumping based on labels
- **Build workflow** that creates GitHub releases and builds platform binaries
- **NPM publish workflow** with OIDC trusted publishing
- **Release labels** (`release.major`, `release.minor`, `release.patch`, `release.skip`)

### Changed

- Release workflow now uses `birdcar/actions/auto-release`

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

[Unreleased]: https://github.com/birdcar/birdhouse/compare/v0.1.16...HEAD
[v0.1.16]: https://github.com/birdcar/birdhouse/compare/v0.1.15...v0.1.16
[v0.1.15]: https://github.com/birdcar/birdhouse/compare/v0.1.14...v0.1.15
[v0.1.14]: https://github.com/birdcar/birdhouse/compare/v0.1.13...v0.1.14
[v0.1.13]: https://github.com/birdcar/birdhouse/compare/v0.1.12...v0.1.13
[v0.1.12]: https://github.com/birdcar/birdhouse/compare/v0.1.11...v0.1.12
[v0.1.11]: https://github.com/birdcar/birdhouse/compare/v0.1.10...v0.1.11
[v0.1.10]: https://github.com/birdcar/birdhouse/compare/v0.1.9...v0.1.10
[v0.1.9]: https://github.com/birdcar/birdhouse/compare/v0.1.8...v0.1.9
[v0.1.8]: https://github.com/birdcar/birdhouse/compare/v0.1.7...v0.1.8
[v0.1.7]: https://github.com/birdcar/birdhouse/compare/v0.1.6...v0.1.7
[v0.1.6]: https://github.com/birdcar/birdhouse/compare/v0.1.5...v0.1.6
[v0.1.5]: https://github.com/birdcar/birdhouse/compare/v0.1.4...v0.1.5
[v0.1.4]: https://github.com/birdcar/birdhouse/compare/v0.1.3...v0.1.4
[v0.1.3]: https://github.com/birdcar/birdhouse/compare/v0.1.2...v0.1.3
[v0.1.2]: https://github.com/birdcar/birdhouse/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/birdcar/birdhouse/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/birdcar/birdhouse/releases/tag/v0.1.0
