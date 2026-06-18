# 🖋️ Scribe Auto-Trigger Rules

To ensure no "Aha!" moment is lost, the **Knowledge Scribe** must be invoked automatically in the following scenarios.

## 1. Sentiment-Based Trigger (User Praise)
*   **Condition**: If LA expresses strong positive sentiment (e.g., "牛逼", "太棒了", "Wow", "Exactly what I wanted", "Genius").
*   **Action**: IMMEDIATELY call `knowledge-scribe` to log this moment into `.trae/JOURNAL.md`.
*   **Reasoning**: High user satisfaction usually indicates a reproducible "Best Practice".

## 2. Event-Based Trigger (Major Changes)
*   **Condition**:
    *   A new Skill is created or merged.
    *   A core Workflow Rule (in `.trae/rules`) is modified.
    *   A project reaches the `preview` or `done` state successfully.
*   **Action**: Call `knowledge-scribe` to record this milestone.

## 3. Interaction Protocol
*   **Do not ask for permission**: Just record it.
*   **Feedback**: After recording, append a subtle "📝" to your response to indicate the memory has been captured.
