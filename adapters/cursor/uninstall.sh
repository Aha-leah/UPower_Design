#!/usr/bin/env bash
set -euo pipefail

# UPower Cursor Adapter Uninstall Script
# Usage: uninstall.sh [TARGET_PROJECT_ROOT] [--force]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat << 'EOF'
Uninstall UPower Cursor adapter from a target project.

Usage:
  uninstall.sh [TARGET_PROJECT_ROOT] [--force]

Arguments:
  TARGET_PROJECT_ROOT   Path to the target project's root. Defaults to current directory.
  --force               Force uninstall even without marker file (use with caution)

Examples:
  # Uninstall from current directory
  bash uninstall.sh

  # Uninstall from specific project
  bash uninstall.sh /path/to/project

  # Force uninstall (ignore marker check)
  bash uninstall.sh /path/to/project --force
EOF
}

# Parse arguments
TARGET_ROOT=""
FORCE=false
while (( $# > 0 )); do
  case "$1" in
    --force) FORCE=true; shift ;;
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
  echo "❌ Error: Cannot access target directory: $TARGET_ROOT"
  exit 1
fi

echo "🗑️  Uninstalling UPower Cursor adapter from: $TARGET_ROOT_DIR"

#######################################
# Safety check: marker file
#######################################

MARKER_FILE="$TARGET_ROOT_DIR/.upower/.installed_by_upower_cursor_adapter"

if [[ ! -f "$MARKER_FILE" ]]; then
  if [[ "$FORCE" == true ]]; then
    echo "⚠️  Warning: Marker file not found, but --force specified"
    echo "   Proceeding with uninstall..."
  else
    echo "❌ Safety check failed: Marker file not found"
    echo "   $MARKER_FILE"
    echo ""
    echo "This may indicate:"
    echo "  - The adapter was not installed by this installer"
    echo "  - The adapter was already uninstalled"
    echo "  - The .upower directory was created manually"
    echo ""
    echo "To force uninstall anyway, use: --force"
    echo "WARNING: This may delete files not created by this adapter!"
    exit 1
  fi
else
  echo "✅ Marker file found, safe to uninstall"
fi

#######################################
# Remove files
#######################################

FILES_REMOVED=0

# Remove .upower directory
if [[ -d "$TARGET_ROOT_DIR/.upower" ]]; then
  rm -rf "$TARGET_ROOT_DIR/.upower"
  echo "✅ Removed: .upower/"
  ((FILES_REMOVED++))
else
  echo "ℹ️  Not found: .upower/"
fi

# Remove .cursorrules file
if [[ -f "$TARGET_ROOT_DIR/.cursorrules" ]]; then
  rm -f "$TARGET_ROOT_DIR/.cursorrules"
  echo "✅ Removed: .cursorrules"
  ((FILES_REMOVED++))
else
  echo "ℹ️  Not found: .cursorrules"
fi

#######################################
# Summary
#######################################

if [[ $FILES_REMOVED -gt 0 ]]; then
  echo ""
  echo "🎉 UPower Cursor adapter uninstalled successfully!"
  echo ""
  echo "Note: Your project files and Source/ directory are preserved."
else
  echo ""
  echo "ℹ️  Nothing to uninstall (files already removed)"
fi
