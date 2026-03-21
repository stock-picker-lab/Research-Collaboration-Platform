# 投研协作平台 - 完整规格文档 v2.0

## 1. 项目概述

### 1.1 项目背景
投研协作平台是一个面向证券/基金行业的研究管理系统，支持基金经理、研究所研究员、研究所领导、系统管理员四种角色，实现研究文档管理、公司跟踪、问题协作、结论卡片等核心功能。

### 1.2 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 前端框架 | React 18 + TypeScript | 使用 TDesign 组件库 |
| 前端路由 | React Router v6 | 角色化路由管理 |
| 状态管理 | Zustand | 轻量全局状态 |
| 数据请求 | TanStack Query (React Query) | 服务端状态管理 |
| 后端框架 | FastAPI (Python) | 异步 API |
| 数据库 | PostgreSQL + SQLAlchemy (async) | 异步 ORM |
| 认证 | JWT | 无状态认证 |
| 向量检索 | pgvector | 文档语义搜索 |
| 文件存储 | Local / OSS | 研报文档存储 |
| 部署 | Docker Compose | 容器化部署 |

### 1.3 角色权限矩阵

| 功能 | 研究员 | 基金经理 | 研究所领导 | 系统管理员 |
|------|--------|---------|-----------|-----------|
| 查看研究报告 | ✓ | ✓ | ✓ | ✓ |
| 创建/编辑结论卡 | ✓ | ✗ | ✗ | ✓ |
| 发起问题 | ✓ | ✓ | ✓ | ✓ |
| 回复问题 | ✓ | ✗ | ✓ | ✓ |
| 持仓管理 | ✗ | ✓ | ✗ | ✗ |
| 查看持仓预警 | ✗ | ✓ | ✓ | ✓ |
| 团队效率看板 | ✗ | ✗ | ✓ | ✓ |
| 任务分配 | ✓ | ✗ | ✓ | ✓ |
| 用户权限管理 | ✗ | ✗ | ✗ | ✓ |
| 系统配置 | ✗ | ✗ | ✗ | ✓ |
| 模板管理 | ✓ | ✗ | ✓ | ✓ |
| 审计日志 | ✗ | ✗ | ✗ | ✓ |

---

## 2. 数据库模型设计

### 2.1 ER 图概览

```
User (用户)
  ├── id, username, email, hashed_password, name, role
  ├── team, title, phone, avatar_url
  ├── created_at, updated_at, last_login_at, is_active

Company (公司)
  ├── id, name, ticker, exchange, industry, sector
  ├── market_cap, description, tags
  ├── created_at, updated_at

Portfolio (持仓 - 基金经理)
  ├── id, user_id (PM), company_id
  ├── shares, weight, avg_cost, current_price
  ├── rating, created_at, updated_at

Watchlist (观察池)
  ├── id, user_id (PM), company_id
  ├── added_at, reason, priority

Document (文档)
  ├── id, company_id, uploader_id, title
  ├── doc_type (研报/公告/年报/纪要/其他)
  ├── file_path, file_size, file_hash
  ├── tags, summary, vector_embedding
  ├── created_at, updated_at

ResearchTask (研究任务)
  ├── id, company_id, assignee_id, reviewer_id
  ├── title, description, template_id
  ├── status (pending/in_progress/under_review/completed/cancelled)
  ├── priority (P0/P1/P2)
  ├── due_date, completed_at
  ├── created_at, updated_at

TaskProgress (任务进度)
  ├── id, task_id, step_id, step_title
  ├── status, notes, completed_at

ConclusionCard (结论卡)
  ├── id, company_id, author_id, template_id
  ├── stance (bullish/neutral/cautious/bearish)
  ├── target_price, upside, core_logic
  ├── key_changes, risk_points, confidence
  ├── status (draft/published/archived)
  ├── published_at, created_at, updated_at

QuestionThread (问题)
  ├── id, company_id, asker_id, researcher_id
  ├── title, content, status (open/answered/closed)
  ├── priority, created_at, answered_at

QuestionAnswer (问题回答)
  ├── id, question_id, answerer_id
  ├── content, created_at

Alert (预警)
  ├── id, company_id, recipient_id
  ├── alert_type, severity (P0/P1/P2)
  ├── title, content, is_read
  ├── created_at, read_at

TeamDocument (团队文档)
  ├── id, doc_id, shared_by, team_id
  ├── shared_at, permission (view/comment/edit)

ResearchTemplate (研究模板)
  ├── id, name, type, description
  ├── sections (JSON: steps[])
  ├── is_system_default, created_by
  ├── created_at, updated_at

AuditLog (审计日志)
  ├── id, user_id, action, object_type, object_id
  ├── details (JSON), ip_address, created_at

DataSource (数据源)
  ├── id, name, type, config (JSON)
  ├── status, last_sync_at, sync_frequency
  ├── created_at, updated_at

NotificationSetting (通知设置)
  ├── id, user_id, channel (in_app/email/sms/wechat)
  ├── alert_level, enabled, quiet_hours_start, quiet_hours_end
```

### 2.2 枚举类型

```python
UserRole = "researcher" | "pm" | "leader" | "admin"
TaskStatus = "pending" | "in_progress" | "under_review" | "completed" | "cancelled"
TaskPriority = "P0" | "P1" | "P2"
AlertSeverity = "P0" | "P1" | "P2"
Stance = "bullish" | "neutral" | "cautious" | "bearish"
DocType = "research_report" | "announcement" | "annual_report" | "transcript" | "other"
TemplateType = "deep_research" | "earnings_review" | "event_review" | "peer_comparison" | "transcript_summary"
QuestionStatus = "open" | "answered" | "closed"
ConclusionStatus = "draft" | "published" | "archived"
DataSourceStatus = "active" | "syncing" | "error" | "disabled"
```

---

## 3. API 设计

### 3.1 认证模块 `/api/v1/auth`
- `POST /login` - 用户登录
- `POST /logout` - 用户登出
- `GET /me` - 获取当前用户信息
- `POST /refresh` - 刷新 Token

### 3.2 用户模块 `/api/v1/users`
- `GET /` - 用户列表 (admin)
- `GET /:id` - 用户详情
- `POST /` - 创建用户 (admin)
- `PUT /:id` - 更新用户
- `DELETE /:id` - 删除用户 (admin)
- `PUT /:id/role` - 修改角色 (admin)
- `GET /:id/activities` - 用户活动记录

### 3.3 公司模块 `/api/v1/companies`
- `GET /` - 公司列表 (支持搜索、筛选)
- `GET /:id` - 公司详情
- `POST /` - 创建公司
- `PUT /:id` - 更新公司
- `GET /:id/documents` - 公司文档列表
- `GET /:id/conclusions` - 公司结论卡列表
- `GET /:id/questions` - 公司问题列表
- `GET /:id/timeline` - 公司研究时间线

### 3.4 持仓模块 `/api/v1/portfolios`
- `GET /` - 我的持仓列表 (PM)
- `POST /` - 添加持仓
- `PUT /:id` - 更新持仓
- `DELETE /:id` - 删除持仓
- `GET /:id/impact` - 持仓影响评估
- `GET /watchlist` - 观察池列表
- `POST /watchlist` - 添加到观察池
- `DELETE /watchlist/:id` - 从观察池移除

### 3.5 文档模块 `/api/v1/documents`
- `GET /` - 文档列表 (支持分页、搜索)
- `GET /:id` - 文档详情
- `POST /` - 上传文档
- `PUT /:id` - 更新文档
- `DELETE /:id` - 删除文档
- `GET /:id/download` - 下载文档
- `POST /:id/analyze` - AI 分析文档
- `GET /company/:company_id` - 获取公司文档

### 3.6 研究任务模块 `/api/v1/tasks`
- `GET /` - 任务列表
- `GET /:id` - 任务详情
- `POST /` - 创建任务
- `PUT /:id` - 更新任务
- `PUT /:id/status` - 更新任务状态
- `PUT /:id/progress` - 更新任务进度
- `POST /:id/submit-review` - 提交审核
- `POST /:id/approve` - 审核通过
- `POST /:id/reject` - 审核拒绝

### 3.7 结论卡模块 `/api/v1/conclusions`
- `GET /` - 结论卡列表
- `GET /:id` - 结论卡详情
- `POST /` - 创建结论卡
- `PUT /:id` - 更新结论卡
- `POST /:id/publish` - 发布结论卡
- `POST /:id/archive` - 归档结论卡
- `GET /company/:company_id` - 公司结论卡

### 3.8 问题模块 `/api/v1/questions`
- `GET /` - 问题列表
- `GET /:id` - 问题详情
- `POST /` - 创建问题
- `POST /:id/answer` - 回复问题
- `PUT /:id/close` - 关闭问题
- `GET /my` - 我的问题 (按角色过滤)
- `GET /unanswered` - 待回复问题 (研究员)

### 3.9 预警模块 `/api/v1/alerts`
- `GET /` - 预警列表
- `GET /unread` - 未读预警
- `PUT /:id/read` - 标记已读
- `PUT /read-all` - 全部已读
- `GET /my` - 我的预警

### 3.10 模板模块 `/api/v1/templates`
- `GET /` - 模板列表
- `GET /:id` - 模板详情
- `POST /` - 创建模板 (admin/leader)
- `PUT /:id` - 更新模板
- `DELETE /:id` - 删除模板

### 3.11 管理模块 `/api/v1/admin`
- `GET /stats/overview` - 平台概览统计
- `GET /stats/team` - 团队统计 (leader)
- `GET /stats/coverage` - 覆盖统计
- `GET /audit-logs` - 审计日志
- `GET /data-sources` - 数据源列表
- `POST /data-sources` - 添加数据源
- `PUT /data-sources/:id` - 更新数据源
- `GET /notification-settings` - 通知设置
- `PUT /notification-settings` - 更新通知设置

### 3.12 搜索模块 `/api/v1/search`
- `GET /` - 全局搜索 (公司/文档/结论卡/问题)
- `GET /documents` - 文档语义搜索
- `GET /conclusions` - 结论卡搜索

---

## 4. 前端页面结构

### 4.1 路由结构

```
/login                           # 登录页 (公开)

# 研究员路由 (/researcher/*)
  /researcher/home               # 首页工作台
  /researcher/company/:id       # 公司研究页
  /researcher/document/:id       # 文档阅读页
  /researcher/peer-compare       # 同行对比页
  /researcher/conclusion/:id     # 结论卡页
  /researcher/qa                 # 问题处理页
  /researcher/notifications       # 推送通知中心
  /researcher/templates           # 模板/工作流页

# 基金经理路由 (/fm/*)
  /fm/dashboard                  # 决策驾驶舱
  /fm/portfolio                  # 持仓/观察池
  /fm/stock/:id                  # 标的详情页
  /fm/summary/:id                # 摘要卡页
  /fm/questions                  # 问题追踪页
  /fm/decision-pack              # 决策前资料包
  /fm/impact                     # 组合影响评估
  /fm/scenario                   # 情景推演页
  /fm/notifications              # 推送通知中心

# 研究所领导路由 (/leader/*)
  /leader/dashboard              # 团队效率看板
  /leader/task-progress          # 任务进度详情
  /leader/coverage               # 研究覆盖情况
  /leader/response               # 响应效率分析
  /leader/collab-network         # 协作网络分析
  /leader/knowledge-heatmap      # 知识覆盖热力图
  /leader/best-practice          # 最佳实践管理
  /leader/questions              # 团队问题管理
  /leader/documents              # 团队文档库

# 系统管理员路由 (/admin/*)
  /admin/users                   # 用户权限管理
  /admin/data-sources            # 数据源管理
  /admin/push-rules              # 推送规则配置
  /admin/templates               # 模板管理
  /admin/audit-logs              # 审计日志
```

### 4.2 组件结构

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # 主布局 (侧边栏+顶部导航)
│   │   ├── Sidebar.tsx          # 侧边栏
│   │   ├── TopNav.tsx           # 顶部导航
│   │   └── PageHeader.tsx       # 页面标题栏
│   ├── common/
│   │   ├── DataTable.tsx        # 通用数据表格
│   │   ├── SearchBar.tsx        # 搜索栏
│   │   ├── FilterTabs.tsx       # 筛选标签
│   │   ├── StatCard.tsx         # 统计卡片
│   │   ├── Timeline.tsx         # 时间线
│   │   ├── KanbanBoard.tsx      # 看板
│   │   ├── HeatMap.tsx          # 热力图
│   │   ├── StarRating.tsx       # 星级评分
│   │   └── ConfidenceBadge.tsx  # 置信度徽章
│   ├── forms/
│   │   ├── TaskForm.tsx         # 任务表单
│   │   ├── QuestionForm.tsx     # 问题表单
│   │   ├── ConclusionForm.tsx  # 结论卡表单
│   │   └── DocumentUpload.tsx  # 文档上传
│   └── charts/
│       ├── BarChart.tsx         # 柱状图
│       ├── LineChart.tsx        # 折线图
│       ├── DonutChart.tsx       # 环形图
│       └── NetworkGraph.tsx      # 网络关系图
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── researcher/
│   │   ├── ResearcherHome.tsx
│   │   ├── CompanyResearch.tsx
│   │   ├── DocumentReading.tsx
│   │   ├── PeerCompare.tsx
│   │   ├── ConclusionCard.tsx
│   │   ├── QAPage.tsx
│   │   ├── Notifications.tsx
│   │   └── Templates.tsx
│   ├── fm/
│   │   ├── FMDashboard.tsx
│   │   ├── Portfolio.tsx
│   │   ├── StockDetail.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── QuestionTrack.tsx
│   │   ├── DecisionPack.tsx
│   │   ├── ImpactAssess.tsx
│   │   ├── Scenario.tsx
│   │   └── Notifications.tsx
│   ├── leader/
│   │   ├── LeaderDashboard.tsx
│   │   ├── TaskProgress.tsx
│   │   ├── Coverage.tsx
│   │   ├── ResponseEfficiency.tsx
│   │   ├── CollabNetwork.tsx
│   │   ├── KnowledgeHeatmap.tsx
│   │   ├── BestPractice.tsx
│   │   ├── Questions.tsx
│   │   └── Documents.tsx
│   └── admin/
│       ├── UserManagement.tsx
│       ├── DataSources.tsx
│       ├── PushRules.tsx
│       ├── TemplateMgmt.tsx
│       └── AuditLogs.tsx
├── hooks/
│   ├── useAuth.ts               # 认证状态
│   ├── usePermissions.ts        # 权限检查
│   ├── useCompany.ts            # 公司数据
│   ├── useDocuments.ts          # 文档数据
│   └── useTasks.ts              # 任务数据
├── stores/
│   ├── authStore.ts             # 认证状态
│   ├── notificationStore.ts     # 通知状态
│   └── uiStore.ts               # UI 状态
├── services/
│   ├── api.ts                   # API 客户端
│   ├── authService.ts
│   ├── companyService.ts
│   ├── documentService.ts
│   └── ...
└── types/
    └── index.ts                 # 类型定义
```

---

## 5. 页面详细说明

### 5.1 研究员页面

#### 5.1.1 首页工作台 (`/researcher/home`)
**组件布局：**
- 顶部：问候语 + 统计数据（今日待办数、覆盖池数、新增变化数）
- 快捷操作区：新建研究、财报点评、事件点评、同行对比
- 左侧卡片：今日待办列表（按优先级 P0/P1/P2 排序，支持筛选）
- 右侧卡片：覆盖池概览（公司卡片网格，显示评级、标签、新增资料数）
- 底部：最近活动时间线

#### 5.1.2 公司研究页 (`/researcher/company/:id`)
**组件布局：**
- 顶部：公司信息栏（Logo、名称、评级、行业、市值、研究员）
- Tab 栏：研究资料 | 结论卡 | 问题 | 同行对比 | 时间线
- 研究资料 Tab：文档列表（筛选类型：研报/公告/年报/纪要），支持上传
- 结论卡 Tab：结论卡列表，显示最新结论
- 问题 Tab：针对该公司的提问列表
- 同行对比 Tab：选择同行公司，进行多维对比
- 时间线 Tab：公司重要事件时间轴

#### 5.1.3 文档阅读页 (`/researcher/document/:id`)
**组件布局：**
- 左侧：文档信息栏（标题、类型、上传者、日期、标签）
- 中间：文档预览区（PDF/HTML 预览或文本内容）
- 右侧：AI 分析结果、相关结论卡、相关问题

#### 5.1.4 同行对比页 (`/researcher/peer-compare`)
**组件布局：**
- 顶部：公司选择器（选择主公司和 2-4 个同行）
- 左侧：指标分类选择（财务、估值、运营、市场）
- 中间：对比矩阵表格（高亮最优/最差单元格）
- 右侧：雷达图可视化

#### 5.1.5 结论卡页 (`/researcher/conclusion/:id`)
**组件布局：**
- 顶部：结论卡基本信息（公司、作者、状态、发布时间）
- 主体：3-3-2-1 结构
  - 3 个核心结论（带证据引用）
  - 3 个关键变化
  - 2 个风险点
  - 1 个建议关注问题
- 底部：置信度指示器、相关文档链接

#### 5.1.6 问题处理页 (`/researcher/qa`)
**组件布局：**
- 顶部：筛选栏（状态：待回复/已回复/全部）
- 主体：问题列表（卡片形式）
  - 问题标题、内容、提问者、关联公司
  - 回答输入框（已回复状态显示回答内容）
  - 状态标签

#### 5.1.7 推送通知中心 (`/researcher/notifications`)
**组件布局：**
- 顶部：筛选栏（全部/紧急/重要/常规）+ 搜索
- 主体：通知列表（按时间倒序，支持标记已读

#### 5.1.8 模板/工作流页 (`/researcher/templates`)
**组件布局：**
- 顶部：模板卡片网格（选择模板类型）
- 下方：当前工作流进度（步骤条形式）

### 5.2 基金经理页面

#### 5.2.1 决策驾驶舱 (`/fm/dashboard`)
**组件布局：**
- 顶部：问候语 + 统计卡片（持仓数、今日重点变化数、待答复数、研究覆盖率）
- 模式切换：日常模式 / 财报季模式
- 左侧：今日重点变化列表（按优先级，显示持仓比例和摘要入口）
- 右侧：问题追踪状态（待答复/已答复/已关闭 统计）

#### 5.2.2 持仓/观察池 (`/fm/portfolio`)
**组件布局：**
- Tab 切换：持仓标的 | 观察池
- 持仓标的：卡片网格，显示持仓比例、评级，支持跳转详情
- 观察池：卡片列表，显示添加原因、优先级

#### 5.2.3 标的详情页 (`/fm/stock/:id`)
**组件布局：**
- 顶部：公司信息 + 评级 + 发起提问按钮
- 左侧：研究流时间线
- 右侧：风险变化面板（库存风险、政策风险等）

#### 5.2.4 摘要卡页 (`/fm/summary/:id`)
**组件布局：**
- 顶部：公司信息 + 评级 + 更新时间
- 主体：3-3-2-1 结构化摘要
  - 3 个核心结论（带查看证据按钮）
  - 3 个关键变化
  - 2 个风险点
  - 1 个建议关注问题（带发起提问按钮）

#### 5.2.5 问题追踪页 (`/fm/questions`)
**组件布局：**
- 顶部：新建问题按钮
- 主体：看板视图（三列：待答复/已答复/已关闭）
- 卡片显示问题摘要、提问研究员、时间

#### 5.2.6 决策前资料包 (`/fm/decision-pack`)
**组件布局：**
- 顶部：标的selector
- Tab：财报 | 公告 | 结论卡 | 同行对比
- 文档列表（checkboxes）支持全选
- 导出 PDF 按钮

#### 5.2.7 组合影响评估 (`/fm/impact`)
**组件布局：**
- 顶部：事件selector
- 热力图：显示各持仓公司受影响程度
- 影响程度从高到低用颜色区分

#### 5.2.8 情景推演页 (`/fm/scenario`)
**组件布局：**
- 左侧：情景参数配置（滑块控制：原材料成本、需求变化等）
- 右侧：推演结果表格（影响程度、预期变化）
- 运行推演按钮

### 5.3 研究所领导页面

#### 5.3.1 团队效率看板 (`/leader/dashboard`)
**组件布局：**
- 时间范围选择：本周/本月/本季度
- 统计卡片：任务完成率（环形图）、本周产出、平均响应时间、研究覆盖率
- 左侧：产出趋势柱状图
- 右侧：响应效率趋势折线图

#### 5.3.2 任务进度详情 (`/leader/task-progress`)
**组件布局：**
- 表格视图：任务名称、负责人、状态、进度条、截止日期
- 支持按状态筛选

#### 5.3.3 研究覆盖情况 (`/leader/coverage`)
**组件布局：**
- 行业覆盖柱状图
- 各行业覆盖深度统计

#### 5.3.4 响应效率分析 (`/leader/response`)
**组件布局：**
- P0/P1/P2 平均响应时间统计卡片
- 事件到点评时长趋势折线图（含目标线）

#### 5.3.5 协作网络分析 (`/leader/collab-network`)
**组件布局：**
- 网络关系图（节点 = 研究员，边 = 协作强度）
- 节点大小 = 互动频次

#### 5.3.6 知识覆盖热力图 (`/leader/knowledge-heatmap`)
**组件布局：**
- 行：行业（消费/新能源/医药/科技等）
- 列：知识维度（财务分析/竞争格局/管理层/行业趋势/估值）
- 单元格颜色 = 覆盖密度（深蓝 = 高，浅蓝 = 低）

#### 5.3.7 最佳实践管理 (`/leader/best-practice`)
**组件布局：**
- 精选案例卡片网格（带星级评分）
- 案例详情弹窗

#### 5.3.8 团队文档库 (`/leader/documents`)
**组件布局：**
- 团队共享文档列表
- 权限管理

### 5.4 系统管理员页面

#### 5.4.1 用户权限管理 (`/admin/users`)
**组件布局：**
- 用户列表表格
- 邀请用户按钮
- 权限矩阵表格

#### 5.4.2 数据源管理 (`/admin/data-sources`)
**组件布局：**
- 数据源列表表格（名称、类型、状态、最后同步时间）
- 新增数据源按钮
- 同步按钮

#### 5.4.3 推送规则配置 (`/admin/push-rules`)
**组件布局：**
- P0/P1/P2 三列卡片
- 每个卡片显示推送渠道、响应时限、适用事件类型

#### 5.4.4 模板管理 (`/admin/templates`)
**组件布局：**
- 模板列表表格
- 新建模板按钮

#### 5.4.5 审计日志 (`/admin/audit-logs`)
**组件布局：**
- 筛选栏（全部/登录/数据操作/权限变更）
- 日志表格（时间、用户、操作、对象、结果）

---

## 6. 环境变量

### 6.1 后端 `.env`
```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/research_platform
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000
OSS_ACCESS_KEY=xxx
OSS_SECRET_KEY=xxx
OSS_BUCKET=research-docs
LLM_API_KEY=xxx
LLM_BASE_URL=https://api.openai.com/v1
```

### 6.2 前端 `.env`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=投研协作平台
```

---

## 7. 部署架构

```
                    Nginx (80/443)
                        │
           ┌────────────┴────────────┐
           │                         │
      Frontend (Next.js)       Backend (FastAPI)
      localhost:3000           localhost:8000
           │                         │
           │                   ┌─────┴─────┐
           │                   │           │
     ┌─────┴─────┐        PostgreSQL    Redis
     │           │           5432        6379
 Static Files  API Proxy
```

---

## 8. 开发规范

### 8.1 Git 分支管理
- `main` - 主分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支
- `refactor/*` - 重构分支

### 8.2 代码规范
- 前端：ESLint + Prettier
- 后端：Black + Ruff (Python)
- 提交信息：Conventional Commits

### 8.3 API 规范
- RESTful 风格
- 版本号：`/api/v1/`
- 统一响应格式：`{ code, message, data }`
- 分页格式：`{ items, total, page, page_size }`
