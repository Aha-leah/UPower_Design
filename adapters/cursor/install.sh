#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPOWER_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SOURCE_CORE="$UPOWER_ROOT/core"
SOURCE_UPOWER_JS="$UPOWER_ROOT/upower.js"
SOURCE_DOCS="$UPOWER_ROOT/Docs"
SOURCE_CURSORRULES="$SCRIPT_DIR/.cursorrules"

usage() {
  cat << 'EOF'
Install UPower Cursor adapter into a target project.

Usage:
  install.sh [TARGET_PROJECT_ROOT] [--overwrite]

Arguments:
  TARGET_PROJECT_ROOT   Path to the target project's root. Defaults to current directory.
  --overwrite           Overwrite any existing installation.

Examples:
  # Install to current directory
  bash install.sh

  # Install to specific project
  bash install.sh /path/to/project

  # Force overwrite existing installation
  bash install.sh /path/to/project --overwrite
EOF
}

TARGET_ROOT=""
OVERWRITE=false
while (( $# > 0 )); do
  case "$1" in
    --overwrite) OVERWRITE=true; shift ;;
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

if [[ -z "$TARGET_ROOT" ]]; then
  TARGET_ROOT="."
fi

if ! TARGET_ROOT_DIR="$(cd "$TARGET_ROOT" 2>/dev/null && pwd)"; then
  echo "❌ Error: Cannot access target directory: $TARGET_ROOT"
  exit 1
fi

echo "📦 Installing UPower Cursor adapter to: $TARGET_ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Error: Node.js is not installed or not in PATH"
  exit 1
fi

if [[ ! -d "$SOURCE_CORE" ]]; then
  echo "❌ Error: Source core/ not found at $SOURCE_CORE"
  exit 1
fi

if [[ ! -f "$SOURCE_UPOWER_JS" ]]; then
  echo "❌ Error: Source upower.js not found at $SOURCE_UPOWER_JS"
  exit 1
fi

if [[ ! -f "$SOURCE_CURSORRULES" ]]; then
  echo "❌ Error: Source .cursorrules not found at $SOURCE_CURSORRULES"
  exit 1
fi

if [[ ! -w "$TARGET_ROOT_DIR" ]]; then
  echo "❌ Error: Target directory is not writable: $TARGET_ROOT_DIR"
  exit 1
fi

CONFLICT=false
if [[ -d "$TARGET_ROOT_DIR/.upower" ]]; then
  CONFLICT=true
fi
if [[ -f "$TARGET_ROOT_DIR/.cursorrules" ]]; then
  CONFLICT=true
fi

if [[ "$CONFLICT" == true ]]; then
  if [[ "$OVERWRITE" == true ]]; then
    echo "⚠️  Conflict detected. Overwriting..."
    rm -rf "$TARGET_ROOT_DIR/.upower"
    rm -f "$TARGET_ROOT_DIR/.cursorrules"
  else
    echo "⚠️  Conflict detected. Use --overwrite to replace."
    echo "   Or uninstall first: bash $SCRIPT_DIR/uninstall.sh $TARGET_ROOT"
    exit 0
  fi
fi

echo "📋 Copying UPower framework..."

mkdir -p "$TARGET_ROOT_DIR/.upower/core"
cp -r "$SOURCE_CORE/"* "$TARGET_ROOT_DIR/.upower/core/"

cp "$SOURCE_UPOWER_JS" "$TARGET_ROOT_DIR/.upower/"

if [[ -d "$SOURCE_DOCS" ]]; then
  cp -r "$SOURCE_DOCS" "$TARGET_ROOT_DIR/.upower/"
fi

cp "$SOURCE_CURSORRULES" "$TARGET_ROOT_DIR/.cursorrules"

MARKER_FILE="$TARGET_ROOT_DIR/.upower/.installed_by_upower_cursor_adapter"
echo "installed_by=upower_cursor_adapter" > "$MARKER_FILE"
echo "version=3.4.1-cursor.1" >> "$MARKER_FILE"
echo "installed_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> "$MARKER_FILE"
echo "source=$UPOWER_ROOT" >> "$MARKER_FILE"

echo "🔍 Verifying installation..."

UPOWER_JS="$TARGET_ROOT_DIR/.upower/upower.js"
if [[ -f "$UPOWER_JS" ]]; then
  if node "$UPOWER_JS" --help >/dev/null 2>&1; then
    echo "✅ UPower CLI is working"
  else
    echo "⚠️  Warning: UPower CLI test failed (non-fatal)"
  fi
else
  echo "⚠️  Warning: upower.js not found at expected location"
fi

if [[ -f "$TARGET_ROOT_DIR/.cursorrules" ]]; then
  echo "✅ .cursorrules installed"
else
  echo "❌ Error: .cursorrules installation failed"
  exit 1
fi

echo ""
echo "🎉 UPower Cursor adapter installed successfully!"
echo ""
echo "Next steps:"
echo "  1. Open your project in Cursor IDE"
echo "  2. The .cursorrules file will be automatically loaded"
echo "  3. Use /new, /build, /plan commands in Cursor chat"
echo ""
echo "To verify: bash $SCRIPT_DIR/verify.sh $TARGET_ROOT"
echo "To uninstall: bash $SCRIPT_DIR/uninstall.sh $TARGET_ROOT"
