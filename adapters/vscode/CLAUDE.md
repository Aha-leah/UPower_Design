# UPower Design — VSCode / Claude Code Rules

> Place this file as `CLAUDE.md` in your project root to enable UPower commands.

## Setup

1. Ensure UPower is installed (clone or copy the UPower package somewhere accessible)
2. Place this file in your project root
3. Tell Claude the UPower root path when prompted

## Slash Commands

### /new [Name]
Initialize a new UPower project from template.
```bash
node <upower_root>/upower.js scaffold --root <cwd> --name [Name]
```
Creates `Source/[Name]/` with standard template structure.

### /build
Execute the manifest-driven build pipeline.
Read `Source/[Name]/project_state.json` → execute the next phase.

### /plan
Show current project state and pending steps.

### /opentalk [Topic]
Start a multi-agent discussion session.

## Expected Structure After /new

```
Source/[Name]/
├── input/
│   ├── for_prd/       ← Place raw requirements here
│   ├── prd(input).md
│   └── brand_dna.md
├── style_prompt.md
├── design_system_specs.md
├── animation_prompts.md
├── skeleton_template.json
├── web_content.js
└── system_prompt.md
```

## Notes

- UPower Root = the directory containing `upower.js` and `core/`
- Never manually edit generated files in `projects/`
