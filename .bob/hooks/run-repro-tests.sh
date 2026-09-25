#!/usr/bin/env bash
# run-repro-tests.sh
# PostToolUse hook: after any file edit, check whether an open BUG's repro
# test file is present and — if so — run it to confirm it is still red
# (before the fix) or green (after the fix).
#
# Bob sends the hook payload JSON on stdin.
# Exit 0 always (PostToolUse cannot block); write a warning to stdout so Bob
# adds it to model context.

set -euo pipefail

INPUT=$(cat)

# Extract the path that was just written
WRITTEN_PATH=$(echo "$INPUT" | grep -o '"path":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$WRITTEN_PATH" ]; then
  exit 0
fi

# Only run when a test file was touched
if ! echo "$WRITTEN_PATH" | grep -qE '\.(test|spec)\.[jt]sx?$'; then
  exit 0
fi

# Find the BUG ID referenced in the file, e.g. "BUG-01"
BUG_ID=$(grep -oE 'BUG-[0-9]+' "$WRITTEN_PATH" 2>/dev/null | head -1)

if [ -z "$BUG_ID" ]; then
  exit 0
fi

BUG_FILE="bugs/${BUG_ID}.md"

if [ ! -f "$BUG_FILE" ]; then
  echo "run-repro-tests: $BUG_FILE not found; skipping repro run."
  exit 0
fi

STATUS=$(grep -oP '(?<=\*\*Status:\*\* ).*' "$BUG_FILE" 2>/dev/null | head -1 | tr -d '[:space:]')

echo "run-repro-tests: running repro test for $BUG_ID (status: ${STATUS:-unknown})"

# Run only the test referencing this bug
if command -v npx &>/dev/null; then
  TEST_CMD="npx --no -- jest --testNamePattern='${BUG_ID}' --passWithNoTests"
else
  TEST_CMD="npm test -- --testNamePattern='${BUG_ID}'"
fi

set +e
OUTPUT=$(eval "$TEST_CMD" 2>&1)
EXIT_CODE=$?
set -e

if [ "$STATUS" = "test-written" ] && [ "$EXIT_CODE" -eq 0 ]; then
  echo "run-repro-tests: WARNING — test for $BUG_ID passes before the fix is applied. Verify the test actually asserts the broken behaviour."
elif [ "$STATUS" = "test-written" ] && [ "$EXIT_CODE" -ne 0 ]; then
  echo "run-repro-tests: OK — repro test for $BUG_ID is red. Fix gate open."
elif [ "$STATUS" = "fixed" ] && [ "$EXIT_CODE" -ne 0 ]; then
  echo "run-repro-tests: FAIL — repro test for $BUG_ID is still red after fix. Do not ship."
  echo "$OUTPUT"
elif [ "$STATUS" = "fixed" ] && [ "$EXIT_CODE" -eq 0 ]; then
  echo "run-repro-tests: OK — repro test for $BUG_ID is green."
fi

exit 0
