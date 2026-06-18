# AI Squad: The "Figma Feeder" Team

This document outlines the **AI Agent Roster** available in this workspace (`.trae/skills`). 
These agents form a complete product team, capable of taking an abstract idea (`init`) to a deployed preview (`preview`) with minimal human intervention.

## 👥 The Squad Roster

| Role | Agent Name | Skill ID | Function | Personality |
| :--- | :--- | :--- | :--- | :--- |
| **Project Manager** | **Atlas** (The Orchestrator) | `project-manager` | **Team Lead**. Manages state (`project_state.json`), chains tools, and ensures the workflow moves forward. | Autonomous, Directive, Persistent. |
| **Product Designer** | **Alice** (Product Muse) | `product-designer` | **Ideation**. Transforms raw notes into a Strategic PRD and Brand DNA. | Strategic, Empathetic, Visionary (INTJ). |
| **UX Architect** | **Mia** | `ux-architect` | **Structure**. Converts PRD into a JSON Skeleton (IA/Wireframe). | Logical, Structural, User-Centric. |
| **Visual Designer** | **Bob** | `visual-designer` | **Aesthetics**. Defines Visual Style (Midjourney) and Motion Physics (Framer). | Artistic, Detailed, Motion-Obsessed. |
| **System Architect** | **Neo** (The Matrix) | `system-architect` | **Specs**. Defines Design Tokens (Colors, Typography, Spacing). | Engineering-Minded, Precise, Feasible. |
| **Growth Ops** | **Tina** (+Flux) | `growth-ops-architect` | **Content**. Writes high-conversion copy and defines technical/business logic. | Bilingual, Tech-Native, ROI-Driven. |
| **Frontend Engineer**| **Ken** (The Builder) | `frontend-engineer` | **Implementation**. Writes React/Tailwind code and runs the dev server. | Pragmatic, Pixel-Perfect, Efficient. |
| **Auditor** | **Judge** (The Critic) | `project-auditor` | **QA**. Reviews the final output against the initial PRD. | Cynical, Strict, Unforgiving. |

---

## 🔄 The Relay Workflow (Manifest-Driven)

The team operates on a **"Hot Potato"** model. They pass the project state forward, updating `Source/[Name]/project_state.json` at each step.

### 1. Definition Phase (Alice)
*   **Trigger**: User provides raw ideas in `input/for_prd/`.
*   **Action**: Alice reads inputs -> Generates `prd(input).md` & `brand_dna.md`.
*   **State**: `raw` -> `define`.

### 2. Design Phase (Mia, Bob, Architect, Tina)
*   **Trigger**: PRD is ready.
*   **Action**: 
    *   Mia -> `skeleton_template.json`
    *   Bob -> `style_prompt.md` & `animation_prompts.md`
    *   Architect -> `design_system_specs.md`
    *   Tina -> `web_content.js`
*   **State**: `define` -> `design`.

### 3. Assembly Phase (Project Manager)
*   **Trigger**: All assets ready.
*   **Action**: Compiles assets into `system_prompt.md`.
*   **State**: `design` -> `assemble`.

### 4. Build Phase (Ken)
*   **Trigger**: System Prompt ready.
*   **Action**: Ken initializes Vite -> Injects Code -> Runs Server.
*   **State**: `assemble` -> `build` -> `preview`.

### 5. Audit Phase (The Critic)
*   **Trigger**: Server is running.
*   **Action**: The Critic reads PRD vs. Code -> Generates `audit_report.md`.
*   **State**: `preview` -> `audit`.

---

## 🚀 How to Deploy This Team

To use this team in a new project:

1.  **Copy the `.trae` folder** to your new project root.
2.  **Initialize**:
    ```bash
    # In the chat
    Start new project "MyNextBigThing"
    ```
3.  **Sit Back**:
    The `project-manager` will detect the state and summon the right agent (Alice, Bob, Ken, etc.) automatically.

## ⚠️ Maintenance Notes

*   **Prompt Assets**: The agents rely on templates in `Docs/「Template」Object_Name`. Ensure these paths exist in the new project or update the Skill files.
*   **Daemon**: The "OS Kernel" (`Docs/OS_Kernel/daemon.js`) is crucial for the `project-manager` to "feel" file changes. Run it in a background terminal.
