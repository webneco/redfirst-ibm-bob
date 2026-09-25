# RedFirst Rules

These rules are always active in every RedFirst session. They are not
suggestions — Bob must follow them without exception.

## 1. Never Touch Production Code Without a Failing Test

Do not write, modify, or delete any file under `sample-app/` (or any
production source directory) until a test that:
- references the BUG-XX ID,
- asserts the **expected** behaviour, and
- is confirmed **red** (exits non-zero)

exists and has been recorded in `bugs/BUG-XX.md`.

## 2. Never Skip the Intake

Every bug fix must have a corresponding `bugs/BUG-XX.md` with all seven
mandatory fields filled (Title, Severity, Reproduction Steps, Observed,
Expected, Scope, Environment). If the file does not exist, invoke the
`intake-incident` skill before proceeding.

## 3. Fix the Root Cause, Not the Symptom

Before writing a fix, state the root cause hypothesis in the bug report.  
If the only change is catching or suppressing an error without correcting the
underlying logic, that is a symptom patch — do not merge it.

## 4. Full Suite Must Pass Before Ship

`npm test` (or the project-equivalent) must exit 0 with zero failures before
any PR is created. A green repro test alone is not sufficient.

## 5. No Secrets in Commits

`scan-creds.sh` runs automatically. If it blocks a commit, remove the
credential, rotate it, and only then retry. Never force-push to bypass the
scan.

## 6. One Bug Per PR

Each pull request addresses exactly one BUG-XX. Do not bundle unrelated
changes, refactors, or dependency upgrades into a bug-fix PR without explicit
user approval.

## 7. Update the Bug Report at Every Gate

`bugs/BUG-XX.md` must be kept current:
- `open` — intake filed, no test yet
- `test-written` — failing test committed, fix not started
- `fixed` — fix implemented, test green, suite green
- `merged` — PR merged
