---
name: write-failing-test
description: >-
  Use when a bug intake (bugs/BUG-XX.md) exists and a failing test that
  reproduces the root cause must be written before any production code changes.
  Enforces the RedFirst red-first gate.
---

# Write Failing Test

Follow these steps in order. The test **must be red** before any production
code is modified. If the test passes without any changes to production code,
the test is wrong or the bug is already fixed — do not proceed.

## Step 1 — Read the Bug Report

Use `read_file` on the relevant `bugs/BUG-XX.md`. Extract:
- Reproduction steps
- Observed behaviour
- Expected behaviour
- Scope (which modules / files)

## Step 2 — Locate the Test Suite

Use `glob` to find existing test files (e.g. `**/*.test.{js,ts}`,
`**/*.spec.{js,ts}`, `test/**`). Identify the right file or directory for the
new test based on the scope from the bug report.

## Step 3 — Write the Failing Test

Write a test that:
- Has a descriptive name referencing the bug ID (e.g. `BUG-01: ...`).
- Calls the exact code path described in the reproduction steps.
- Asserts the **expected** behaviour (not the currently broken one).
- Contains a comment: `// RedFirst: this test must be red before the fix`.

Use `write_file` or `apply_diff` to add the test. Do **not** change any
production source file in this step.

## Step 4 — Confirm the Test Is Red

Use `execute_command` to run only the new test:

```bash
npm test -- --testNamePattern="BUG-XX"
# or the project-specific equivalent
```

The command must exit non-zero or report at least one failure. If it exits 0,
the test is not catching the bug — go back to step 3 and revise the assertion.

Document the failing output in `bugs/BUG-XX.md` under a `## Failing Test
Output` section.

## Step 5 — Update the Bug Report

Add to `bugs/BUG-XX.md`:
- `**Status:** test-written`
- Path to the new test under a `## Test` section.
- The failing output snippet.

## Step 6 — Hand Off

Confirm the test is red and the bug report is updated. The fix gate is now
open. Tell the user they may proceed in **RedFirst Agent** mode to implement
the fix.
