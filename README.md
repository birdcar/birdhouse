# Birdhouse

A GitHub-native productivity CLI that automates daily routines and task management through GitHub Issues. Create templated "Daily Thread" issues, track tasks with priorities and markers, migrate incomplete tasks between days, and orchestrate workflows via GitHub Actions.

## Features

- **Daily Threads** - Automated daily standup issues with customizable templates
- **Task Migration** - Carry incomplete tasks forward with smart filtering
- **Template Engine** - Variable interpolation with date, config, and environment context
- **Scheduled Workflows** - Morning/evening rituals and weekly reviews via GitHub Actions
- **Task Metadata** - Priorities, markers (scheduled, migrated, irrelevant), and completion tracking
- **Life Domains** - Organize goals across body, mind, work, money, community, family, hobbies, love, and spirit

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime (for development/local use)
- A GitHub repository to manage
- GitHub token with repo access (for API operations)

### Installation

**From Source:**

```bash
git clone https://github.com/birdcar/birdhouse.git
cd birdhouse
bun install
bun run build
```

**As GitHub Action:**

```yaml
- uses: birdcar/birdhouse@main
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

### Quick Start

1. **Initialize Birdhouse in your repository:**

   ```bash
   bh init
   ```

   This creates the `.birdhouse/` directory with a default `config.yaml`.

2. **Configure your settings** in `.birdhouse/config.yaml`:

   ```yaml
   version: '1'
   repo:
     owner: your-username
     name: your-repo
   daily:
     titleFormat: 'Daily Thread - {{ date }}'
     template: 'daily'
     labels: ['daily-thread']
     pinned: true
   schedule:
     timezone: 'America/Chicago'
     daily: '06:00'
     rituals:
       morning: '06:00'
       evening: '18:00'
       weeklyPreview: '18:00'
   domains:
     - body
     - mind
     - work
   ```

3. **Publish templates and workflows:**

   ```bash
   bh publish
   ```

4. **Create your first daily thread:**

   ```bash
   bh daily
   ```

## Commands

### `bh init`

Initialize Birdhouse in the current repository.

```bash
bh init           # Create .birdhouse/ directory and config
bh init --force   # Overwrite existing configuration
```

### `bh render [template]`

Render a template with variable substitution.

```bash
bh render daily                      # Render daily template to stdout
bh render --list                     # List available templates
bh render daily --output today.md    # Write to file
bh render daily --var name=value     # Pass custom variables
```

### `bh daily`

Create today's Daily Thread issue on GitHub.

```bash
bh daily           # Create and optionally pin the issue
bh daily --dry-run # Preview without creating
```

### `bh publish`

Publish workflows, templates, and domain folders to the repository.

```bash
bh publish                   # Publish all assets
bh publish --list            # List available assets
bh publish --workflows-only  # Only publish GitHub workflows
bh publish --templates-only  # Only publish templates
bh publish --domains-only    # Only publish domain folders
bh publish --force           # Overwrite existing files
bh publish --commit          # Auto-commit changes
```

### `bh migrate`

Migrate incomplete tasks from the previous Daily Thread to the current one.

```bash
bh migrate           # Migrate tasks
bh migrate --dry-run # Preview migration
```

## Configuration

Configuration lives in `.birdhouse/config.yaml`:

| Field | Type | Description |
|-------|------|-------------|
| `version` | `'1'` | Config schema version |
| `repo.owner` | string | GitHub repository owner |
| `repo.name` | string | GitHub repository name |
| `daily.titleFormat` | string | Template for issue titles |
| `daily.template` | string | Template name (in `.birdhouse/templates/`) |
| `daily.labels` | string[] | Labels applied to daily issues |
| `daily.pinned` | boolean | Auto-pin daily issues |
| `schedule.timezone` | string | IANA timezone (e.g., `America/New_York`) |
| `schedule.daily` | string | Daily thread creation time (`HH:MM`) |
| `schedule.rituals.morning` | string | Morning ritual time |
| `schedule.rituals.evening` | string | Evening ritual time |
| `schedule.rituals.weeklyPreview` | string | Weekly preview time |
| `domains` | string[] | Life domains to track |

Schedule times are specified in local time and automatically converted to UTC cron expressions when workflows are published.

## Templates

Templates use `{{ variable }}` syntax for interpolation.

### Available Variables

**Date:**
- `{{ date }}` - Current date (YYYY-MM-DD)
- `{{ date.year }}` - Year (e.g., 2024)
- `{{ date.month }}` - Month (e.g., 01)
- `{{ date.day }}` - Day (e.g., 15)
- `{{ date.weekday }}` - Day name (e.g., Monday)

**Config:**
- `{{ config.repo.owner }}` - Repository owner
- `{{ config.repo.name }}` - Repository name
- `{{ config.daily.labels[0] }}` - First label

**Environment:**
- `{{ env.GITHUB_ACTOR }}` - GitHub username
- `{{ env.GITHUB_REPOSITORY }}` - Full repo name

**Custom:**
- Pass via CLI: `bh render daily --var greeting=Hello`

### Default Templates

| Template | Purpose |
|----------|---------|
| `daily.md` | Daily standup with "Big Three" priorities |
| `weekly.md` | Weekly review and planning |
| `quarterly.md` | Quarterly goals and reflection |

## Task Management

Tasks in Daily Threads support special markers and priorities.

### Task Syntax

```markdown
- [ ] Regular task
- [x] Completed task
- [ ] $1 High priority task
- [ ] $2 Medium priority task
- [ ] $3 Low priority task
- [ ] < Scheduled for today (preserved on migration)
- [ ] > Migrated from previous day
- [ ] ~ Marked irrelevant (skipped on migration)
```

### Migration Behavior

When running `bh migrate`:

1. Completed tasks (`[x]`) are **not** migrated
2. Irrelevant tasks (`~`) are **not** migrated
3. Scheduled tasks (`<`) are migrated and marked as migrated (`>`)
4. Regular incomplete tasks are migrated with their priorities preserved
5. Migration history is logged to a CSV file

## GitHub Action

Use Birdhouse in your workflows:

```yaml
name: Daily Thread
on:
  schedule:
    - cron: '0 12 * * *'  # Noon UTC
  workflow_dispatch:

jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: birdcar/birdhouse@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - run: bh daily
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The action automatically downloads the appropriate binary for your platform (Linux x64, macOS x64/ARM64, Windows x64).

## Published Workflows

Running `bh publish` creates these GitHub Actions workflows:

| Workflow | Purpose |
|----------|---------|
| `daily-thread.yml` | Creates daily issue on schedule |
| `rituals.yml` | Runs morning/evening/weekly rituals |
| `migration.yml` | Migrates tasks between issues |

Schedule times in workflows are converted from your configured timezone to UTC.

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Type check
bun run typecheck

# Run tests
bun run test

# Build binary
bun run build
```

### Project Structure

```
birdhouse/
├── src/
│   ├── commands/     # CLI commands (init, render, daily, publish, migrate)
│   ├── config/       # Configuration schema and loading
│   ├── template/     # Template rendering engine
│   ├── tasks/        # Task extraction and manipulation
│   ├── github/       # GitHub API interactions
│   ├── git/          # Git operations
│   ├── publish/      # Asset publishing system
│   └── utils/        # Utilities (logger, paths, schedule conversion)
├── tests/            # Test suite
└── scripts/          # Build scripts
```

## License

MIT
