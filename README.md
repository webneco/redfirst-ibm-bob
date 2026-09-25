# RedFirst — Gated Debugging with IBM Bob 2.0

> **Root cause first. Every time.**

RedFirst is a hackathon project for the [IBM Bob 2.0](https://ibm.biz/bob) competition.  
It enforces a three-gate debugging discipline so AI assistance and human instinct never skip
straight to a patch.

---

## The Problem

AI and humans share the same reflex: patch the symptom and move on. The bug looks fixed, the
CI turns green, and two weeks later the same failure reappears in a different form. Without a
failing test that pinpoints the root cause, every fix is temporary.

## The Solution

RedFirst wraps Bob 2.0 in a gated workflow that cannot be shortcut:

```
Triage  ──►  Failing Test  ──►  Fix  ──►  Ship
```

| Gate | What happens |
|------|-------------|
| **Triage** | `intake-incident` skill collects a structured bug report: reproduction steps, observed vs expected behaviour, and scope. Bob cannot proceed to code without a completed intake. |
| **Failing Test** | `write-failing-test` skill writes a test that must be **red** before a single line of production code changes. The `run-repro-tests` hook verifies the test actually fails. |
| **Fix** | Normal Bob agent work — but the workflow gate stays open until the previously-red test turns green and the full suite still passes. |
| **Ship** | `ship-proof-pr` skill generates a PR that includes the bug report, the test, and the diff, then runs `scan-secrets` before pushing. |

## Repository Layout

```
.bob/
  custom_modes.yaml        # redfirst-triage and redfirst-agent modes
  settings.json            # hooks wiring
  hooks/
    run-repro-tests.sh     # PostToolUse: verify the repro test is red before fixing
    scan-creds.sh          # PreToolUse: block git push if credentials are detected
  rules/
    redfirst.md            # always-on rules loaded into every session
  skills/
    intake-incident.md/    # structured bug intake
    write-failing-test.md/ # red-first test authoring
    ship-proof-pr.md/      # gated PR creation

bugs/                      # one markdown file per tracked bug
  BUG-01.md
  BUG-02.md
  BUG-03.md
  BUG-04.md

bench/
  hidden-tests.md          # benchmark test descriptions (no implementation)
  scores.template.csv      # scoring template for hackathon judges

sample-app/                # Node + Express app (source added in later tasks)
  README.md
```

## Workflow in Practice

```bash
# 1. Start a triage session
#    Bob activates intake-incident automatically when you describe a bug.

# 2. Bob creates bugs/BUG-XX.md and writes a failing test.
#    The run-repro-tests hook confirms the test is red before proceeding.

# 3. Fix the bug in the sample-app.
#    Bob verifies the previously-red test is now green.

# 4. Ship with the gated PR skill.
#    scan-secrets blocks the push if any credential pattern is detected.
```

## Security

See [SECURITY.md](SECURITY.MD) for credential hygiene rules.  
`scan-secrets.sh` enforces the most critical rules automatically on every push attempt.

---

*IBM Bob 2.0 Hackathon — RedFirst by Webneco*
