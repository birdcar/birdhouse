# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
