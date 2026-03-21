/**
 * 投研协作平台 - 类型定义 v2.0
 */

// ========== 枚举 ==========

export type UserRole = 'researcher' | 'pm' | 'leader' | 'admin';

export type TaskStatus = 'pending' | 'in_progress' | 'under_review' | 'completed' | 'cancelled';

export type TaskPriority = 'P0' | 'P1' | 'P2';

export type TemplateType = 'deep_research' | 'earnings_review' | 'event_review' | 'peer_comparison' | 'transcript_summary';

export type DocumentType = 'research_report' | 'announcement' | 'annual_report' | 'transcript' | 'other';

export type Stance = 'bullish' | 'neutral' | 'cautious' | 'bearish';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type QuestionStatus = 'open' | 'answered' | 'closed';

export type AlertSeverity = 'P0' | 'P1' | 'P2';

export type ConclusionStatus = 'draft' | 'published' | 'archived';

export type PortfolioStatus = 'active' | 'closed' | 'watchlist';

export type DataSourceStatus = 'active' | 'syncing' | 'error' | 'disabled';

// ========== 接口 ==========

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  team?: string;
  title?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string;
  coverage_companies?: string[];
  coverage_industries?: string[];
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  exchange?: string;
  industry?: string;
  sector?: string;
  market_cap?: number;
  description?: string;
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  pm_user_id: string;
  company_id: string;
  company?: Company;
  shares?: number;
  weight: number;
  avg_cost?: number;
  current_price?: number;
  stance: Stance;
  status: PortfolioStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Watchlist {
  id: string;
  pm_user_id: string;
  company_id: string;
  company?: Company;
  reason?: string;
  priority: TaskPriority;
  status: PortfolioStatus;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  company_id?: string;
  company?: Company;
  uploader_id?: string;
  uploader?: User;
  title: string;
  doc_type: DocumentType;
  file_path?: string;
  file_size?: number;
  content?: string;
  summary?: string;
  tags?: string[];
  publish_time?: string;
  event_type?: string;
  importance?: string;
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchTask {
  id: string;
  company_id?: string;
  company?: Company;
  assignee_id: string;
  assignee?: User;
  reviewer_id?: string;
  reviewer?: User;
  created_by_id?: string;
  creator?: User;
  template_id?: string;
  template?: ResearchTemplate;

  title: string;
  description?: string;
  type: TemplateType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  workflow_progress?: TaskStep[];
  current_step?: number;
  created_at: string;
  updated_at: string;
}

export interface TaskStep {
  step_id: string;
  step_title: string;
  status: TaskStatus;
  completed_at?: string;
}

export interface ConclusionCard {
  id: string;
  company_id: string;
  company?: Company;
  author_id: string;
  author?: User;
  template_id?: string;
  template?: ResearchTemplate;
  task_id?: string;
  task?: ResearchTask;

  core_conclusions?: { text: string; evidence?: string }[];
  key_changes?: string[];
  risk_points?: string[];
  questions_to_watch?: string[];

  stance: Stance;
  target_price?: number;
  upside?: number;
  confidence: ConfidenceLevel;
  status: ConclusionStatus;
  published_at?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionThread {
  id: string;
  company_id?: string;
  company?: Company;
  asker_id: string;
  asker?: User;
  researcher_id: string;
  researcher?: User;
  task_id?: string;
  task?: ResearchTask;

  title: string;
  content: string;
  answer?: string;
  answer_citations?: { doc_id: string; doc_title: string }[];
  status: QuestionStatus;
  priority: TaskPriority;
  answered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  company_id?: string;
  company?: Company;
  recipient_id?: string;
  recipient?: User;
  document_id?: string;
  document?: Document;

  alert_type: string;
  severity: AlertSeverity;
  title: string;
  content?: string;
  is_read: boolean;
  read_at?: string;
  extra_data?: Record<string, any>;
  created_at: string;
}

export interface ResearchTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description?: string;
  sections: TemplateSection[];
  is_system_default: boolean;
  is_active: boolean;
  version: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  required: boolean;
  hints?: string[];
}

export interface TeamDocument {
  id: string;
  document_id: string;
  document?: Document;
  shared_by: string;
  sharer?: User;
  team: string;
  permission: 'view' | 'comment' | 'edit';
  created_at: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'external_api' | 'internal_db' | 'file_import' | 'manual';
  config?: Record<string, any>;
  status: DataSourceStatus;
  sync_frequency?: string;
  last_sync_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSetting {
  id: string;
  user_id: string;
  channel_in_app: boolean;
  channel_email: boolean;
  channel_sms: boolean;
  channel_wechat: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  receive_p0: boolean;
  receive_p1: boolean;
  receive_p2: boolean;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user?: User;
  action: string;
  object_type: string;
  object_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ResearcherDashboardData {
  todo_count: number;
  coverage_count: number;
  changes_count: number;
  recent_todos: ResearchTask[];
  coverage_companies: (Company & { rating: Stance; new_docs: number })[];
  recent_alerts: Alert[];
}

export interface PMDashboardData {
  portfolio_count: number;
  watchlist_count: number;
  today_changes: number;
  coverage_rate: number;
  pending_questions: number;
  recent_changes: Alert[];
  question_stats: {
    pending: number;
    answered: number;
    closed: number;
  };
}

export interface LeaderDashboardData {
  task_completion_rate: number;
  weekly_output: number;
  avg_response_time: string;
  coverage_rate: number;
  output_trend: number[];
  response_trend: number[];
}
