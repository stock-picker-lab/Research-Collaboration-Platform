# OpenClaw 快速启动指南

> **目标:** 5分钟内启动OpenClaw并测试AI Agent功能

---

## 📋 前提条件

- ✅ Docker & Docker Compose 已安装
- ✅ Node.js 18+ (用于自定义技能)
- ✅ 有效的LLM API Key (OpenAI/Moonshot/DeepSeek)

---

## 🚀 快速启动(3步)

### Step 1: 配置环境变量

```bash
cd /path/to/investment-research-platform

# 复制环境变量模板
cp .env.example .env.prod

# 编辑配置文件
vim .env.prod
```

**必需配置:**
```bash
# LLM API配置(至少配置一个)
LLM_API_KEY=sk-your-openai-api-key          # OpenAI
# LLM_PROVIDER=moonshot                     # 或使用Moonshot
# LLM_API_KEY=sk-your-moonshot-key

# OpenClaw安全密钥(自定义,用于认证)
OPENCLAW_API_KEY=your-secure-random-key-here
BACKEND_API_KEY=your-backend-secret-key-here

# 数据库配置(可选,使用默认值即可)
POSTGRES_PASSWORD=your-db-password
```

**💡 提示:** 
- 生成随机密钥: `openssl rand -hex 32`
- OpenAI API Key: https://platform.openai.com/api-keys
- Moonshot API Key: https://platform.moonshot.cn/

---

### Step 2: 启动OpenClaw服务

```bash
# 创建Docker网络(如果还没有)
docker network create app-network

# 启动OpenClaw Gateway
docker compose -f docker-compose.openclaw.yml up -d

# 查看日志,确认启动成功
docker compose -f docker-compose.openclaw.yml logs -f openclaw

# 看到类似输出表示成功:
# ✓ OpenClaw Gateway started on http://0.0.0.0:18789
# ✓ Connected to LLM provider: openai
```

**验证服务:**
```bash
# 健康检查
curl http://localhost:18789/health

# 预期输出: {"status":"ok"}
```

---

### Step 3: 安装自定义技能

```bash
# 安装Node.js依赖
cd openclaw_custom_skills
npm install

# 进入OpenClaw容器
docker exec -it openclaw bash

# 安装自定义技能(假设OpenClaw CLI支持)
# 注意: 具体命令取决于OpenClaw版本,可能需要调整
openclaw skill add /workspace/openclaw_custom_skills/research-document-analyzer.js
openclaw skill add /workspace/openclaw_custom_skills/intelligent-qa.js
openclaw skill add /workspace/openclaw_custom_skills/risk-monitor.js

# 或者手动复制技能文件(如果CLI不支持)
cp /workspace/openclaw_custom_skills/*.js /app/skills/

# 重启OpenClaw服务以加载技能
exit
docker compose -f docker-compose.openclaw.yml restart openclaw

# 验证技能安装
docker exec openclaw openclaw skill list
```

**⚠️ 注意:** OpenClaw技能安装方式可能因版本而异,请参考官方文档。

---

## ✅ 验证功能

### 测试1: 后端健康检查

```bash
# 启动完整系统
docker compose -f docker-compose.prod.yml up -d

# 检查Agent服务状态
curl http://localhost:8000/api/v1/agents/health

# 预期输出:
# {
#   "status": "healthy",
#   "openclaw_status": "connected",
#   "message": "OpenClaw Gateway is running"
# }
```

### 测试2: 智能问答(需要JWT Token)

```bash
# 1. 先登录获取Token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.access_token')

# 2. 调用问答API
curl -X POST http://localhost:8000/api/v1/agents/ask \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "什么是价值投资?",
    "doc_types": ["research_report"]
  }' | jq .
```

### 测试3: 前端UI测试

1. 打开浏览器访问: http://localhost:3000
2. 登录系统
3. 进入任意公司详情页
4. 查看右侧 **AI Agent 面板**
5. 在"智能问答"Tab输入问题并提交

---

## 📊 服务端口总览

| 服务 | 端口 | 用途 |
|------|------|------|
| Frontend | 3000 | Next.js前端 |
| Backend | 8000 | FastAPI后端 |
| **OpenClaw** | **18789** | Agent Gateway |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |

---

## 🐛 常见问题

### Q1: OpenClaw启动失败

**症状:** `docker logs openclaw` 显示 "Failed to connect to LLM"

**解决:**
1. 检查 `.env.prod` 中的 `LLM_API_KEY` 是否正确
2. 检查网络是否能访问LLM API (OpenAI需要翻墙)
3. 尝试更换LLM提供商(如Moonshot/DeepSeek)

```bash
# 修改配置后重启
docker compose -f docker-compose.openclaw.yml restart openclaw
```

### Q2: Agent API返回503错误

**症状:** `/api/v1/agents/ask` 返回 "Cannot connect to OpenClaw"

**解决:**
1. 确认OpenClaw服务正在运行: `docker ps | grep openclaw`
2. 检查网络连接: `docker exec backend ping openclaw`
3. 查看OpenClaw日志: `docker logs openclaw`

### Q3: 前端看不到AI Agent面板

**症状:** 公司详情页没有Agent组件

**解决:**
- 该功能尚未完全集成到所有页面
- 目前需要手动导入 `AIAgentPanel` 组件
- 预计下一个版本完成全面集成

### Q4: 技能无法加载

**症状:** Agent执行失败,提示 "Skill not found"

**解决:**
1. 确认技能文件已复制到容器: `docker exec openclaw ls /app/skills/`
2. 检查技能文件语法: `node openclaw_custom_skills/intelligent-qa.js`
3. 重启OpenClaw: `docker compose -f docker-compose.openclaw.yml restart`

---

## 🔧 高级配置

### 切换LLM提供商

编辑 `openclaw_config/openclaw.json`:

```json
{
  "llm": {
    "default_provider": "moonshot",  // 改为 moonshot/deepseek
    "providers": {
      "moonshot": {
        "api_key": "${MOONSHOT_API_KEY}",
        "base_url": "https://api.moonshot.cn/v1",
        "model": "moonshot-v1-8k"
      }
    }
  }
}
```

重启服务:
```bash
docker compose -f docker-compose.openclaw.yml restart
```

### 调整并发度

编辑 `backend/app/core/config.py`:

```python
class Settings(BaseSettings):
    OPENCLAW_TIMEOUT: int = 60  # 超时时间(秒)
    OPENCLAW_MAX_RETRIES: int = 3  # 重试次数
```

### 启用调试日志

```bash
# 修改docker-compose.openclaw.yml
environment:
  - LOG_LEVEL=debug

# 重启服务
docker compose -f docker-compose.openclaw.yml up -d
```

---

## 📚 下一步

1. ✅ **阅读开发文档:** [OPENCLAW_PROGRESS.md](./OPENCLAW_PROGRESS.md)
2. ✅ **查看集成方案:** [OPENCLAW_INTEGRATION_PLAN.md](./OPENCLAW_INTEGRATION_PLAN.md)
3. ✅ **开发自定义技能:** [openclaw_custom_skills/README.md](./openclaw_custom_skills/README.md)
4. ✅ **API文档:** http://localhost:8000/docs (Swagger UI)

---

## 🆘 获取帮助

- **GitHub Issues:** 提交Bug报告
- **项目文档:** 查看完整README.md
- **OpenClaw官方:** https://docs.openclaw.ai/ (如果存在)

---

**🎉 恭喜!** 你已经成功启动了OpenClaw AI Agent系统!

现在可以开始使用强大的多Agent协同功能来提升投研效率了! 🚀
