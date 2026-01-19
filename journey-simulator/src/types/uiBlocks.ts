/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

export type Language = 'fr' | 'en'
export type Mode = 'discovery' | 'builder' | 'expert' | 'investor_demo'
export type RunMode = 'demo' | 'simulation' | 'real'
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
  feedback_markdown?: string
  status?: string
  axes: EvaluationAxis[]
}
export type ActionSuggestion = { label: string; action_id: string }
export type ActionSuggestionsBlock = { kind: 'action_suggestions_block'; id: string; title: string; suggestions: ActionSuggestion[] }
export type HintBlock = {
  kind: 'hint_block';
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  linkText?: string;
}
export type XpBlock = { kind: 'xp_block'; id: string; title?: string; current_xp: number; gained_xp: number; next_level_xp: number; comment?: string }

export type DiagramBlock = { kind: 'diagram_block'; id: string; title: string; diagram_type: 'mermaid'; content: string; caption?: string }

export type Proposal = { id: string; title: string; description: string; votesFor: number; votesAgainst: number; status: 'active' | 'passed' | 'rejected'; endDate: string }
export type DAODashboardBlock = { kind: 'dao_dashboard_block'; id: string; title: string; votingPower: number; proposals: Proposal[] }

export type Project = { id: string; name: string; description: string; tags: string[]; fundingGoal: number; currentFunding: number }
export type ProjectSelectionBlock = { kind: 'project_selection_block'; id: string; title: string; projects: Project[] }

export type NarrativeChoiceOption = {
  id: string;
  label: string;
  description: string;
  outcomeSummary: string;
}

export type NarrativeChoiceBlock = {
  kind: 'narrative_choice_block';
  id: string;
  title: string;
  description: string;
  choices: NarrativeChoiceOption[];
}

export type IndicatorValue = {
  name: string;
  value: number;
  max: number;
  color?: string;
}

export type TemplateField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  placeholder?: string;
  options?: string[];
}

export type InteractiveTemplateBlock = {
  kind: 'interactive_template_block';
  id: string;
  title: string;
  description: string;
  templateType: 'one-pager' | 'pitch-deck' | 'tokenomics' | 'governance' | 'launch-plan';
  fields: TemplateField[];
  agentOwner: string;
}

export type IndicatorBlock = {
  kind: 'indicator_block';
  id: string;
  title: string;
  indicators: IndicatorValue[];
  type: 'gauge' | 'radar' | 'bar';
}

export type BondingCurveBlock = {
  kind: 'bonding_curve_block';
  id: string;
  title: string;
  description: string;
  curveType: 'linear' | 'exponential' | 'custom';
  data: {
    currentSupply: number;
    maxSupply: number;
    reserveRatio: number;
    basePrice: number;
  };
}

export type CodeAuditorBlock = {
  kind: 'code_auditor_block';
  id: string;
  title: string;
  code: string;
  language: string;
  vulnerableLine?: number;
  explanation: string;
  vulnerabilities?: any[]; // Array of vulnerability objects
}

export type MarketLaunchpadBlock = {
  kind: 'market_launchpad_block';
  id: string;
  title: string;
  protocolName: string;
  ticker: string;
  launchUrl: string;
  initialProgress: number;
}

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
  | NarrativeChoiceBlock
  | IndicatorBlock
  | InteractiveTemplateBlock
  | HintBlock
  | BondingCurveBlock
  | CodeAuditorBlock
  | MarketLaunchpadBlock

export type AgentAction = { agent_name: string; reason: string; action: string; parameters?: Record<string, any> }
export type NextState = { phase_id: string; completed_missions: string[]; xp_delta: number; notes?: string }

export interface JourneyStepResponse {
  metadata: Metadata
  ui_blocks: UIBlock[]
  agent_actions: AgentAction[]
  next_state: NextState
}
