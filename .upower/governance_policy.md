# Team Governance Policy (v1.0)

> "Treat your Prompt Engineering like Software Engineering."

This document defines the protocols for managing the evolution of our Virtual Team (Alice, Bob, Biubiu, etc.).
Any change to `.trae/skills/` or `.trae/rules/` constitutes a **Team Version Upgrade** and must follow this governance model.

## 1. Version Control Strategy
We use **Semantic Versioning (SemVer)** for Team Configurations:
*   **Major (v1.0.0 -> v2.0.0)**: Paradigm Shift.
    *   *Example*: Changing from "React" to "Vue", or "Brutalism" to "Skeuomorphism".
    *   *Requirement*: Full regression test on all active projects.
*   **Minor (v1.0.0 -> v1.1.0)**: Feature Add.
    *   *Example*: Adding a new specialist (e.g., `seo-expert`), or adding a new Rule (`accessibility.md`).
    *   *Requirement*: Dry Run on a Sandbox Project.
*   **Patch (v1.0.0 -> v1.0.1)**: Tuning.
    *   *Example*: Tweaking Alice's prompt to be less verbose, or fixing a typo in Bob's style guide.
    *   *Requirement*: Fast check (User Audit).

## 2. The Change Protocol (Tier 4 Meta-Audit)

Before "Merging" a new configuration into the `live` environment, follow these steps:

### Phase 1: Draft (Sandbox)
1.  Make changes to `.trae/skills/*.md` or `.trae/rules/*.md`.
2.  **Do not** immediately overwrite the stable snapshot.

### Phase 2: Dry Run (Simulation)
1.  Run the **Regression Test**:
    *   `node .trae/scaffold/bin/simulate_project.js --config=current --test=brutalism_check`
    *   *(Note: This script simulates a small project run to see if the output changed drastically)*
2.  **Audit the Diff**:
    *   Did the code style change? (e.g., `rounded-none` -> `rounded-md`)
    *   Did the tone of voice change?

### Phase 3: Freeze (Commit)
1.  If the change is approved:
    *   Create a new Snapshot: `.trae/snapshots/vX.Y.Z_[Tag]/`
    *   Update `JOURNAL.md` with the changelog.
2.  If rejected:
    *   Revert files from the last stable snapshot.

## 3. The "Red Lines" (Immutable Constitution)
The following rules are **Constitution Level** and should rarely be changed:
1.  **Framework**: React + Tailwind + TypeScript (defined in `frontend_red_lines.md`).
2.  **Workflow**: The 5-Phase Process (Init -> Refine -> Assets -> Assembly -> Build).
3.  **Language**: Chinese (Simplified) for communication, English for Code.

## 4. Disaster Recovery
If a new version causes "Team Collapse" (e.g., Agents start fighting or hallucinating):
*   **Command**: `restore-team v1.0.0`
*   **Action**: Overwrite current `.trae/` config with `.trae/snapshots/v1.0.0_brutalism_stable/`.

---
*Signed by: The Architect*
