# 投研协作平台 (Research Collaboration Copilot Platform)

> 面向基金公司研究所的智能投研协作平台，支持研究员、基金经理、研究所领导、系统管理员四种角色，实现研究文档管理、公司跟踪、问题协作、结论卡片、持仓管理等核心功能。

##

## 功能特性

### 多角色工作台

| 角色 | 功能模块 |
|------|----------|
| **研究员** | 工作台、文档库、研究任务、研报结论、关注公司、问答协作、我的预警 |
| **基金经理** | 工作台、持仓管理、观察池、文档库、研报结论、问答协作 |
| **研究所领导** | 工作台、任务管理、团队管理、文档库、研报结论、问答协作、产出统计、数据源、系统设置 |
| **系统管理员** | 工作台、用户管理、审计日志、系统设置 |

### 核心功能

- **文档管理** - 研报、公告、年报、纪要等文档上传、搜索、AI 分析
- **研究任务** - 任务创建、分配、进度跟踪、审核流程
- **结论卡片** - 3-3-2-1 结构化研究结论，支持 Publish/Archive
- **持仓管理** - 基金经理持仓管理、观察池
- **智能预警** - P0/P1/P2 级别预警推送
- **问答协作** - 跨角色问题发起与回复
- **数据源管理** - 支持多种外部数据源接入

##

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端 | Next.js 14 + TypeScript + Tailwind CSS + TDesign |
| 后端 | Python 3.11 + FastAPI + SQLAlchemy 2.0 (异步) |
| 数据库 | PostgreSQL 16 + pgvector (向量检索) |
| 缓存 | Redis 7 |
| 认证 | JWT + RBAC |
| 部署 | Docker Compose + Nginx |

##

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Client)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ 研究员工作台  │  │ PM 决策驾驶舱 │  │ 管理层效率看板       │   │
│  │  (Next.js)   │  │  (Next.js)   │  │     (Next.js)        │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    REST API / WebSocket
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     API 网关层 (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Auth  │  Rate Limit  │  CORS  │  Logging  │  RBAC        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL + Redis                          │
└─────────────────────────────────────────────────────────────────┘
```

##

## 快速开始

### 环境要求

- Node.js >= 20
- Python >= 3.11
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### Docker 部署（推荐）

```bash
# 克隆项目
git clone https://github.com/stock-picker-lab/Research-Collaboration-Platform.git
cd investment-research-platform

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入必要配置

# 启动所有服务
docker-compose up -d --build

# 访问
# 前端: http://localhost:3000
# API: http://localhost:8000/docs
```

### 本地开发

**后端：**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**前端：**
```bash
cd frontend
npm install
npm run dev
```

##

## 项目结构

```
investment-research-platform/
├── frontend/                    # Next.js 前端应用
│   ├── src/
│   │   ├── app/                 # App Router 页面
│   │   │   ├── login/           # 登录页
│   │   │   ├── researcher/      # 研究员页面
│   │   │   ├── fm/              # 基金经理页面
│   │   │   ├── leader/          # 研究所领导页面
│   │   │   └── admin/           # 系统管理员页面
│   │   ├── components/          # 通用组件
│   │   │   ├── layout/          # 布局组件
│   │   │   ├── common/          # 通用组件
│   │   │   ├── charts/          # 图表组件
│   │   │   ├── forms/           # 表单组件
│   │   │   └── pages/           # 页面组件
│   │   ├── services/            # API 服务
│   │   ├── stores/              # Zustand 状态管理
│   │   └── types/               # TypeScript 类型
│   └── ...
├── backend/                     # FastAPI 后端服务
│   ├── app/
│   │   ├── api/                 # API 路由
│   │   │   ├── auth.py          # 认证
│   │   │   ├── companies.py     # 公司
│   │   │   ├── documents.py     # 文档
│   │   │   ├── portfolios.py     # 持仓
│   │   │   ├── admin_routes.py  # 管理
│   │   │   └── ...
│   │   ├── models/              # 数据模型
│   │   ├── schemas/             # Pydantic 模型
│   │   ├── services/            # 业务逻辑
│   │   └── core/                # 核心配置
│   └── ...
├── docker-compose.yml           # Docker Compose 配置
├── docker-compose.prod.yml      # 生产环境配置
├── nginx/                       # Nginx 配置
└── SPEC.md                      # 完整规格文档
```

##

## API 文档

部署后可访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 主要 API 端点

| 模块 | 前缀 | 说明 |
|------|------|------|
| Auth | `/api/v1/auth` | 登录、登出、Token 刷新 |
| Users | `/api/v1/users` | 用户管理 |
| Companies | `/api/v1/companies` | 公司管理 |
| Documents | `/api/v1/documents` | 文档管理 |
| Tasks | `/api/v1/tasks` | 研究任务 |
| Conclusions | `/api/v1/conclusions` | 结论卡 |
| Questions | `/api/v1/questions` | 问答协作 |
| Alerts | `/api/v1/alerts` | 预警推送 |
| Portfolios | `/api/v1/portfolios` | 持仓管理 |
| Templates | `/api/v1/templates` | 模板管理 |
| Admin | `/api/v1/admin` | 系统管理 |

##

## 角色说明

| 角色 | 标识 | 说明 |
|------|------|------|
| 研究员 | `researcher` | 日常研究、文档阅读、结论维护 |
| 基金经理 | `pm` | 查看重点变化、发起问题、持仓管理 |
| 研究所领导 | `leader` | 团队管理、效率看板、任务分配 |
| 系统管理员 | `admin` | 用户权限、系统配置、审计日志 |

##

## 开发指南

### 前端组件规范

- 使用 TDesign 组件库
- 图标从 `tdesign-icons-react` 导入
- 使用 Zustand 进行状态管理
- 页面组件放在 `src/app/{role}/` 目录

### 后端规范

- 使用 SQLAlchemy 2.0 异步 ORM
- 所有用户输入使用 Pydantic 模型验证
- API 路径遵循 RESTful 规范
- 敏感操作记录审计日志

##

## License

Private & Confidential - 仅限内部使用
