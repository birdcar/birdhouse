# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changelog entries are generated automatically from PR titles when releases are created.

## [0.1.19] - 2026-01-28
### Changed
- Remove Unreleased section from CHANGELOG.md
- Add PR format guidelines with --- separator
- Document that task checklists should go below separator

## [0.1.18] - 2026-01-28
### Added
- Homebrew tap for binary distribution (`brew tap birdcar/tap && brew install birdhouse`)
- Homebrew installation instructions in README
- Optional Homebrew update trigger in release process

## [0.1.17] - 2026-01-28
### Added
- Install script (`install.sh`) for one-liner binary installation via `curl | sh`
- SHA256 checksum verification in install script
- `scripts/generate-checksums.ts` to create SHA256SUMS file for releases

### Changed
- Release workflow now generates and uploads checksums with binaries

## [0.1.16] - 2026-01-28
### Changed
- Verify OIDC Trusted Publishing works with npm after configuration

## [0.1.15] - 2026-01-28
### Fixed
- Remove NODE_AUTH_TOKEN to enable OIDC Trusted Publishing for npm

## [0.1.14] - 2026-01-28
### Added
- Platform-specific npm packages: darwin-arm64, darwin-x64, linux-arm64, linux-x64, win32-x64
- Main `birdhouse` package with optionalDependencies and wrapper script
- `scripts/prepare-npm.ts` to copy binaries and sync versions at publish time

### Changed
- Add `pr-label-check` workflow to auto-apply `release.patch` when no release label found
- Simplify pre-commit hook to only run tests (remove validation)
- Update release workflow to use keep-a-changelog merge behavior

## [0.1.13] - 2026-01-27
### Added
- Two missing Full Focus rituals: workday-startup and workday-shutdown

### Changed
- Update config schema with new ritual time settings
- Update schedule generation for new cron expressions
- Update rituals workflow to support all 5 Full Focus rituals

## [0.1.12] - 2026-01-27
### Changed
- Added command flags table (`--token`, `--repo`, `--no-prompt`, `--dry-run`, `--from`)
- Added Local Usage section with credential resolution chain
- Added GitHub Actions example with permissions block

## [0.1.11] - 2026-01-27
### Added
- npm/bun installation documentation
- Local Usage section with credential resolution chain
- Command flags documentation
- Rituals documentation

### Changed
- Expanded command examples to show all available flags
- Clarified that automatic GITHUB_TOKEN works (no PAT required)

## [0.1.10] - 2026-01-27
### Added
- CLAUDE.md with comprehensive project documentation for AI agents

## [0.1.9] - 2026-01-27
### Changed
- Moves README content to root (was symlinked to .github/README.md)

### Fixed
- npm publish now works correctly with README.md as a regular file

## [0.1.8] - 2026-01-27
### Added
- Husky for git hooks management
- Pre-commit hook that runs tests before commit

## [0.1.7] - 2026-01-27
### Changed
- Use native bun pm version command

## [0.1.6] - 2026-01-27
### Changed
- Use `bunx npm version` instead of `jq` for cleaner version updates
- Add bun setup to the release job
- Pull latest main before bumping to avoid push conflicts

### Fixed
- Release job now properly updates package.json and syncs main branch

## [0.1.5] - 2026-01-27
### Fixed
- package.json version now matches release tag

## [0.1.4] - 2026-01-27
### Fixed
- Build job checkout now uses correct tag reference
- Publish job checkout now uses correct tag reference
- Binary upload now uses correct tag for release

## [0.1.3] - 2026-01-27
### Changed
- Consolidate release, build, and publish into single `release.yml` workflow
- Auto-release creates tag and GitHub release on PR merge

## [0.1.2] - 2026-01-27
### Added
- CHANGELOG.md in Keep a Changelog format
- Auto-release workflow triggered on PR merge with version bumping based on labels
- Build workflow that creates GitHub releases and builds platform binaries
- NPM publish workflow with OIDC trusted publishing

## [0.1.1] - 2025-01-26
### Added
- Interactive prompts and git remote detection
- Flexible credential resolution for local execution
- Installation via npm

## [0.1.0] - 2025-01-25
### Added
- Initial release
- CLI tool for managing GitHub workflow templates

[0.1.19]: https://github.com/birdcar/birdhouse/compare/v0.1.18...v0.1.19
[0.1.18]: https://github.com/birdcar/birdhouse/compare/v0.1.17...v0.1.18
[0.1.17]: https://github.com/birdcar/birdhouse/compare/v0.1.16...v0.1.17
[0.1.16]: https://github.com/birdcar/birdhouse/compare/v0.1.15...v0.1.16
[0.1.15]: https://github.com/birdcar/birdhouse/compare/v0.1.14...v0.1.15
[0.1.14]: https://github.com/birdcar/birdhouse/compare/v0.1.13...v0.1.14
[0.1.13]: https://github.com/birdcar/birdhouse/compare/v0.1.12...v0.1.13
[0.1.12]: https://github.com/birdcar/birdhouse/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/birdcar/birdhouse/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/birdcar/birdhouse/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/birdcar/birdhouse/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/birdcar/birdhouse/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/birdcar/birdhouse/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/birdcar/birdhouse/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/birdcar/birdhouse/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/birdcar/birdhouse/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/birdcar/birdhouse/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/birdcar/birdhouse/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/birdcar/birdhouse/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/birdcar/birdhouse/releases/tag/v0.1.0
