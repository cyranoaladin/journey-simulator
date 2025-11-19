export type Language = 'fr' | 'en'
export type Mode = 'discovery' | 'builder' | 'expert'
export type Tone = 'pedagogical' | 'investor_pitch' | 'critical'

export interface Metadata {
  persona_id: string
  journey_track: string
  phase_id: 'learn' | 'build' | 'prove' | 'activate' | 'scale' | string
  language: Language
  mode?: Mode
  tone?: Tone
  title?: string
  summary?: string
}

export type TextBlock = { kind: 'text_block'; id: string; title: string; body_markdown: string }
export type ChecklistItem = { label: string; checked?: boolean }
export type ChecklistBlock = { kind: 'checklist_block'; id: string; title: string; items: ChecklistItem[] }
export type QuizQuestion = { id: string; question: string; options: string[]; correct_option_index: number; explanation: string }
export type QuizBlock = { kind: 'quiz_block'; id: string; title: string; questions: QuizQuestion[] }
export type MissionBlock = {
  kind: 'mission_block'
  id: string
  title: string
  description: string
  mission_type: string
  expected_input_type: 'text' | 'markdown_document' | 'code_snippet' | 'link' | 'choice'
  xp_reward: number
  nft_reward_id?: string
  is_mandatory?: boolean
}
export type ResourceItem = {
  id: string
  label: string
  description?: string
  url?: string
  resource_type: 'article' | 'video' | 'template' | 'code_snippet' | 'checklist' | 'tool_link' | 'flashcard'
  agent_owner: string
}
export type ResourceBlock = { kind: 'resource_block'; id: string; title: string; resources: ResourceItem[] }
export type DocumentBlock = { kind: 'document_block'; id: string; title: string; doc_type: string; content_markdown: string }
export type EvaluationAxis = { name: string; score: number; max_score: number; comment: string }
export type EvaluationBlock = {
  kind: 'evaluation_block'
  id: string
  title: string
  global_score: number
  max_score: number
  feedback: string
  axes: EvaluationAxis[]
}
export type ActionSuggestion = { label: string; action_id: string }
export type ActionSuggestionsBlock = { kind: 'action_suggestions_block'; id: string; title: string; suggestions: ActionSuggestion[] }
export type XpBlock = { kind: 'xp_block'; id: string; title?: string; current_xp: number; gained_xp: number; next_level_xp: number; comment?: string }

export type DiagramBlock = { kind: 'diagram_block'; id: string; title: string; diagram_type: 'mermaid'; content: string; caption?: string }

export type Proposal = { id: string; title: string; description: string; votesFor: number; votesAgainst: number; status: 'active' | 'passed' | 'rejected'; endDate: string }
export type DAODashboardBlock = { kind: 'dao_dashboard_block'; id: string; title: string; votingPower: number; proposals: Proposal[] }

export type Project = { id: string; name: string; description: string; tags: string[]; fundingGoal: number; currentFunding: number }
export type ProjectSelectionBlock = { kind: 'project_selection_block'; id: string; title: string; projects: Project[] }

export type UIBlock =
  | TextBlock
  | ChecklistBlock
  | QuizBlock
  | MissionBlock
  | ResourceBlock
  | DocumentBlock
  | EvaluationBlock
  | ActionSuggestionsBlock
  | XpBlock
  | DiagramBlock
  | DAODashboardBlock
  | ProjectSelectionBlock

export type AgentAction = { agent_name: string; reason: string; action: string; parameters?: Record<string, any> }
export type NextState = { phase_id: string; completed_missions: string[]; xp_delta: number; notes?: string }

export interface JourneyStepResponse {
  metadata: Metadata
  ui_blocks: UIBlock[]
  agent_actions: AgentAction[]
  next_state: NextState
}
