# UI Components Mapping & States

- text_block → <TextBlock /> (title, markdown)
- checklist_block → <ChecklistBlock /> (items[label,checked])
- mission_block → <MissionPanel /> (expected_input_type: text/markdown/code/link/choice)
- quiz_block → <QuizBlock /> (immediate feedback)
- document_block → <DocumentViewer /> (Markdown)
- resource_block → <ResourceList /> (cards, agent_owner badge)
- evaluation_block → <EvaluationSummary /> (axes + global)
- action_suggestions_block → <ActionSuggestions /> (cta buttons)
- xp_block → <XPTracker /> (delta + next level)

States & UX:
- loading, empty, error, success
- animation on appear, minimal skeletons
- accessibility roles/labels
