---
name: intake-incident
description: >-
  Use when the user reports a bug, incident, or unexpected behaviour and a
  structured intake needs to be created before any code is changed. Walks
  through the RedFirst triage protocol and writes bugs/BUG-XX.md.
---

# Intake Incident

Follow these steps in order. Do not skip any step and do not touch production
code until step 5 is complete.

## Step 1 — Assign a Bug ID

Use `list_files` on `bugs/` and find the next unused BUG-XX number (pad to two
digits). Keep this ID for every subsequent step.

## Step 2 — Gather Structured Information

Use `ask_followup_question` for any field the user has not already supplied:

1. **Title** — one sentence describing the failure.
2. **Reproduction steps** — exact numbered sequence to trigger the bug.
3. **Observed behaviour** — what actually happens (include error messages verbatim).
4. **Expected behaviour** — what should happen instead.
5. **Scope** — which files, endpoints, or modules are involved.
6. **Severity** — P1 (data loss / security) · P2 (broken feature) · P3 (degraded) · P4 (cosmetic).
7. **Environment** — Node version, OS, any relevant config flags.

Do not proceed to step 3 until all seven fields are filled.

## Step 3 — Write the Bug Report

Use `write_file` to create `bugs/BUG-XX.md` with this exact structure:

```
# BUG-XX — <Title>

**Severity:** <P1|P2|P3|P4>
**Status:** open
**Assigned to:** (unassigned)

## Reproduction Steps

<numbered list>

## Observed Behaviour

<verbatim output or description>

## Expected Behaviour

<description>

## Scope

<files / endpoints / modules>

## Environment

<Node version, OS, config>

## Root Cause Hypothesis

(to be filled after failing test is written)

## Fix Summary

(to be filled after fix is merged)
```

## Step 4 — Confirm the Intake

Read back `bugs/BUG-XX.md` with `read_file` and confirm every field is present
and accurate. If anything is missing, fill it now before continuing.

## Step 5 — Hand Off

Tell the user the intake is complete. Instruct them to switch to the
**RedFirst Agent** mode (`redfirst-agent`) to continue with the failing-test
gate. Do not write any test or production code in this skill.
