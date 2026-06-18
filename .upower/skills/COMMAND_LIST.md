# 🎮 UPower 2.0 Command Center

Here is the master list of commands and interaction protocols for your AI Squad.

## 1. 🗣️ The "Open Talk" Protocol (Concierge Mode)

Use these commands to discuss, plan, and brainstorm before building.

| Command | Arguments | Description |
| :--- | :--- | :--- |
| **/opentalk** | `[Topic]` | **Starts a Squad Session**. Atlas (PM) invites relevant agents (e.g., Alice, Bob) to discuss the topic. |
| **/consult** | `[Name] [Question]` | **Direct Query**. Ask a specific agent for their expert opinion. |
| **/brainstorm** | `[Topic]` | **Ideation Mode**. Generates divergent ideas using methods like SCAMPER. |
| **/audit** | `[Target]` | **Quality Check**. Summons Judge Dredd to critique the PRD, Design, or Code. |
| **/help** | - | Shows this list. |

### 👥 The Squad Roster (Who to consult)

| Name | Role | Personality & Vibe | Focus Area |
| :--- | :--- | :--- | :--- |
| **Atlas** | Project Manager | **The Orchestrator**. Autonomous, Directive, Persistent. | Strategy, Coordination, Execution |
| **Alice** | Product Designer | **The Muse**. Strategic, Empathetic, Visionary (INTJ). | User Needs, Features, PRD |
| **Bob** | Visual Designer | **The Artist**. Aesthetic, Detailed, Motion-Obsessed. | Aesthetics, Style, Motion |
| **Mia** | UX Architect | **The Structurist**. Logical, Structural, User-Centric. | Structure, Flows, Wireframes |
| **Neo** | System Architect | **The Engineer**. Precise, Feasible, Matrix-Minded. | Tech Stack, Data Models, APIs |
| **Tina** | Growth Ops | **The Hacker**. Bilingual, ROI-Driven, Tech-Native. | Copywriting, Conversion, Marketing |
| **Ken** | Frontend Dev | **The Builder**. Pragmatic, Pixel-Perfect, Efficient. | React, Tailwind, Code |
| **Judge** | Auditor | **The Critic**. Cynical, Strict, Unforgiving. | Consistency, Quality, Logic |

---

## 2. 🏗️ The "Builder" Protocol (Builder Mode)

Use these commands when you are ready to execute.

| Command | Description |
| :--- | :--- |
| **/new [Name]** | **Initialize**. Scaffolds a new project folder `Source/[Name]` and prepares the environment. |
| **/build** | **Execute Manifest**. Atlas reads `project_state.json` and triggers the next step in the pipeline. |
| **/plan** | **Show Status**. Displays the current project phase and missing assets. |
| **/freeze** | **Emergency Stop**. Halts the current operation. |

### 🔄 Manual Override (Step-by-Step)

If you need to manually trigger a specific phase of the workflow (as defined in `TEAM_ROSTER.md`):

| Command | Equivalent to | Target Agent |
| :--- | :--- | :--- |
| **/define** | "Phase 1: Definition" | **Alice** (Generates PRD & DNA) |
| **/design** | "Phase 2: Design" | **Mia/Bob/Neo/Tina** (Generates Assets) |
| **/assemble** | "Phase 3: Assembly" | **Atlas** (Compiles System Prompt) |
| **/code** | "Phase 4: Build" | **Ken** (Initializes & Runs Server) |

---

## 3. 📝 Examples

**Scenario 1: New Idea**
> **User**: "/opentalk We need a landing page for a cat cafe."
> **Atlas**: "Inviting Alice (Product) and Bob (Visual)..."
> **Alice**: "We should focus on 'Cozy' and 'Playful' vibes."
> **Bob**: "I suggest a warm palette with rounded corners."

**Scenario 2: Specific Question**
> **User**: "/consult **Neo** Should we use Next.js or Vite?"
> **Neo**: "For a static landing page, Vite is leaner. But if you need SEO, Next.js is better."

**Scenario 3: Ready to Build**
> **User**: "/build"
> **Atlas**: "Acknowledged. Locking requirements. Starting Phase 1: PRD Generation..."

**Scenario 4: Manual Override**
> **User**: "/define"
> **Atlas**: "Skipping auto-detection. Forcing Phase 1 (Alice). Generating PRD..."
