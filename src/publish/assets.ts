/**
 * Inlined asset contents for bundled/compiled distribution.
 * These are embedded at compile time so they work in both npm packages and standalone binaries.
 */

export const ASSET_CONTENTS: Record<string, string> = {
  // Workflows
  'workflows/daily-thread.yml': `name: Daily Thread

on:
  schedule:
    - cron: '{{schedule.daily}}'
  workflow_dispatch:

jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: birdcar/birdhouse@main
      - run: bh daily
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`,

  'workflows/migration.yml': `name: Task Migration

on:
  issues:
    types: [closed]

jobs:
  migrate:
    if: contains(github.event.issue.labels.*.name, 'daily-thread')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: birdcar/birdhouse@main
      - run: bh migrate --from \${{ github.event.issue.number }}
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`,

  'workflows/rituals.yml': `name: Rituals

on:
  schedule:
    # Morning ritual - weekdays
    - cron: '{{schedule.morningWeekdays}}'
    # Workday startup - weekdays
    - cron: '{{schedule.workdayStartupWeekdays}}'
    # Workday shutdown - weekdays
    - cron: '{{schedule.workdayShutdownWeekdays}}'
    # Evening ritual - weekdays
    - cron: '{{schedule.eveningWeekdays}}'
    # Weekly preview - Sunday evening
    - cron: '{{schedule.sundayEvening}}'
  workflow_dispatch:
    inputs:
      ritual:
        description: 'Ritual to run'
        required: true
        type: choice
        options:
          - morning
          - workday-startup
          - workday-shutdown
          - evening
          - weekly-preview

jobs:
  run:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
    steps:
      - uses: actions/checkout@v4
      - uses: birdcar/birdhouse@main
      - name: Determine ritual
        id: ritual
        run: |
          if [ -n "\${{ inputs.ritual }}" ]; then
            echo "name=\${{ inputs.ritual }}" >> \$GITHUB_OUTPUT
          else
            HOUR=\$(date -u +%H)
            DAY=\$(date -u +%u)
            if [ "\$DAY" = "0" ]; then
              echo "name=weekly-preview" >> \$GITHUB_OUTPUT
            elif [ "\$HOUR" -lt 9 ]; then
              echo "name=morning" >> \$GITHUB_OUTPUT
            elif [ "\$HOUR" -lt 12 ]; then
              echo "name=workday-startup" >> \$GITHUB_OUTPUT
            elif [ "\$HOUR" -lt 18 ]; then
              echo "name=workday-shutdown" >> \$GITHUB_OUTPUT
            else
              echo "name=evening" >> \$GITHUB_OUTPUT
            fi
          fi
      - run: bh render .birdhouse/rituals/\${{ steps.ritual.outputs.name }}.md
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`,

  // Templates
  'templates/daily.md': `# {{ date.weekday }}, {{ date }}

## Big Three

1. [ ]
2. [ ]
3. [ ]

## Tasks

- [ ]

## Notes

`,

  'templates/weekly.md': `# Week of {{ date }}

## Goals

1.
2.
3.

## Domain Focus

### Work
-

### Personal
-

## Reflection

### What went well?

### What could improve?

### Key learnings

`,

  'templates/quarterly.md': `# Q{{ date.quarter }} {{ date.year }}

## Theme

## Goals

### Professional
1.
2.
3.

### Personal
1.
2.
3.

## Domain Reviews

### Body
-

### Mind
-

### Work
-

### Money
-

### Community
-

### Family
-

### Hobbies
-

### Love
-

### Spirit
-

## Key Dates

-

## Notes

`,

  // Rituals
  'rituals/morning.md': `# Morning Ritual

## Intentions

What are your top 3 priorities for today?

1.
2.
3.

## Energy Check

How are you feeling? (1-10):

## Blockers

What might get in your way today?

-

## Support Needed

Who or what can help you succeed today?

-
`,

  'rituals/workday-startup.md': `# Workday Startup

## Today's Big 3

What are the three most important work tasks for today?

1.
2.
3.

## Calendar Check

What meetings or commitments do you have today?

-

## Communication Queue

Who do you need to reach out to today?

-

## Blockers

What might prevent you from completing your Big 3?

-

## Focus Mode

What distractions will you eliminate during deep work?

- [ ] Close unnecessary tabs
- [ ] Silence notifications
- [ ] Set status to "Do Not Disturb"
`,

  'rituals/workday-shutdown.md': `# Workday Shutdown

## Progress Review

How did you do on today's Big 3?

- [ ] Task 1:
- [ ] Task 2:
- [ ] Task 3:

## Loose Ends

What tasks are still open that need attention?

-

## Tomorrow's Preview

What's the most important thing to tackle tomorrow?

-

## Inbox Zero

- [ ] Email inbox processed
- [ ] Slack/messages reviewed
- [ ] Task list updated

## Mental Transition

What will help you disconnect from work mode?

-

## Shutdown Complete

Say "Shutdown complete" out loud to signal the end of your workday.

- [ ] Shutdown complete
`,

  'rituals/evening.md': `# Evening Ritual

## Wins

What went well today?

-

## Challenges

What was difficult?

-

## Tomorrow

What's the one thing you must do tomorrow?

-

## Gratitude

What are you grateful for today?

-
`,

  'rituals/weekly-preview.md': `# Weekly Preview

## Last Week

### Completed
-

### Incomplete
-

## This Week

### Must Do
1.
2.
3.

### Should Do
-

### Could Do
-

## Calendar Review

Key events and commitments:

-

## Domain Check-in

Which domains need attention this week?

- [ ] Body
- [ ] Mind
- [ ] Work
- [ ] Money
- [ ] Community
- [ ] Family
- [ ] Hobbies
- [ ] Love
- [ ] Spirit
`,

  // Domains
  'domains/body/README.md': `# Body

Physical health, fitness, nutrition, sleep, and overall wellness.

## Current Focus

-

## Habits

- [ ]

## Goals

-

## Notes

`,

  'domains/mind/README.md': `# Mind

Mental health, learning, reading, creativity, and intellectual growth.

## Current Focus

-

## Habits

- [ ]

## Goals

-

## Notes

`,

  'domains/work/README.md': `# Work

Career, professional development, projects, and work-life balance.

## Current Focus

-

## Habits

- [ ]

## Goals

-

## Notes

`,

  'domains/money/README.md': `# Money

Finances, budgeting, investments, and financial goals.

## Current Focus

-

## Habits

- [ ]

## Goals

-

## Notes

`,

  'domains/community/README.md': `# Community

Social connections, friendships, networking, and giving back.

## Current Focus

-

## Habits

- [ ]

## Goals

-

## Notes

`,

  'domains/family/README.md': `# Family

Family relationships, quality time, and family responsibilities.

## Current Focus

-

## Habits

- [ ]

## Goals

-

## Notes

`,

  'domains/hobbies/README.md': `# Hobbies

Personal interests, creative pursuits, and recreational activities.

## Current Focus

-

## Habits

- [ ]

## Goals

-

## Notes

`,

  'domains/love/README.md': `# Love

Romantic relationships, partnership, and intimacy.

## Current Focus

-

## Habits

- [ ]

## Goals

-

## Notes

`,

  'domains/spirit/README.md': `# Spirit

Spirituality, mindfulness, purpose, and personal values.

## Current Focus

-

## Habits

- [ ]

## Goals

-

## Notes

`,
};
