# UPower Cursor IDE Adapter (v3.4) - Quick Install Guide

This README provides a 30-second install path, upgrade and uninstall commands, and basic troubleshooting for the Cursor IDE adapter in UPower v3.4.

Note: The install script is located at adapters/cursor/install.sh in the repository. Run commands from the repository root or adjust paths if you are installing from a remote source.

## 1) 30-second install (quick start)
The fastest way to install the Cursor adapter is to fetch and run the install script in one line. This assumes you have curl and bash available.

- One-liner (remote install):
  curl -fsSL https://<your-domain>/UPower/v3.4/adapters/cursor/install.sh | bash

- Alternative (bash from script):
  bash adapters/cursor/install.sh

If you prefer not to hit the network, you can download the file locally and run:

- Local path (from repo root):
  bash adapters/cursor/install.sh

After installation, verify the adapter is accessible:

- Check version/help:
  upower-cursor --version
  upower-cursor --help


## 2) Upgrade (keep it simple)
Upgrade the Cursor adapter using the installer script. This will fetch the latest stable Cursor adapter and replace the current files where applicable.

- Quick upgrade (recommended when network access is available):
  bash adapters/cursor/install.sh upgrade

- If you installed from network in step 1, you can rerun the same one-liner:
  curl -fsSL https://<your-domain>/UPower/v3.4/adapters/cursor/install.sh | bash

Verification after upgrade:
- upower-cursor --version
- upower-cursor --help


## 3) Uninstall
If you need to remove Cursor entirely, run the uninstall path:

- Uninstall (script-based):
  bash adapters/cursor/install.sh uninstall

- If you installed manually, remove the installed files and binary symlinks as appropriate (example locations may vary):
  sudo rm -rf /usr/local/lib/upower/adapters/cursor
  sudo rm -f /usr/local/bin/upower-cursor

Post-uninstall verification:
- Ensure the binary is gone: which upower-cursor (should return nothing)
- Optionally check for residual config in your user home directory (e.g., ~/.upower/cursor/)


## 4) Troubleshooting
Common issues and quick fixes for Cursor adapter installation and operation.

1) Node/Runtime issues
- Ensure the host meets minimum requirements for running the adapter (Node.js version or system prerequisites as documented by UPower). If you see a node-related error, upgrade/downgrade Node accordingly and re-run install.
- If a required runtime package is missing, install it via your system package manager (e.g., brew, apt, yum).

2) Permissions
- If installation fails due to permission errors, retry with sudo:
  sudo bash adapters/cursor/install.sh [upgrade|uninstall|install]
- Ensure you have write access to the target install directories (e.g., /usr/local or /opt).

3) Conflicts or already-installed messages
- If you see a message indicating the Cursor adapter is already installed, uninstall first and then install again:
  bash adapters/cursor/install.sh uninstall
  bash adapters/cursor/install.sh install

4) Network/proxy issues
- If you are behind a proxy, export HTTP_PROXY/HTTPS_PROXY with your proxy settings before running the installer.
- If TLS/SSL validation fails, ensure your CA certificates are up to date.

5) PATH and shell issues on macOS/Linux
- Ensure /usr/local/bin (or the directory where upower-cursor installs) is in your PATH.
- If the command "upower-cursor" is not found after install, verify the installer path and symlinks.

6) Conflicting installations from other adapters
- If another adapter uses the same binary names, verify your PATH priorities or rename/remove conflicting symlinks as needed.

If you still encounter issues, please capture:
- The full command you ran
- The exact error message and exit code
- Your OS version and Node/runtime versions (if applicable)


## 5) Verification checklist (acceptance criteria)
- The file path exists: /Users/leelee/Library/Mobile Documents/com~apple~CloudDocs/Trae_Playground/「Personal」小团队日常/Leah_实验室/UPower_Design/Source/UPower_v3.4/adapters/cursor/README.md
- The README includes:
  - A 30-second install command
  - Upgrade commands
  - Uninstall commands
  - Troubleshooting section addressing Node, permissions, and conflicts
- The install.sh script is referenced and described as the source for install/upgrade/uninstall.
