# 投研协作平台 (Research Collaboration Copilot Platform)

> 面向基金公司研究所的智能投研协作平台，支持研究员、基金经理、研究所领导、系统管理员四种角色，实现研究文档管理、公司跟踪、问题协作、结论卡片、持仓管理等核心功能。

---

## 1. OpenClaw 多 Agent 协同框架（核心亮点）

### 1.1 为什么引入 OpenClaw？

传统投研平台存在以下痛点：

- **信息孤岛** - 研究报告、公告、财务数据分散在不同系统和文档中，难以统一分析和关联
- **人工效率低** - 研究员需要花费大量时间阅读长文档、提取关键数据、对比同行
- **协同困难** - 跨公司、跨行业的研究需要协调多个团队，信息传递效率低
- **洞察浅薄** - 单点分析无法揭示深层关联和趋势

**OpenClaw 多 Agent 协同框架**通过自主分解任务、并行执行、智能汇总，彻底解决上述问题。

### 1.2 OpenClaw 是什么？

OpenClaw 是一个**多 Agent 协同编排框架**，允许定义多个专业 Agent（智能体），每个 Agent 专注于特定任务，通过** Supervisor（编排器）**自动分解复杂请求，协调多个 Agent 并行或串行执行，最终由 **Synthesizer（汇总器）** 生成统一报告。

### 1.3 核心价值

| 价值点 | 说明 |
|--------|------|
| **任务自动分解** | 用户只需输入自然语言请求，Supervisor 自动识别意图并分解为可执行的子任务 |
| **并行加速执行** | 独立的子任务并行执行，充分利用计算资源，大幅缩短分析时间 |
| **专业分工** | 每个 Agent 专注单一领域：文档分析、事件分级、同行对比、问答等 |
| **智能汇总** | Synthesizer 自动整合多 Agent 结果，去重、补充、生成结构化报告 |
| **可扩展架构** | 支持自定义 Agent 类型和协同流程，便于扩展新的业务场景 |

### 1.4 Agent 类型详解

| Agent | 名称 | 系统提示词概要 | 能力边界 |
|-------|------|--------------|----------|
| **SupervisorAgent** | 任务编排 Agent | "你是一个任务编排专家，负责分析用户请求并制定执行计划" | 分析意图、分解任务、制定计划、协调执行、处理异常 |
| **DocumentAnalysisAgent** | 文档分析 Agent | "你是一个资深证券分析师，专注于解读财报、公告、纪要" | 提取关键数据、理解业务逻辑、评估公司基本面 |
| **CopilotAgent** | 研报问答 Agent | "你是一个投研 Copilot，基于文档知识库回答研究问题" | RAG 检索、生成回答、提供依据 |
| **PeerComparisonAgent** | 同行对比 Agent | "你是一个行业比较专家，擅长对比分析多家公司" | 指标对比、差异分析、趋势判断 |
| **AlertClassificationAgent** | 事件分级 Agent | "你是一个风控专家，负责评估事件对公司影响程度" | 事件分级（P0/P1/P2）、影响评估、预警生成 |
| **ResultSynthesizerAgent** | 结果汇总 Agent | "你是一个研究报告主编，负责整合多方分析生成综合报告" | 结果整合、去重补全、结构化输出 |

### 1.5 协同流程详解

```
┌─────────────────────────────────────────────────────────────────┐
│                      用户请求（自然语言）                          │
│  「分析宁德时代的最新财报和行业动态，给出投资建议」                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supervisor Agent                             │
│  ─────────────────────────────────────────────────────────────  │
│  意图识别：「请求综合研报生成，需要多维度分析」                      │
│                                                                 │
│  任务分解：                                                      │
│    1. document_analysis - 分析财报关键指标                       │
│    2. document_analysis - 分析行业动态和竞争格局                   │
│    3. alert_classification - 评估重大事件影响                      │
│    4. peer_comparison - 对比比亚迪、亿纬锂能等同行                   │
│                                                                 │
│  执行计划：                                                      │
│    - 步骤1,2,3 可并行执行                                         │
│    - 步骤4 依赖步骤1,2 的结果                                     │
│    - 步骤5（汇总）依赖所有步骤完成                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Document      │   │ Alert         │   │ Document      │
│ Analysis      │   │ Classification│   │ Analysis      │
│ Agent         │   │ Agent         │   │ Agent         │
│ (财报分析)     │   │ (事件分级)     │   │ (行业分析)     │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                     │                     │
        │    ┌────────────────┘                     │
        │    │                                      │
        ▼    ▼                                      ▼
┌───────────────────────────────────────────────────────────────┐
│                    Peer Comparison Agent                       │
│              (同行对比：宁德 vs 比亚迪 vs 亿纬)                   │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Result Synthesizer Agent                       │
│  ─────────────────────────────────────────────────────────────  │
│  1. 整合各 Agent 结果                                            │
│  2. 去重、补充信息                                               │
│  3. 生成结构化报告：                                              │
│     - 核心结论（增持/中性/减持）                                  │
│     - 关键数据汇总表                                              │
│     - 同行对比分析                                                │
│     - 风险点提示                                                  │
│     - 投资建议                                                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       最终报告输出                                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 API 端点

| 方法 | 路径 | 说明 | 协同 Agent |
|------|------|------|-----------|
| POST | `/api/v1/multi-agent/comprehensive-research` | 综合研报生成 | Supervisor → Doc/Alert/Peer → Synthesizer |
| POST | `/api/v1/multi-agent/event-analysis` | 事件分析 | Supervisor → Alert → Doc → Synthesizer |
| POST | `/api/v1/multi-agent/peer-comparison` | 同行对比 | Supervisor → Peer → Doc(辅助) → Synthesizer |
| POST | `/api/v1/multi-agent/research-qa` | 增强版问答 | RAG检索 → Copilot → Alert(检查预警) |
| GET | `/api/v1/multi-agent/orchestrate` | 通用任务编排 | Supervisor 自动分解并协调 |

### 1.7 协同场景示例

**场景一：综合研报生成**
```
输入：「分析宁德时代 2024 年年报和一季度财报，给出投资建议」

执行流程：
1. Supervisor 识别为「综合研报」类型
2. 并行执行：
   - DocumentAnalysisAgent 分析 2024 年报关键指标（营收、净利润、毛利率）
   - DocumentAnalysisAgent 分析一季度财报（环比变化、产能利用率）
   - AlertClassificationAgent 评估「毛利率回升」「储能爆发」等事件影响
   - PeerComparisonAgent 对比比亚迪、亿纬锂能的各项指标
3. Synthesizer 汇总生成包含「增持」建议的综合报告

输出示例：
{
  "conclusion": "增持",
  "target_price": "320元",
  "upside": "18%",
  "key_points": [...],
  "peer_comparison": {...},
  "risks": [...]
}
```

**场景二：突发事件分析**
```
输入：「某光伏企业被美国列入实体清单，分析影响」

执行流程：
1. AlertClassificationAgent 判定为 P0 级别（紧急）
2. DocumentAnalysisAgent 分析：
   - 该公司对美国市场的依赖程度
   - 供应链影响（原材料、设备）
   - 其他中国光伏企业可能受影响的程度
3. Synthesizer 生成影响评估报告

输出：包含「短期利空」「长期加速国产化替代」等结论
```

**场景三：同行对比分析**
```
输入：「对比宁德时代和比亚迪的电池业务竞争力」

执行流程：
1. PeerComparisonAgent 获取两家公司的财务数据
2. DocumentAnalysisAgent 辅助分析技术路线差异
3. Synthesizer 生成对比报告

输出：多维度对比表（产能、技术、市场份额、成本、利润率等）
```

### 1.8 技术实现

**Agent 框架核心组件：**

```python
# Agent 基类定义
class BaseAgent(ABC):
    name: str                           # Agent 名称
    system_prompt: str                  # 系统提示词
    capabilities: List[str]            # 能力列表
    output_schema: Type[BaseModel]     # 输出格式

    async def execute(self, context: dict) -> AgentResult:
        """执行任务的核心方法"""
        pass

# 编排器核心逻辑
class AgentOrchestrator:
    async def orchestrate(self, request: str, context: dict):
        # 1. Supervisor 分析请求
        plan = await self.supervisor.analyze(request, context)

        # 2. 构建依赖图
        dag = self.build_dag(plan.sub_tasks)

        # 3. 并行/串行执行
        results = await self.execute_dag(dag)

        # 4. Synthesizer 汇总
        final_report = await self.synthesizer.summarize(results)

        return OrchestrationResult(
            task_id=plan.task_id,
            success=True,
            final_result=final_report,
            sub_tasks=results
        )
```

**文件结构：**

```
backend/app/
├── agents/
│   ├── __init__.py              # Agent 框架核心
│   ├── base.py                  # BaseAgent 基类
│   ├── supervisor.py            # SupervisorAgent
│   ├── document_agent.py        # DocumentAnalysisAgent
│   ├── copilot_agent.py         # CopilotAgent
│   ├── peer_agent.py            # PeerComparisonAgent
│   ├── alert_agent.py           # AlertClassificationAgent
│   ├── synthesizer.py           # ResultSynthesizerAgent
│   └── orchestrator.py          # AgentOrchestrator
├── services/
│   ├── multi_agent_service.py   # 多 Agent 协同服务
│   └── copilot_service.py       # Copilot 问答服务
└── api/
    └── copilot_and_dashboard.py # 多 Agent API 路由
```

---

## 2. 项目背景与目标

### 2.1 项目背景

证券/基金行业的研究所是机构投资的核心智囊团，每天需要处理海量的研究报告、公告、年报、纪要等文档。传统的研究管理方式存在以下痛点：

- **信息分散** - 文档存储在邮件、共享盘、微信等多个渠道，难以统一管理
- **协作低效** - 研究员与基金经理之间的信息传递依赖会议和邮件，响应慢
- **知识流失** - 研究结论散落在个人笔记中，新人难以快速上手
- **覆盖不清** - 领导难以全面掌握团队的研究覆盖情况和产出效率

### 2.2 项目目标

投研协作平台旨在建立一个**统一的研究工作台**，实现：

- **文档集中管理** - 统一存储和检索研报、公告、年报等各类文档
- **结构化研究结论** - 通过结论卡片将研究观点结构化，便于积累和传承
- **高效协作闭环** - 打通研究员、基金经理、领导之间的信息流转
- **数据驱动管理** - 通过统计看板让管理层实时掌握团队效能
- **AI 驱动的洞察** - 通过 OpenClaw 多 Agent 协同，自动分析文档、对比同行、生成报告

---

## 3. 系统角色与权限

本系统支持四种角色，每种角色有独立的的工作台和功能模块：

| 角色 | 标识 | 核心职责 | 数量假设 |
|------|------|----------|----------|
| **研究员** | `researcher` | 日常研究、文档阅读与分析、结论卡撰写、任务执行 | 10-20人 |
| **基金经理** | `pm` | 投资决策、研究需求发起、持仓管理、关注公司动态 | 3-5人 |
| **研究所领导** | `leader` | 团队管理、任务分配、效率监控、研究质量把控 | 2-3人 |
| **系统管理员** | `admin` | 用户权限管理、系统配置、审计合规 | 1-2人 |

### 3.1 权限矩阵

| 功能模块 | 研究员 | 基金经理 | 研究所领导 | 系统管理员 |
|----------|:------:|:--------:|:----------:|:----------:|
| **首页工作台** | ✓ | ✓ | ✓ | ✓ |
| **文档库** | 查看/上传 | 查看 | 查看 | 管理 |
| **研究任务** | 执行/更新 | 发起需求 | 分配/审核 | 查看 |
| **研报结论** | 创建/编辑 | 查看/收藏 | 审核/归档 | 管理 |
| **持仓管理** | - | 完整权限 | 查看 | - |
| **观察池** | - | 完整权限 | 查看 | - |
| **问答协作** | 回复 | 发起/查看 | 发起/查看 | 查看 |
| **预警推送** | 我的预警 | 我的预警 | 全量预警 | 配置规则 |
| **团队管理** | - | - | 完整权限 | - |
| **用户管理** | - | - | - | 完整权限 |
| **审计日志** | - | - | - | 完整权限 |
| **系统设置** | - | - | - | 完整权限 |
| **数据源** | - | - | 配置 | 管理 |
| **AI Copilot** | ✓ | ✓ | ✓ | ✓ |
| **多 Agent 协同** | ✓ | ✓ | ✓ | ✓ |

---

## 4. 核心功能详解

### 4.1 研究员模块

研究员是平台的主要内容生产者，其工作台围绕「任务执行」和「研究积累」两大主线展开。

#### 4.1.1 工作台 (`/researcher`)

**统计卡片区：**
- 待完成任务数（今日截止 + 未来7天）
- 覆盖公司数
- 今日变化数（新文档/新预警）
- 新预警数

**待办任务列表：**
```
优先级 | 任务名称 | 关联公司 | 截止日期 | 状态
P0     | 完成宁德时代深度报告 | 宁德时代 | 2026-03-25 | 进行中
P1     | 跟进光伏政策变化 | 隆基绿能 | 2026-03-22 | 待处理
```

**关注公司动态：**
- 展示关注池中的公司
- 每家公司显示：最新评级、标签、新增文档数（Badge 提示）
- 点击跳转公司详情页

**最新预警：**
- 按严重程度 P0/P1/P2 分类展示
- 每条预警显示：标题、内容摘要、关联公司、发生时间
- 支持快速跳转相关公司或文档

#### 4.1.2 文档库 (`/researcher/documents`)

**文档类型分类：**
- 研报（深度研究、事件点评、财报点评）
- 公告（临时公告、定期报告）
- 年报/半年报
- 业绩说明会纪要
- 其他资料

**文档列表功能：**
- 支持按公司、类型、日期范围筛选
- 搜索：标题、内容关键词
- 上传：支持 PDF、Word、Excel
- 文档详情：预览、下载、AI 分析结果

#### 4.1.3 研究任务 (`/researcher/tasks`)

**任务状态流转：**
```
待接收 → 进行中 → 等待审核 → 已完成
              ↘ 审核拒绝 → 进行中
              ↘ 已取消
```

**任务详情页：**
- 任务基本信息（标题、描述、优先级、截止日期）
- 任务模板（可选，定义任务步骤）
- 进度跟踪（各步骤完成情况）
- 审核意见（领导反馈）

**研究员操作：**
- 更新任务状态
- 填写/更新任务进度
- 提交审核
- 查看审核历史

#### 4.1.4 研报结论 (`/researcher/conclusions`)

**结论卡结构（3-3-2-1 框架）：**
```
┌─────────────────────────────────────────┐
│ 公司：宁德时代        作者：张三          │
│ 评级：增持    目标价：300元   上浮：25%   │
│ 置信度：★★★★☆                        │
├─────────────────────────────────────────┤
│ 核心结论（3条）                          │
│ 1. 动力电池全球市占率提升至37%...         │
│ 2. 成本优势持续扩大...                   │
│ 3. 储能业务爆发式增长...                 │
├─────────────────────────────────────────┤
│ 关键变化（3条）                          │
│ 1. 原材料价格回落毛利率回升...            │
│ 2. 海外工厂投产进度超预期...              │
│ 3. 新一代麒麟电池量产...                  │
├─────────────────────────────────────────┤
│ 风险点（2条）                            │
│ 1. 行业竞争加剧价格战风险...              │
│ 2. 政策补贴退坡影响...                    │
├─────────────────────────────────────────┤
│ 建议关注（1条）                          │
│ 1. 二季度排产数据是否持续向好...           │
├─────────────────────────────────────────┤
│ 相关文档：3篇  相关预警：2条              │
│ 创建时间：2026-03-20  发布状态：已发布   │
└─────────────────────────────────────────┘
```

**操作权限：**
- 创建/编辑草稿
- 提交发布（状态变为：待审核）
- 保存/归档

#### 4.1.5 关注公司 (`/researcher/companies`)

**功能：**
- 添加/移除关注公司
- 按行业分类展示
- 查看公司基本信息：股票代码、交易所、行业、市值、研究员
- 快速跳转：公司文档、公司结论、公司问题

#### 4.1.6 问答协作 (`/researcher/questions`)

**问题类型：**
- 日常咨询
- 深度研究请求
- 数据核实

**研究员操作：**
- 查看待回复问题列表
- 回复问题
- 关闭已解决问题

#### 4.1.7 AI Copilot (`/researcher/copilot`)

**功能：**
- 基于 RAG 向量检索的智能问答
- 文档摘要生成
- 关键信息提取
- **多 Agent 协同**：综合研报生成、事件分析、同行对比

**使用示例：**
```
用户：「宁德时代的储能业务发展如何？」
Copilot：基于文档库检索，回答宁德时代储能业务的关键数据和市场地位

用户：「分析光伏行业政策变化的影响」（多 Agent 协同）
→ Supervisor 分解任务
→ AlertClassificationAgent 评估影响级别
→ DocumentAnalysisAgent 分析具体影响
→ Synthesizer 生成报告
```

#### 4.1.8 我的预警 (`/researcher/alerts`)

**预警级别：**
- P0（紧急）：需要立即关注，如重大政策变化、公司危机
- P1（重要）：需要当日处理，如季报超预期、行业突发新闻
- P2（一般）：可后续跟进，如小规模减持、新产品发布

**预警内容：**
- 预警标题
- 预警内容摘要
- 关联公司
- 严重程度
- 发生时间
- 已读/未读状态

---

### 4.2 基金经理模块

基金经理是研究服务的消费者，其工作台围绕「投资决策」和「信息聚合」展开。

#### 4.2.1 工作台 (`/fm`)

**统计卡片：**
- 持仓标的数
- 今日重点变化数
- 待答复问题数
- 研究覆盖率

**重点变化列表：**
```
严重程度 | 公司 | 变化摘要 | 持仓占比 | 操作
P1       | 宁德时代 | 季报超预期，净利润+45% | 8.5% | 查看详情
P2       | 隆基绿能 | 组件出口关税调整 | 3.2% | 查看详情
```

**问题追踪：**
- 待答复 / 已答复 / 已关闭 三栏看板
- 显示问题数统计

#### 4.2.2 持仓管理 (`/fm/portfolio`)

**Tab 切换：** 持仓标的 | 观察池

**持仓列表：**
```
公司 | 持仓占比 | 评级 | 成本价 | 当前价 | 盈亏 | 操作
宁德时代 | 8.5% | 增持 | 240 | 285 | +18.8% | 调整/卖出
隆基绿能 | 3.2% | 中性 | 45 | 42 | -6.7% | 调整/卖出
```

**操作：**
- 添加新持仓
- 调整持仓（修改占比）
- 卖出（移出持仓）

#### 4.2.3 观察池 (`/fm/watchlist`)

**功能：**
- 添加公司到观察池（填写添加原因、优先级）
- 设置优先级：P1/P2
- 原因记录：如「等待季报数据确认」
- 移入持仓：一键将观察池公司转为持仓

#### 4.2.4 AI 决策支持 (`/fm/copilot`)

**功能：**
- 持仓分析：基于持仓公司新闻和公告生成每日简报
- 预警解读：AI 分析预警内容并给出建议
- **多 Agent 协同**：综合研报生成、同行对比分析

**使用示例：**
```
用户：「生成我持仓公司的今日简报」（多 Agent 协同）
→ 获取持仓列表
→ 并行获取各公司最新公告和新闻
→ DocumentAnalysisAgent 分析每家公司的最新动态
→ Synthesizer 汇总生成简报
```

---

### 4.3 研究所领导模块

研究所领导关注团队效能和研究质量，核心是「任务分配」和「效率监控」。

#### 4.3.1 工作台 (`/leader`)

**统计卡片：**
- 任务完成率（本周/本月）
- 本周产出（文档数、结论卡数）
- 平均响应时间
- 研究覆盖率

**趋势图表：**
- 左侧：产出趋势柱状图（按周/月）
- 右侧：响应效率折线图

#### 4.3.2 任务管理 (`/leader/tasks`)

**任务分配：**
- 创建任务（选择执行人、设置优先级和截止日期）
- 关联公司
- 选择模板（可选）

**任务监控：**
```
任务名称 | 执行人 | 优先级 | 状态 | 进度 | 截止日期 | 操作
宁德时代深度报告 | 张三 | P0 | 进行中 | 60% | 2026-03-25 | 查看
光伏政策研究 | 李四 | P1 | 待接收 | 0% | 2026-03-22 | 催办
```

**审核操作：**
- 通过审核
- 拒绝并返回（填写意见）
- 重新分配

#### 4.3.3 团队管理 (`/leader/team`)

**研究员列表：**
- 显示所有研究员信息
- 当前任务数
- 工作负荷可视化

**团队协作视图：**
- 研究员之间的协作关系图
- 高频协作对突出显示

#### 4.3.4 产出统计 (`/leader/output`)

**统计维度：**
- 按人员：每人产出文档数、结论卡数
- 按公司：每家公司研究深度
- 按行业：行业覆盖情况

**导出功能：**
- 支持导出 Excel 报表

#### 4.3.5 AI 团队助手 (`/leader/copilot`)

**功能：**
- 团队产出分析：汇总全团队的研究成果
- **多 Agent 协同**：综合行业分析、跨公司对比

---

### 4.4 系统管理员模块

管理员负责系统运维和安全管理。

#### 4.4.1 工作台 (`/admin`)

**系统概览：**
- 用户总数
- 在线用户数
- 今日活跃度

#### 4.4.2 用户管理 (`/admin/users`)

**用户列表：**
```
用户名 | 姓名 | 角色 | 部门/团队 | 邮箱 | 状态 | 操作
zhangsan | 张三 | 研究员 | 科技组 | zhangsan@fund.com | 活跃 | 编辑/禁用
lisi    | 李四 | 研究员 | 周期组 | lisi@fund.com    | 活跃 | 编辑/禁用
```

**操作：**
- 添加用户
- 编辑用户信息
- 修改用户角色
- 禁用/启用用户

#### 4.4.3 审计日志 (`/admin/audit`)

**日志类型：**
- 登录/登出
- 文档操作（上传/下载/删除）
- 权限变更
- 配置变更

**日志字段：**
- 时间
- 用户
- 操作类型
- 操作对象
- IP 地址
- 结果

**筛选：**
- 按时间范围
- 按用户
- 按操作类型

#### 4.4.4 系统设置 (`/admin/settings`)

- 通知渠道配置（站内/邮件/SMS/微信）
- 预警规则配置
- 系统参数调整
- **Agent 配置**：配置各 Agent 的系统提示词和能力边界

---

## 5. 数据模型

### 5.1 核心实体

```
User (用户)
├── id, username, email, hashed_password, name, role
├── team, title, phone, avatar_url
├── created_at, updated_at, last_login_at, is_active

Company (公司)
├── id, name, ticker, exchange, industry, sector
├── market_cap, description, tags
├── created_at, updated_at

Portfolio (持仓)
├── id, pm_user_id, company_id
├── shares, weight, avg_cost, current_price
├── stance (bullish/neutral/cautious/bearish)
├── status, created_at, updated_at

Watchlist (观察池)
├── id, pm_user_id, company_id
├── reason, priority, status
├── created_at

Document (文档)
├── id, company_id, uploader_id, title
├── doc_type (research_report/announcement/annual_report/transcript/other)
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
├── stance, target_price, upside, core_logic
├── key_changes, risk_points, confidence
├── status (draft/published/archived)
├── published_at, created_at, updated_at

QuestionThread (问题)
├── id, company_id, asker_id, researcher_id
├── title, content, status (open/answered/closed)
├── priority, created_at, answered_at

QuestionAnswer (回答)
├── id, question_id, answerer_id
├── content, created_at

Alert (预警)
├── id, company_id, recipient_id
├── alert_type, severity (P0/P1/P2)
├── title, content, is_read
├── created_at, read_at

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

# 多 Agent 协同相关
AgentExecution (Agent 执行记录)
├── id, task_id, agent_type, agent_name
├── input_data, output_data, status
├── execution_time, error_message
├── created_at

Conversation (多 Agent 对话)
├── id, user_id, conversation_type
├── messages (JSON: role/content/timestamp[])
├── context (JSON)
├── created_at, updated_at
```

### 5.2 枚举类型

```python
UserRole = "researcher" | "pm" | "leader" | "admin"
TaskStatus = "pending" | "in_progress" | "under_review" | "completed" | "cancelled"
TaskPriority = "P0" | "P1" | "P2"
AlertSeverity = "P0" | "P1" | "P2"
Stance = "bullish" | "neutral" | "cautious" | "bearish"
DocType = "research_report" | "announcement" | "annual_report" | "transcript" | "other"
QuestionStatus = "open" | "answered" | "closed"
ConclusionStatus = "draft" | "published" | "archived"

# 多 Agent 协同
AgentType = "supervisor" | "document_analysis" | "copilot" | "peer_comparison" | "alert_classification" | "synthesizer"
AgentStatus = "pending" | "running" | "completed" | "failed"
ConversationType = "qa" | "research" | "event_analysis" | "peer_comparison"
```

---

## 6. API 设计

### 6.1 API 概览

所有 API 遵循 RESTful 规范，路径前缀 `/api/v1`，统一返回格式：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

分页响应格式：
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20
}
```

### 6.2 认证模块 `/api/v1/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/logout` | 用户登出 |
| GET | `/auth/me` | 获取当前用户信息 |
| POST | `/auth/refresh` | 刷新 Token |

### 6.3 公司模块 `/api/v1/companies`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/companies` | 公司列表（支持搜索、筛选） |
| GET | `/companies/:id` | 公司详情 |
| POST | `/companies` | 创建公司 |
| PUT | `/companies/:id` | 更新公司 |
| GET | `/companies/:id/documents` | 公司文档列表 |
| GET | `/companies/:id/conclusions` | 公司结论卡列表 |
| GET | `/companies/:id/questions` | 公司问题列表 |
| GET | `/companies/:id/timeline` | 公司研究时间线 |

### 6.4 持仓模块 `/api/v1/portfolios`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/portfolios` | 我的持仓列表 |
| POST | `/portfolios` | 添加持仓 |
| PUT | `/portfolios/:id` | 更新持仓 |
| DELETE | `/portfolios/:id` | 删除持仓 |
| GET | `/portfolios/watchlist` | 观察池列表 |
| POST | `/portfolios/watchlist` | 添加到观察池 |
| DELETE | `/portfolios/watchlist/:id` | 从观察池移除 |
| POST | `/portfolios/watchlist/:id/move-to-portfolio` | 观察池移入持仓 |

### 6.5 文档模块 `/api/v1/documents`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/documents` | 文档列表 |
| GET | `/documents/:id` | 文档详情 |
| POST | `/documents` | 上传文档 |
| PUT | `/documents/:id` | 更新文档 |
| DELETE | `/documents/:id` | 删除文档 |
| POST | `/documents/:id/analyze` | AI 分析文档 |
| GET | `/documents/company/:company_id` | 获取公司文档 |

### 6.6 研究任务模块 `/api/v1/tasks`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/tasks` | 任务列表 |
| GET | `/tasks/:id` | 任务详情 |
| POST | `/tasks` | 创建任务 |
| PUT | `/tasks/:id` | 更新任务 |
| PUT | `/tasks/:id/status` | 更新任务状态 |
| PUT | `/tasks/:id/progress` | 更新任务进度 |
| POST | `/tasks/:id/submit-review` | 提交审核 |
| POST | `/tasks/:id/approve` | 审核通过 |
| POST | `/tasks/:id/reject` | 审核拒绝 |

### 6.7 结论卡模块 `/api/v1/conclusions`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/conclusions` | 结论卡列表 |
| GET | `/conclusions/:id` | 结论卡详情 |
| POST | `/conclusions` | 创建结论卡 |
| PUT | `/conclusions/:id` | 更新结论卡 |
| POST | `/conclusions/:id/publish` | 发布结论卡 |
| POST | `/conclusions/:id/archive` | 归档结论卡 |
| GET | `/conclusions/company/:company_id` | 公司结论卡 |

### 6.8 预警模块 `/api/v1/alerts`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/alerts` | 预警列表 |
| GET | `/alerts/unread` | 未读预警 |
| PUT | `/alerts/:id/read` | 标记已读 |
| PUT | `/alerts/read-all` | 全部已读 |
| GET | `/alerts/my` | 我的预警 |

### 6.9 AI Copilot 模块 `/api/v1/copilot`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/copilot/chat` | 发送消息 |
| POST | `/copilot/rag-search` | RAG 向量检索 |
| POST | `/copilot/summarize` | 文档摘要 |
| GET | `/copilot/history` | 对话历史 |
| DELETE | `/copilot/history/:id` | 删除对话 |

### 6.10 多 Agent 协同模块 `/api/v1/multi-agent`

| 方法 | 路径 | 说明 | 协同 Agent |
|------|------|------|-----------|
| POST | `/multi-agent/comprehensive-research` | 综合研报生成 | Supervisor → Doc/Alert/Peer → Synthesizer |
| POST | `/multi-agent/event-analysis` | 事件分析 | Supervisor → Alert → Doc → Synthesizer |
| POST | `/multi-agent/peer-comparison` | 同行对比 | Supervisor → Peer → Doc(辅助) → Synthesizer |
| POST | `/multi-agent/research-qa` | 增强版问答 | RAG检索 → Copilot → Alert(检查预警) |
| GET | `/multi-agent/orchestrate` | 通用任务编排 | Supervisor 自动分解并协调 |
| GET | `/multi-agent/status/:task_id` | 查询执行状态 | - |
| GET | `/multi-agent/history` | 执行历史 | - |

---

## 7. 技术架构

### 7.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端框架** | React 18 + TypeScript | 类型安全 |
| **前端路由** | Next.js 14 App Router | 服务端渲染，SEO 友好 |
| **UI 组件** | TDesign | 腾讯企业级设计系统 |
| **状态管理** | Zustand | 轻量级状态管理 |
| **数据请求** | TanStack Query | 服务端状态管理，缓存 |
| **后端框架** | FastAPI | 高性能异步 API |
| **ORM** | SQLAlchemy 2.0 | 异步 ORM |
| **数据库** | PostgreSQL 16 + pgvector | 关系型 + 向量检索 |
| **缓存** | Redis 7 | 会话缓存，任务队列 |
| **认证** | JWT | 无状态认证 |
| **AI Agent** | **OpenClaw + Agent Orchestrator** | **多 Agent 协同编排（核心亮点）** |
| **部署** | Docker Compose + Nginx | 容器化部署 |

### 7.2 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户层 (Browser)                         │
│                   PC / Mobile / Tablet                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                      Next.js 前端应用                           │
│                   localhost:3000                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ 研究员工作台│  │PM决策驾驶舱│  │领导效率看板│  │管理员控制台│ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AI Copilot 工作台（多 Agent 协同）                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/REST + WebSocket
┌─────────────────────────────┴───────────────────────────────────┐
│                      Nginx 反向代理                              │
│                      80/443 端口                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                    FastAPI 后端服务                              │
│                   localhost:8000                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Middleware: Auth / CORS / Rate Limit / Logging / RBAC     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  API Routes                                               │ │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐          │ │
│  │  │ Auth    │ │ Companies│ │Documents│ │ Tasks    │          │ │
│  │  └─────────┘ └──────────┘ └─────────┘ └──────────┘          │ │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐          │ │
│  │  │Conclusions│ │Questions│ │ Alerts  │ │Admin     │          │ │
│  │  └─────────┘ └──────────┘ └─────────┘ └──────────┘          │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  AI Copilot Routes  │  Multi-Agent Routes          │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  Services Layer                                           │ │
│  │  ┌─────────────────────┐  ┌─────────────────────────────┐  │ │
│  │  │  CopilotService     │  │  MultiAgentService         │  │ │
│  │  │  - RAG 检索         │  │  - Agent Orchestration     │  │ │
│  │  │  - 问答生成         │  │  - Task Decomposition      │  │ │
│  │  └─────────────────────┘  └─────────────────────────────┘  │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  Agents Layer (OpenClaw)                                  │ │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐       │ │
│  │  │Supervisor│ │Document  │ │Copilot  │ │Peer      │       │ │
│  │  │Agent    │ │Analysis  │ │Agent    │ │Comparison│       │ │
│  │  └─────────┘ └──────────┘ └─────────┘ └──────────┘       │ │
│  │  ┌─────────┐ ┌──────────┐                               │ │
│  │  │Alert    │ │Synthesizer│                              │ │
│  │  │Class.   │ │Agent     │                               │ │
│  │  └─────────┘ └──────────┘                               │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  Database: SQLAlchemy 2.0 Async ORM                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌──────────┴───┐  ┌───────┴─────┐  ┌──────┴──────┐
    │ PostgreSQL   │  │   Redis     │  │  MinIO (S3) │
    │   5432       │  │   6379      │  │  文件存储    │
    │ + pgvector  │  │             │  │             │
    └──────────────┘  └─────────────┘  └─────────────┘
```

### 7.3 目录结构

```
investment-research-platform/
├── frontend/                         # Next.js 前端应用
│   ├── src/
│   │   ├── app/                     # App Router 页面
│   │   │   ├── login/               # 登录页
│   │   │   ├── researcher/          # 研究员路由组
│   │   │   │   ├── page.tsx         # 工作台
│   │   │   │   ├── documents/       # 文档库
│   │   │   │   ├── tasks/           # 研究任务
│   │   │   │   ├── conclusions/      # 研报结论
│   │   │   │   ├── companies/        # 关注公司
│   │   │   │   ├── questions/        # 问答协作
│   │   │   │   ├── alerts/           # 我的预警
│   │   │   │   └── copilot/          # AI Copilot
│   │   │   ├── fm/                  # 基金经理路由组
│   │   │   │   ├── page.tsx         # 工作台
│   │   │   │   ├── portfolio/        # 持仓管理
│   │   │   │   ├── watchlist/        # 观察池
│   │   │   │   └── copilot/          # AI Copilot
│   │   │   ├── leader/              # 研究所领导路由组
│   │   │   ├── admin/               # 系统管理员路由组
│   │   │   └── layout.tsx           # 根布局
│   │   ├── components/              # 组件
│   │   │   ├── layout/              # 布局组件
│   │   │   ├── common/              # 通用组件
│   │   │   ├── charts/              # 图表组件
│   │   │   └── pages/              # 页面级组件
│   │   ├── services/                # API 服务层
│   │   ├── stores/                  # Zustand 状态管理
│   │   └── types/                   # TypeScript 类型
│   ├── package.json
│   └── ...
├── backend/                          # FastAPI 后端服务
│   ├── app/
│   │   ├── api/                     # API 路由
│   │   │   ├── __init__.py          # 路由汇总导出
│   │   │   ├── auth.py              # 认证模块
│   │   │   ├── companies.py          # 公司模块
│   │   │   ├── documents.py          # 文档模块
│   │   │   ├── portfolios.py          # 持仓模块
│   │   │   ├── research/
│   │   │   │   ├── tasks.py          # 任务
│   │   │   │   ├── conclusions.py    # 结论卡
│   │   │   │   ├── assumptions.py    # 假设跟踪
│   │   │   │   └── questions.py      # 问答
│   │   │   ├── copilot_and_dashboard/
│   │   │   │   ├── copilot.py        # AI Copilot
│   │   │   │   ├── alerts.py         # 预警
│   │   │   │   ├── workbench.py      # 工作台
│   │   │   │   ├── dashboard.py      # 仪表盘
│   │   │   │   └── management.py     # 管理统计
│   │   │   ├── admin_routes.py      # 管理路由
│   │   │   └── templates.py          # 模板
│   │   ├── models/                  # SQLAlchemy 模型
│   │   ├── schemas/                 # Pydantic 模型
│   │   ├── services/               # 业务逻辑层
│   │   │   ├── copilot_service.py    # Copilot 问答服务
│   │   │   └── multi_agent_service.py # 多 Agent 协同服务
│   │   ├── agents/                 # OpenClaw Agent 定义
│   │   │   ├── __init__.py          # Agent 框架核心
│   │   │   ├── base.py              # BaseAgent 基类
│   │   │   ├── supervisor.py         # SupervisorAgent
│   │   │   ├── document_agent.py     # DocumentAnalysisAgent
│   │   │   ├── copilot_agent.py      # CopilotAgent
│   │   │   ├── peer_agent.py         # PeerComparisonAgent
│   │   │   ├── alert_agent.py        # AlertClassificationAgent
│   │   │   ├── synthesizer.py       # ResultSynthesizerAgent
│   │   │   └── orchestrator.py      # AgentOrchestrator
│   │   ├── core/                   # 核心配置
│   │   │   ├── config.py           # 配置管理
│   │   │   ├── database.py         # 数据库连接
│   │   │   └── security.py         # 安全工具
│   │   └── main.py                 # FastAPI 应用入口
│   ├── requirements.txt
│   └── ...
├── docker-compose.yml               # 开发环境 Docker 配置
├── docker-compose.prod.yml          # 生产环境 Docker 配置
├── nginx/                          # Nginx 配置
│   └── nginx.conf
├── SPEC.md                         # 完整规格文档
└── README.md                       # 项目说明文档
```

---

## 8. 快速开始

### 8.1 环境要求

- Node.js >= 20
- Python >= 3.11
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### 8.2 Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/stock-picker-lab/Research-Collaboration-Platform.git
cd investment-research-platform

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入必要配置

# 3. 启动所有服务
docker-compose up -d --build

# 4. 初始化数据库（如需要）
docker-compose exec backend python -m app.db.init_db

# 5. 访问应用
# 前端: http://localhost:3000
# 后端 API: http://localhost:8000
# API 文档: http://localhost:8000/docs
```

### 8.3 本地开发

**后端：**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 配置数据库连接
export DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/research_platform
export JWT_SECRET=your-secret-key

uvicorn app.main:app --reload --port 8000
```

**前端：**
```bash
cd frontend
npm install

# 配置 API 地址
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

npm run dev
```

### 8.4 演示模式登录

系统支持演示模式，无需后端即可体验前端：

1. 打开 http://localhost:3000/login
2. 选择角色（研究员/基金经理/研究所领导/系统管理员）
3. 点击登录，直接进入对应工作台

---

## 9. 部署说明

### 9.1 生产环境部署架构

```
                    ┌─────────────────┐
                    │   用户访问       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Nginx (HTTPS) │
                    │   443 端口      │
                    └────────┬────────┘
                             │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼───────┐     ┌───────▼───────┐     ┌───────▼───────┐
│  Frontend     │     │   Backend     │     │   Static      │
│  Next.js      │     │   FastAPI     │     │   Files       │
│  :3000        │     │   :8000       │     │               │
└───────────────┘     └───────┬───────┘     └───────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼─────┐ ┌─────▼─────┐ ┌───────▼──────┐
    │  PostgreSQL   │ │   Redis   │ │   MinIO      │
    │   主数据库     │ │  缓存/队列 │ │  文件存储    │
    │  + pgvector   │ │           │ │              │
    └───────────────┘ └───────────┘ └──────────────┘
```

### 9.2 云服务器部署命令

```bash
# 1. SSH 连接云服务器
ssh user@your-server-ip

# 2. 进入项目目录
cd /path/to/investment-research-platform

# 3. 拉取最新代码
git pull origin main

# 4. 构建并启动服务
docker-compose -f docker-compose.prod.yml up -d --build

# 5. 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 6. 检查服务状态
docker-compose -f docker-compose.prod.yml ps
```

### 9.3 环境变量配置

**.env 文件配置项：**
```bash
# 数据库
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379/0

# JWT
JWT_SECRET=your-256-bit-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=https://your-domain.com

# 文件存储（可选）
OSS_ACCESS_KEY=xxx
OSS_SECRET_KEY=xxx
OSS_BUCKET=research-docs
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# LLM API（AI Agent 支持）
LLM_API_KEY=xxx
LLM_BASE_URL=https://api.openai.com/v1
```

---

## 10. 开发规范

### 10.1 Git 分支管理

```
main          ── 生产环境分支
├── develop   ── 开发集成分支
├── feature/* ── 功能分支
├── fix/*     ── 修复分支
└── refactor/* ── 重构分支
```

**提交规范：**
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具
```

### 10.2 前端规范

- **组件文件**：PascalCase，如 `UserProfile.tsx`
- **工具函数**：camelCase，如 `formatDate.ts`
- **样式**：使用 Tailwind CSS + TDesign 组件
- **类型定义**：放在 `src/types/index.ts`

### 10.3 后端规范

- **路由文件**：snake_case，如 `user_management.py`
- **模型文件**：snake_case，如 `user_model.py`
- **Pydantic Schema**：PascalCase 响应模型，snake_case 请求模型
- **所有用户输入必须验证**：使用 Pydantic 模型

### 10.4 Agent 开发规范

**新增 Agent 步骤：**

1. 在 `agents/` 目录下创建 Agent 类，继承 `BaseAgent`
2. 定义 `name`、`system_prompt`、`capabilities`
3. 实现 `execute()` 方法
4. 在 `AgentFactory` 中注册 Agent
5. 在 `multi_agent_service.py` 中添加协同流程

**示例：**
```python
# 1. 创建 Agent 类
class MyCustomAgent(BaseAgent):
    name = "my_custom"
    system_prompt = "你是一个..."
    capabilities = ["分析", "总结"]
    output_schema = MyCustomOutput

    async def execute(self, context: dict) -> AgentResult:
        # 实现执行逻辑
        pass

# 2. 注册到工厂
AgentFactory.register("my_custom", MyCustomAgent)

# 3. 在协同流程中使用
orchestrator = AgentFactory.get_orchestrator()
result = await orchestrator.orchestrate(
    request="...",
    context={"agents": ["my_custom", "document_analysis"]}
)
```

### 10.5 安全规范

- 用户密码必须加密存储（bcrypt）
- 所有 API 需要认证（除 `/auth/login`）
- 使用参数化查询防止 SQL 注入
- 敏感操作记录审计日志
- 定期更新依赖包版本

---

## 11. 未来规划

- [x] **OpenClaw 多 Agent 协同** - Agent 编排框架（已实现）
- [ ] **RAG 向量检索增强** - 使用 pgvector 实现语义搜索
- [ ] **实时协作** - WebSocket 支持实时通知和协作
- [ ] **移动端适配** - 响应式设计，支持移动办公
- [ ] **数据分析** - 研究有效性分析，产出归因
- [ ] **自定义 Agent** - 支持用户自定义 Agent 提示词和流程

---

## License

Private & Confidential - 仅限内部使用
