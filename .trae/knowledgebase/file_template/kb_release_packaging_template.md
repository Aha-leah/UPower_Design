# Release Packaging Checklist (UPower Version Pack)

## 0. Metadata
- Version: vX.Y (e.g. v2.2)
- Source Workspace: [path]
- Target Package Folder: [path]
- Intended Audience: GitHub Open Source / Internal Distribution

## 1. README Readiness
- Root README exists (not inside `.trae/`) and includes:
  - English + 中文
  - Quick Start (minimal, reproducible)
  - Command list link (`.trae/skills/COMMAND_LIST.md`)
  - External dependency notes (e.g. agent-reach, MCP)
- `.trae/README.md` is not shipped (or is a stub linking to root README), if required by policy
- Changelog updated with:
  - Version, Date
  - Summary of changes (what’s new, what’s removed, breaking changes)

## 2. Knowledgebase Hygiene
- Only ship non-empty knowledge folders
- Add/Update templates required by the release:
  - [ ] PRD template
  - [ ] Project execution template
  - [ ] Release packaging template (this file)

## 3. Skills & External Integrations
- Audit all skills under `.trae/skills/*/SKILL.md`:
  - Each skill description matches current capability
  - No stale tool references
- External helpers documented in root README:
  - agent-reach (optional)
  - MCP integrations (if enabled): Figma Bridge + image generation (via visual-designer)

## 4. Exclusion Rules (Open Source)
- Do not ship snapshots (historical/frozen copies): `.trae/snapshots/`
- Do not ship internal-only workflows unless explicitly needed:
  - `.trae/skills/web-maker-工作流/` (optional)
- Do not ship empty directories
- Do not ship local logs/temporary artifacts

## 5. Sync Procedure (Suggested)
- Sync `.trae/` with exclusion rules applied
- Ensure target root README is updated
- Verify directory structure after sync:
  - `.trae/rules/`
  - `.trae/scaffold/`
  - `.trae/skills/`
  - `.trae/knowledgebase/` (non-empty only)

## 6. Final Validation
- Search for “TODO”, “TBD”, “placeholder” in root README and critical skill docs
- Confirm quick start commands run without manual patching
- Confirm no internal links/paths are exposed (unless intended)
