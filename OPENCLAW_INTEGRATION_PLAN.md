# OpenClaw 集成方案 - 投研协作平台

## 📋 集成架构设计

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     投研协作平台                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  Next.js     │◄────►│  FastAPI     │                    │
│  │  Frontend    │      │  Backend     │                    │
│  └──────────────┘      └───────┬──────┘                    │
│                                 │                            │
│                        ┌────────▼────────┐                  │
│                        │  HTTP Client    │                  │
│                        │  (httpx)        │                  │
│                        └────────┬────────┘                  │
└─────────────────────────────────┼─────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │    OpenClaw Gateway        │
                    │    (Node.js Service)       │
                    │    Port: 18789             │
                    ├────────────────────────────┤
                    │  - REST API                │
                    │  - WebSocket               │
                    │  - Skills System           │
                    │  - Multi-Agent Runtime     │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │    LLM Providers           │
                    │  - OpenAI GPT-4            │
                    │  - DeepSeek                │
                    │  - Moonshot (Kimi)         │
                    └────────────────────────────┘
```

---

## 🚀 实施步骤

### 第一阶段:部署OpenClaw服务 (Week 1)

#### 1.1 在Docker环境中部署OpenClaw

创建 `docker-compose.openclaw.yml`:

```yaml
version: '3.8'

services:
  openclaw:
    image: node:22-alpine
    container_name: openclaw-gateway
    working_dir: /app
    ports:
      - "18789:18789"  # OpenClaw Gateway
    volumes:
      - openclaw_data:/root/.openclaw
      - ./openclaw_config:/app/config
    environment:
      - NODE_ENV=production
      - OPENCLAW_PORT=18789
      - OPENCLAW_BIND=0.0.0.0
    command: >
      sh -c "
        npm install -g openclaw@latest &&
        openclaw gateway start --port 18789 --bind 0.0.0.0
      "
    networks:
      - app-network
    restart: unless-stopped

volumes:
  openclaw_data:

networks:
  app-network:
    external: true
```

#### 1.2 配置OpenClaw

创建 `openclaw_config/openclaw.json`:

```json
{
  "gateway": {
    "port": 18789,
    "mode": "remote",
    "bind": "0.0.0.0",
    "controlUi": {
      "enabled": true,
      "allowInsecureAuth": false
    }
  },
  "models": {
    "default": "openai/gpt-4-turbo",
    "providers": {
      "openai": {
        "apiKey": "${OPENAI_API_KEY}",
        "baseUrl": "https://api.openai.com/v1"
      },
      "moonshot": {
        "apiKey": "${MOONSHOT_API_KEY}",
        "baseUrl": "https://api.moonshot.cn/v1"
      }
    }
  },
  "skills": {
    "enabled": ["web-search", "document-analysis", "data-extraction"],
    "customSkillsPath": "/app/custom-skills"
  },
  "security": {
    "apiKey": "${OPENCLAW_API_KEY}",
    "allowedOrigins": ["http://localhost:3000", "http://localhost:8000"]
  }
}
```

---

### 第二阶段:开发后端集成层 (Week 2)

#### 2.1 创建OpenClaw客户端

`backend/app/agents/openclaw_client.py`:

```python
"""
OpenClaw HTTP客户端 - 与OpenClaw Gateway通信
"""
import httpx
from typing import Optional, Dict, Any, AsyncIterator
from app.core.config import settings
import structlog

logger = structlog.get_logger(__name__)


class OpenClawClient:
    """OpenClaw Gateway HTTP客户端"""
    
    def __init__(
        self,
        base_url: str = "http://openclaw:18789",
        api_key: Optional[str] = None,
        timeout: float = 300.0
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or settings.OPENCLAW_API_KEY
        self.timeout = timeout
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=httpx.Timeout(timeout),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
        )
    
    async def create_task(
        self,
        instruction: str,
        context: Optional[Dict[str, Any]] = None,
        agent_type: str = "default"
    ) -> Dict[str, Any]:
        """
        创建新的Agent任务
        
        Args:
            instruction: 任务指令(自然语言)
            context: 上下文信息(公司信息、文档内容等)
            agent_type: Agent类型(research/qa/risk/insight)
        
        Returns:
            {
                "task_id": "uuid",
                "status": "pending",
                "created_at": "2026-03-22T10:00:00Z"
            }
        """
        payload = {
            "instruction": instruction,
            "context": context or {},
            "agent_type": agent_type,
            "settings": {
                "model": "openai/gpt-4-turbo",
                "temperature": 0.3,
                "max_tokens": 4000
            }
        }
        
        try:
            response = await self.client.post("/api/v1/tasks", json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error("openclaw_task_creation_failed", error=str(e))
            raise
    
    async def get_task_result(self, task_id: str) -> Dict[str, Any]:
        """
        获取任务结果
        
        Returns:
            {
                "task_id": "uuid",
                "status": "completed" | "pending" | "failed",
                "result": {...},
                "error": "...",
                "duration": 5.2
            }
        """
        try:
            response = await self.client.get(f"/api/v1/tasks/{task_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error("openclaw_task_fetch_failed", task_id=task_id, error=str(e))
            raise
    
    async def stream_task(
        self,
        instruction: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        流式执行任务(SSE)
        
        Yields:
            {"type": "progress", "message": "正在分析文档..."}
            {"type": "result", "data": {...}}
            {"type": "complete"}
        """
        payload = {
            "instruction": instruction,
            "context": context or {},
            "stream": True
        }
        
        try:
            async with self.client.stream("POST", "/api/v1/tasks/stream", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]  # 去掉 "data: " 前缀
                        if data.strip():
                            import json
                            yield json.loads(data)
        except httpx.HTTPError as e:
            logger.error("openclaw_stream_failed", error=str(e))
            raise
    
    async def execute_skill(
        self,
        skill_name: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        执行OpenClaw技能
        
        Args:
            skill_name: 技能名称(document-analysis/web-search/data-extraction)
            parameters: 技能参数
        
        Returns:
            技能执行结果
        """
        payload = {
            "skill": skill_name,
            "parameters": parameters
        }
        
        try:
            response = await self.client.post("/api/v1/skills/execute", json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error("openclaw_skill_execution_failed", skill=skill_name, error=str(e))
            raise
    
    async def close(self):
        """关闭HTTP客户端"""
        await self.client.aclose()


# 单例实例
openclaw_client = OpenClawClient()
```

#### 2.2 创建Agent服务层

`backend/app/services/agent_service.py`:

```python
"""
AI Agent服务 - 业务逻辑层
"""
from typing import Optional, Dict, Any, List
from app.agents.openclaw_client import openclaw_client
from app.models.document import Document
from app.models.company import Company
import structlog

logger = structlog.get_logger(__name__)


class AgentService:
    """AI Agent业务服务"""
    
    async def analyze_document(
        self,
        document: Document,
        company: Company
    ) -> Dict[str, Any]:
        """
        分析研报文档
        
        Returns:
            {
                "summary": "简短总结",
                "key_points": ["要点1", "要点2"],
                "stance": "bullish" | "neutral" | "bearish",
                "target_price": 123.45,
                "risk_factors": ["风险1", "风险2"]
            }
        """
        instruction = f"""
        请分析以下研报文档,提取关键信息:
        
        公司: {company.name} ({company.ticker})
        行业: {company.industry}
        文档标题: {document.title}
        文档类型: {document.doc_type}
        
        请提取:
        1. 核心观点和投资逻辑
        2. 目标价/评级变化
        3. 关键财务数据
        4. 风险因素
        5. 投资建议
        
        以结构化JSON格式返回。
        """
        
        context = {
            "document_id": document.id,
            "document_content": document.content[:10000],  # 前10k字符
            "company_info": {
                "name": company.name,
                "ticker": company.ticker,
                "industry": company.industry,
                "sector": company.sector
            }
        }
        
        try:
            task = await openclaw_client.create_task(
                instruction=instruction,
                context=context,
                agent_type="research"
            )
            
            # 轮询获取结果(或使用WebSocket)
            import asyncio
            max_retries = 60  # 最多等待5分钟
            for _ in range(max_retries):
                result = await openclaw_client.get_task_result(task["task_id"])
                
                if result["status"] == "completed":
                    return result["result"]
                elif result["status"] == "failed":
                    raise Exception(f"Agent任务失败: {result.get('error')}")
                
                await asyncio.sleep(5)  # 每5秒查询一次
            
            raise TimeoutError("Agent任务超时")
            
        except Exception as e:
            logger.error("document_analysis_failed", document_id=document.id, error=str(e))
            raise
    
    async def answer_question(
        self,
        question: str,
        company: Company,
        relevant_docs: List[Document]
    ) -> Dict[str, Any]:
        """
        回答基金经理问题(RAG检索)
        
        Returns:
            {
                "answer": "详细回答",
                "sources": [
                    {"doc_id": 123, "title": "xxx", "relevance": 0.92}
                ],
                "confidence": 0.85
            }
        """
        instruction = f"""
        请回答关于 {company.name} 的问题:
        
        问题: {question}
        
        请基于提供的研报文档进行回答,并注明信息来源。
        """
        
        context = {
            "company_id": company.id,
            "company_name": company.name,
            "documents": [
                {
                    "id": doc.id,
                    "title": doc.title,
                    "content": doc.content[:2000],
                    "created_at": doc.created_at.isoformat()
                }
                for doc in relevant_docs[:5]  # 只传最相关的5篇
            ]
        }
        
        task = await openclaw_client.create_task(
            instruction=instruction,
            context=context,
            agent_type="qa"
        )
        
        # ... (同上的轮询逻辑)
        return await self._wait_for_task(task["task_id"])
    
    async def generate_risk_alert(
        self,
        company: Company,
        holding_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        生成风险预警
        
        Returns:
            {
                "risk_level": "high" | "medium" | "low",
                "risk_factors": [...],
                "suggested_actions": [...],
                "related_news": [...]
            }
        """
        instruction = f"""
        请为持仓公司 {company.name} 生成风险预警分析:
        
        持仓信息:
        - 持仓权重: {holding_info.get('weight', 0)}%
        - 持仓成本: {holding_info.get('avg_cost')}
        - 当前价格: {holding_info.get('current_price')}
        - 浮动盈亏: {holding_info.get('pnl_ratio')}%
        
        请分析:
        1. 公司基本面变化
        2. 行业环境变化
        3. 市场舆情风险
        4. 财务指标预警
        5. 建议操作
        """
        
        task = await openclaw_client.create_task(
            instruction=instruction,
            context={"company": company.dict(), "holding": holding_info},
            agent_type="risk"
        )
        
        return await self._wait_for_task(task["task_id"])
    
    async def _wait_for_task(self, task_id: str, timeout: int = 300) -> Dict[str, Any]:
        """等待任务完成的辅助方法"""
        import asyncio
        max_retries = timeout // 5
        
        for _ in range(max_retries):
            result = await openclaw_client.get_task_result(task_id)
            
            if result["status"] == "completed":
                return result["result"]
            elif result["status"] == "failed":
                raise Exception(f"Agent任务失败: {result.get('error')}")
            
            await asyncio.sleep(5)
        
        raise TimeoutError(f"任务 {task_id} 超时")


agent_service = AgentService()
```

---

### 第三阶段:开发自定义OpenClaw技能 (Week 3)

#### 3.1 创建投研专用技能

`openclaw_custom_skills/research-document-analyzer.js`:

```javascript
/**
 * 投研文档分析技能
 * 专门用于分析券商研报、年报、公告
 */
module.exports = {
  name: 'research-document-analyzer',
  description: '分析投研文档,提取核心观点和数据',
  version: '1.0.0',
  
  // 技能参数定义
  parameters: {
    documentContent: {
      type: 'string',
      required: true,
      description: '文档内容(Markdown或纯文本)'
    },
    companyInfo: {
      type: 'object',
      required: true,
      description: '公司基本信息'
    },
    analysisType: {
      type: 'string',
      enum: ['summary', 'detailed', 'financial'],
      default: 'detailed'
    }
  },
  
  // 技能执行逻辑
  async execute({ documentContent, companyInfo, analysisType }, { llm, logger }) {
    logger.info(`开始分析 ${companyInfo.name} 的研报文档`);
    
    // 构造Prompt
    const systemPrompt = `你是一位资深的卖方研究员,擅长分析券商研报、年报和公司公告。`;
    
    const userPrompt = `
请分析以下研报文档:

公司: ${companyInfo.name} (${companyInfo.ticker})
行业: ${companyInfo.industry}

文档内容:
${documentContent.substring(0, 20000)}

请提取以下信息并以JSON格式返回:
{
  "summary": "200字以内的核心总结",
  "stance": "投资评级: bullish/neutral/bearish",
  "target_price": 123.45,
  "key_points": ["核心观点1", "核心观点2", "核心观点3"],
  "financial_metrics": {
    "revenue": "营收数据",
    "profit": "利润数据",
    "pe_ratio": "PE估值"
  },
  "risk_factors": ["风险点1", "风险点2"],
  "confidence": 0.85
}
`;
    
    try {
      // 调用LLM
      const response = await llm.complete({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
      
      // 解析JSON结果
      const result = JSON.parse(response.content);
      
      logger.info(`文档分析完成`, { company: companyInfo.name });
      
      return {
        success: true,
        data: result,
        metadata: {
          company_id: companyInfo.id,
          analyzed_at: new Date().toISOString()
        }
      };
      
    } catch (error) {
      logger.error(`文档分析失败`, { error: error.message });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
};
```

#### 3.2 创建RAG检索技能

`openclaw_custom_skills/research-qa-retriever.js`:

```javascript
/**
 * 投研问答检索技能
 * 基于向量检索回答问题
 */
const axios = require('axios');

module.exports = {
  name: 'research-qa-retriever',
  description: '基于研报文档库回答投资问题',
  version: '1.0.0',
  
  parameters: {
    question: {
      type: 'string',
      required: true
    },
    companyId: {
      type: 'number',
      required: true
    }
  },
  
  async execute({ question, companyId }, { llm, logger }) {
    logger.info(`处理问题: ${question}`, { companyId });
    
    try {
      // 1. 调用后端API进行向量检索
      const backendUrl = process.env.BACKEND_URL || 'http://backend:8000';
      const searchResponse = await axios.post(
        `${backendUrl}/api/v1/documents/search`,
        {
          query: question,
          company_id: companyId,
          top_k: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`
          }
        }
      );
      
      const relevantDocs = searchResponse.data.documents;
      
      // 2. 构造上下文
      const context = relevantDocs.map((doc, idx) => 
        `[文档${idx + 1}] ${doc.title}\n${doc.content.substring(0, 1000)}`
      ).join('\n\n');
      
      // 3. 调用LLM回答
      const prompt = `
请基于以下研报文档回答问题:

问题: ${question}

参考文档:
${context}

要求:
1. 回答要准确、专业
2. 明确标注信息来源
3. 如果文档中没有相关信息,请说明
`;
      
      const llmResponse = await llm.complete({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      });
      
      return {
        success: true,
        data: {
          answer: llmResponse.content,
          sources: relevantDocs.map(doc => ({
            id: doc.id,
            title: doc.title,
            relevance: doc.score
          })),
          confidence: 0.8
        }
      };
      
    } catch (error) {
      logger.error(`问答检索失败`, { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
};
```

---

### 第四阶段:API接口开发 (Week 4)

#### 4.1 FastAPI路由

`backend/app/api/routes/agents.py`:

```python
"""
AI Agent API路由
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.agent_service import agent_service
from app.models.document import Document
from app.models.company import Company
from app.schemas.agent import (
    DocumentAnalysisRequest,
    DocumentAnalysisResponse,
    QuestionRequest,
    QuestionResponse,
    RiskAlertRequest,
    RiskAlertResponse
)
from app.api.deps import get_current_user
from app.models.user import User
import structlog

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/agents", tags=["AI Agents"])


@router.post("/analyze-document", response_model=DocumentAnalysisResponse)
async def analyze_document(
    request: DocumentAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI分析研报文档
    
    - 自动提取核心观点
    - 生成投资评级
    - 识别财务数据
    """
    # 1. 获取文档和公司信息
    document = await db.get(Document, request.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="文档不存在")
    
    company = await db.get(Company, document.company_id)
    
    # 2. 调用Agent服务
    try:
        result = await agent_service.analyze_document(document, company)
        
        logger.info(
            "document_analyzed",
            document_id=document.id,
            user_id=current_user.id
        )
        
        return DocumentAnalysisResponse(
            document_id=document.id,
            company_id=company.id,
            analysis=result,
            status="completed"
        )
        
    except Exception as e:
        logger.error("document_analysis_api_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/answer-question", response_model=QuestionResponse)
async def answer_question(
    request: QuestionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI回答投研问题(RAG)
    
    - 检索相关研报
    - 生成专业回答
    - 标注信息来源
    """
    company = await db.get(Company, request.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="公司不存在")
    
    # TODO: 实现向量检索获取相关文档
    relevant_docs = []  # await vector_search(request.question, company.id)
    
    try:
        result = await agent_service.answer_question(
            question=request.question,
            company=company,
            relevant_docs=relevant_docs
        )
        
        return QuestionResponse(
            question=request.question,
            answer=result["answer"],
            sources=result["sources"],
            confidence=result["confidence"]
        )
        
    except Exception as e:
        logger.error("qa_api_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-risk-alert", response_model=RiskAlertResponse)
async def generate_risk_alert(
    request: RiskAlertRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    生成持仓风险预警
    
    - 分析基本面变化
    - 监控市场舆情
    - 提供操作建议
    """
    company = await db.get(Company, request.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="公司不存在")
    
    # 可以在后台异步执行
    background_tasks.add_task(
        agent_service.generate_risk_alert,
        company,
        request.holding_info
    )
    
    return RiskAlertResponse(
        status="processing",
        message="风险分析任务已提交,请稍后查看结果"
    )
```

---

## 📊 使用示例

### 前端调用示例

```typescript
// frontend/src/services/agentService.ts
export const analyzeDocument = async (documentId: number) => {
  const response = await apiClient.post('/api/v1/agents/analyze-document', {
    document_id: documentId
  });
  return response.data;
};

export const askQuestion = async (companyId: number, question: string) => {
  const response = await apiClient.post('/api/v1/agents/answer-question', {
    company_id: companyId,
    question: question
  });
  return response.data;
};
```

---

## 🔧 环境变量配置

添加到 `.env.prod`:

```bash
# ============================================
# OpenClaw 配置
# ============================================
OPENCLAW_BASE_URL=http://openclaw:18789
OPENCLAW_API_KEY=your-secure-api-key-here

# OpenClaw LLM配置
OPENAI_API_KEY=sk-xxx
MOONSHOT_API_KEY=sk-xxx

# OpenClaw技能路径
OPENCLAW_CUSTOM_SKILLS_PATH=/app/openclaw_custom_skills
```

---

## 📈 部署清单

### 1. 启动OpenClaw服务

```bash
# 启动OpenClaw容器
docker compose -f docker-compose.openclaw.yml up -d

# 验证服务
curl http://localhost:18789/health
```

### 2. 安装自定义技能

```bash
# 进入OpenClaw容器
docker exec -it openclaw-gateway sh

# 安装技能
openclaw skills install /app/custom-skills/research-document-analyzer.js
openclaw skills install /app/custom-skills/research-qa-retriever.js

# 验证技能
openclaw skills list
```

### 3. 更新后端依赖

```bash
# 后端已有httpx,无需额外安装
cd backend
pip install -r requirements.txt
```

### 4. 启动完整系统

```bash
# 启动所有服务(包括OpenClaw)
docker compose -f docker-compose.prod.yml -f docker-compose.openclaw.yml up -d --build
```

---

## 🎯 预期效果

### ✅ 完成后可实现:

1. **智能文档分析**
   - 上传研报 → OpenClaw自动提取核心观点
   - 生成结构化结论卡数据
   - 识别财务数据和评级变化

2. **智能问答系统**
   - 基金经理提问 → OpenClaw检索文档 → 生成专业回答
   - 自动标注信息来源
   - 支持多轮对话

3. **风险监控Agent**
   - 定期扫描持仓公司
   - 发现风险信号自动预警
   - 生成操作建议

4. **多Agent协同**
   - 复杂任务自动分解
   - 多个Agent并行执行
   - 结果汇总和质量控制

---

## 📚 参考资源

- OpenClaw官方文档: https://docs.openclaw.ai/
- OpenClaw GitHub: https://github.com/openclaw/openclaw
- Skills开发指南: https://docs.openclaw.ai/skills/development
- API参考: https://docs.openclaw.ai/api/gateway

---

## ⏱️ 预计时间线

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| 第一阶段 | 1 week | OpenClaw服务部署完成 |
| 第二阶段 | 1 week | Python后端集成完成 |
| 第三阶段 | 1 week | 自定义技能开发完成 |
| 第四阶段 | 1 week | API和前端对接完成 |
| **总计** | **4 weeks** | **完整OpenClaw集成** |

---

## 💡 下一步行动

1. ✅ 阅读并确认本方案
2. ⏭️ 开始第一阶段:部署OpenClaw服务
3. ⏭️ 配置环境变量和API密钥
4. ⏭️ 开发Python集成层

**准备好开始了吗? 我可以立即开始实施!** 🚀
