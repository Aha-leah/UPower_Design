#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const CORE = path.join(__dirname, 'core');
const [,, cmd, ...rest] = process.argv;

const COMMANDS = {
  scaffold: 'scaffold_project.js',
  ask:      'ask_ai.js',
  assemble: 'assemble_system_prompt.js',
};

if (!cmd || cmd === '--help' || !COMMANDS[cmd]) {
  console.log(`UPower Design v3.4 — IDE-agnostic CLI

Usage:
  node upower.js scaffold --root <project_root> --name <name>
  node upower.js ask      <step> <project_path>
  node upower.js assemble <project_source_path>

Commands:
  scaffold   Initialize a new project from template
  ask        Generate AI prompts for a specific step (prd|dna|style|specs|motion|skeleton|payload)
  assemble   Compile design assets into system_prompt.md

Options:
  --root     Project root directory (default: cwd)
  --name     Project name (scaffold only)
  --help     Show this message`);
  process.exit(cmd === '--help' ? 0 : (cmd ? 1 : 0));
}

const result = spawnSync('node', [path.join(CORE, COMMANDS[cmd]), ...rest], { stdio: 'inherit' });
process.exit(result.status);
