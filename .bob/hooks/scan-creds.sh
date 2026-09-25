#!/usr/bin/env bash
# scan-creds.sh
# PreToolUse hook: block execute_command calls that contain git push / git commit
# if common credential patterns are detected in staged changes or the working tree.
#
# Bob sends the hook payload JSON on stdin.
# Exit 2 to block; exit 0 to allow.

set -euo pipefail

INPUT=$(cat)

TOOL=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | cut -d'"' -f4)
CMD=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | cut -d'"' -f4)

# Only intercept git push or git commit
if [ "$TOOL" != "execute_command" ]; then
  exit 0
fi

if ! echo "$CMD" | grep -qE 'git\s+(push|commit)'; then
  exit 0
fi

# Patterns that indicate a credential or API key
CRED_PATTERNS=(
  'AKIA[0-9A-Z]{16}'                    # AWS access key
  '(password|passwd|pwd)\s*=\s*["\x27][^"\x27]{6,}'  # generic assignment
  'BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE'  # private key header
  'eyJ[A-Za-z0-9_-]{10,}\.'             # JWT
  'sk-[A-Za-z0-9]{20,}'                 # OpenAI key
  'xox[baprs]-[0-9A-Za-z]{10,}'         # Slack token
  'ghp_[A-Za-z0-9]{36}'                 # GitHub personal token
)

# Scan staged changes
SCAN_TARGET=$(git diff --cached 2>/dev/null || true)
if [ -z "$SCAN_TARGET" ]; then
  # Fall back to unstaged working tree if nothing is staged
  SCAN_TARGET=$(git diff 2>/dev/null || true)
fi

if [ -z "$SCAN_TARGET" ]; then
  exit 0
fi

FOUND=()
for PATTERN in "${CRED_PATTERNS[@]}"; do
  if echo "$SCAN_TARGET" | grep -qP "$PATTERN" 2>/dev/null; then
    FOUND+=("$PATTERN")
  fi
done

if [ "${#FOUND[@]}" -gt 0 ]; then
  echo "scan-creds: BLOCKED — potential credential detected in staged changes." >&2
  echo "Matched patterns:" >&2
  for P in "${FOUND[@]}"; do
    echo "  - $P" >&2
  done
  echo "Review 'git diff --cached', remove the credential, rotate it, and retry." >&2
  exit 2
fi

exit 0
