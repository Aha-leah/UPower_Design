# Workflow: Open Talk (Party Mode)

**Trigger**: `/opentalk` command.

## Phase 1: Setup
1.  **Identify Topic**: Extract the discussion topic from user input. If missing, ask: "What are we discussing?"
2.  **Select Panel**: Choose 2-3 relevant agents from `TEAM_ROSTER.md`.
    *   *Example*: UI Topic -> Visual Designer + Frontend Engineer.
    *   *Example*: Strategy Topic -> Product Designer + Growth Architect.
3.  **Set Context**: Briefly summarize the current project state (if any).

## Phase 2: The Discussion Loop (Simulated)
The PM generates a multi-turn dialogue in a SINGLE response.

**Format**:
```markdown
### 🎙️ Open Talk Session: [Topic]

**PM**: I've invited [Agent A] and [Agent B] to discuss [Topic].

**[Agent A Name]** ([Role]):
"[Opinion based on Persona principles]"

**[Agent B Name]** ([Role]):
"[Counter-opinion or refinement based on Persona principles]"

**PM**:
"We have two directions here:
1. [Option A]
2. [Option B]
LA, which path do you want to explore?"
```

## Phase 3: Synthesis
When the User responds to the options:
1.  **PM**: "Understood. Aligning on [Option]."
2.  **Action**: Update the relevant documentation (e.g., `brand_dna.md`, `prd.md`) with the decision.
3.  **Prompt**: "Do you want to `/build` this now, or continue discussing?"
