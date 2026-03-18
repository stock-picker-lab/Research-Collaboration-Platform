/**
 * 投研协作平台 - TypeScript 类型定义
 */

// ============ 通用 ============

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Citation {
  document_id: string;
  document_title: string;
  chunk_id?: string;
  page_number?: number;
  paragraph?: string;
  relevance_score?: number;
}

export interface AIOutput {
  content: string;
  confidence_level: "high" | "medium" | "low";
  citations: Citation[];
}

// ============ User ============

export type UserRole = "researcher" | "pm" | "leader" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  team?: string;
  is_active: boolean;
  avatar_url?: string;
}

// ============ Company ============

export interface Company {
  id: string;
  name: string;
  ticker: string;
  industry?: string;
  sector?: string;
  tags?: string[];
  peer_list?: string[];
  supply_chain_up?: string[];
  supply_chain_down?: string[];
  created_at: string;
}

// ============ Document ============

export type DocumentType = "report" | "announcement" | "filing" | "news" | "memo" | "transcript";

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  source?: string;
  company_id?: string;
  publish_time?: string;
  summary?: Record<string, any>;
  ai_analysis?: Record<string, any>;
  tags?: string[];
  file_url?: string;
  event_type?: string;
  importance?: string;
  created_at: string;
}

// ============ Task ============

export type TaskStatus = "pending" | "in_progress" | "under_review" | "completed" | "cancelled";
export type TaskPriority = "urgent" | "high" | "medium" | "low";

export interface ResearchTask {
  id: string;
  title: string;
  type: string;
  description?: string;
  related_company_ids?: string[];
  owner_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  template_id?: string;
  workflow_status?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============ Conclusion Card ============

export type Stance = "bullish" | "neutral" | "cautious" | "bearish";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface ConclusionCard {
  id: string;
  company_id: string;
  author_id: string;
  stance: Stance;
  thesis?: string;
  risks?: string;
  key_metrics?: Record<string, any>;
  confidence_level: ConfidenceLevel;
  citations?: Record<string, any>[];
  version: number;
  is_latest: boolean;
  change_reason?: string;
  assumptions: Assumption[];
  created_at: string;
  updated_at: string;
}

// ============ Assumption ============

export type AssumptionStatus = "pending" | "verified" | "broken" | "partially_verified";

export interface Assumption {
  id: string;
  conclusion_card_id: string;
  type: string;
  description: string;
  expected_value?: string;
  actual_value?: string;
  deviation_ratio?: number;
  status: AssumptionStatus;
  auto_verified_at?: string;
  created_at: string;
}

// ============ Question ============

export type QuestionStatus = "open" | "answered" | "pending_verification" | "closed";

export interface QuestionThread {
  id: string;
  company_id?: string;
  asker_id: string;
  assignee_id: string;
  question: string;
  answer?: string;
  answer_citations?: Record<string, any>[];
  status: QuestionStatus;
  priority: TaskPriority;
  parent_thread_id?: string;
  created_at: string;
  updated_at: string;
}

// ============ Alert ============

export type AlertSeverity = "P0" | "P1" | "P2";

export interface Alert {
  id: string;
  event_type: string;
  severity: AlertSeverity;
  title: string;
  summary?: string;
  related_company_ids?: string[];
  source_document_id?: string;
  push_status: string;
  viewed_at?: string;
  created_at: string;
}

// ============ Template ============

export interface ResearchTemplate {
  id: string;
  name: string;
  type: string;
  description?: string;
  sections: {
    steps: {
      id: string;
      title: string;
      required: boolean;
      hints: string[];
    }[];
  };
  is_system_default: boolean;
  created_at: string;
}
