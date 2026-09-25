---
name: ship-proof-pr
description: >-
  Use when a bug fix is complete and a pull request needs to be created.
  Verifies all RedFirst gates are met (intake, red test, green test, clean
  secrets scan) before generating the PR description and pushing.
---

# Ship Proof PR

Follow these steps in order. The PR cannot be created until every gate check
passes.

## Step 1 — Identify the Bug

Ask the user for the BUG-XX ID if not already supplied. Use `read_file` on
`bugs/BUG-XX.md` to load the intake, test path, and fix summary.

## Step 2 — Gate Checks

Run each check and stop if any fails:

### 2a — Intake complete?
Verify `bugs/BUG-XX.md` has non-empty values for: Title, Severity, Reproduction
Steps, Observed Behaviour, Expected Behaviour, Scope. If any field is empty,
halt and instruct the user to complete the intake.

### 2b — Failing test exists and was red?
Verify the `## Test` and `## Failing Test Output` sections exist in
`bugs/BUG-XX.md`. If missing, halt and instruct the user to run the
`write-failing-test` skill first.

### 2c — Test is now green?
Use `execute_command` to run the test referenced in `## Test`. It must exit 0
with no failures. If it still fails, halt — the fix is incomplete.

### 2d — Full suite passes?
Use `execute_command` to run `npm test` (or the project-equivalent). All tests
must pass. If any fail, halt and report the failures.

### 2e — Secrets scan clean?
Use `execute_command` to run:

```bash
bash .bob/hooks/scan-creds.sh
```

If it exits non-zero, halt and list the detected patterns. Do not push until
the secrets scan is clean.

## Step 3 — Build the PR Description

Compose a PR body with these sections, pulling from `bugs/BUG-XX.md`:

```
## What

<one-line fix summary>

## Why (Root Cause)

<root cause hypothesis, filled during triage or fix>

## How

<brief description of the change>

## Tests

- [ ] BUG-XX repro test: was red, now green
- [ ] Full test suite passes

## Bug Report

Closes bugs/BUG-XX.md
```

## Step 4 — Create the PR

Use `execute_command` to run:

```bash
git add -A
git commit -m "fix(BUG-XX): <title>"
git push origin HEAD
```

Then, if the GitHub CLI is available:

```bash
gh pr create --title "fix(BUG-XX): <title>" --body "<PR body from step 3>"
```

If `gh` is not available, print the PR body and instruct the user to open the
PR manually on GitHub.

## Step 5 — Update the Bug Report

Set `**Status:** merged` and fill `## Fix Summary` in `bugs/BUG-XX.md`.
Commit the update.
