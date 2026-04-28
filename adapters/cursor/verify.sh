#!/usr/bin/env bash
set -euo pipefail

# UPower Cursor Adapter Verify Script
# Usage: verify.sh [TARGET_PROJECT_ROOT]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat << 'EOF'
Verify UPower Cursor adapter installation.

Usage:
  verify.sh [TARGET_PROJECT_ROOT]

Arguments:
  TARGET_PROJECT_ROOT   Path to the target project's root. Defaults to current directory.

Examples:
  # Verify current directory
  bash verify.sh

  # Verify specific project
  bash verify.sh /path/to/project
EOF
}

# Parse arguments
TARGET_ROOT=""
while (( $# > 0 )); do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    *) 
      if [[ -z "$TARGET_ROOT" ]]; then 
        TARGET_ROOT="$1"
      else 
        echo "Unknown argument: $1"
        usage
        exit 1
      fi
      shift ;;
  esac
done

# Default to current directory
if [[ -z "$TARGET_ROOT" ]]; then
  TARGET_ROOT="."
fi

# Resolve to absolute path
if ! TARGET_ROOT_DIR="$(cd "$TARGET_ROOT" 2>/dev/null && pwd)"; then
  echo "❌ FAIL: Cannot access target directory: $TARGET_ROOT"
  exit 1
fi

echo "🔍 Verifying UPower Cursor adapter in: $TARGET_ROOT_DIR"
echo ""

#######################################
# Check required files
#######################################

PASS=0
FAIL=0

# Check .upower/ directory structure
if [[ -d "$TARGET_ROOT_DIR/.upower" ]]; then
  echo "✅ PASS: .upower/ directory exists"
  ((PASS++))
else
  echo "❌ FAIL: .upower/ directory not found"
  ((FAIL++))
fi

# Check .upower/upower.js
UPOWER_JS="$TARGET_ROOT_DIR/.upower/upower.js"
if [[ -f "$UPOWER_JS" ]]; then
  echo "✅ PASS: .upower/upower.js exists"
  ((PASS++))
else
  echo "❌ FAIL: .upower/upower.js not found"
  ((FAIL++))
fi

# Check .upower/core/ directory
UPOWER_CORE="$TARGET_ROOT_DIR/.upower/core"
if [[ -d "$UPOWER_CORE" ]]; then
  echo "✅ PASS: .upower/core/ directory exists"
  ((PASS++))
else
  echo "❌ FAIL: .upower/core/ directory not found"
  ((FAIL++))
fi

# Check .cursorrules
CURSOR_RULES="$TARGET_ROOT_DIR/.cursorrules"
if [[ -f "$CURSOR_RULES" ]]; then
  echo "✅ PASS: .cursorrules exists"
  ((PASS++))
else
  echo "❌ FAIL: .cursorrules not found"
  ((FAIL++))
fi

# Check marker file
MARKER_FILE="$TARGET_ROOT_DIR/.upower/.installed_by_upower_cursor_adapter"
if [[ -f "$MARKER_FILE" ]]; then
  echo "✅ PASS: Installation marker exists"
  ((PASS++))
else
  echo "⚠️  WARN: Installation marker not found (may be manual install)"
fi

#######################################
# Test CLI functionality
#######################################

if [[ -f "$UPOWER_JS" ]]; then
  if command -v node >/dev/null 2>&1; then
    if node "$UPOWER_JS" --help >/dev/null 2>&1; then
      echo "✅ PASS: UPower CLI responds to --help"
      ((PASS++))
    else
      echo "❌ FAIL: UPower CLI --help failed"
      ((FAIL++))
    fi
  else
    echo "⚠️  WARN: Node.js not found in PATH, skipping CLI test"
  fi
fi

#######################################
# Summary
#######################################

echo ""
echo "========================================"
if [[ $FAIL -eq 0 ]]; then
  echo "✅ VERIFICATION PASSED ($PASS checks)"
  echo "========================================"
  exit 0
else
  echo "❌ VERIFICATION FAILED ($FAIL failures, $PASS passes)"
  echo "========================================"
  exit 1
fi
