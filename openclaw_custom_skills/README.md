# OpenClaw 自定义技能 - 投研平台

本目录包含投研协作平台专用的OpenClaw技能。

## 技能列表

### 1. research-document-analyzer (研报分析器)
**功能**: 分析券商研报、年报、公司公告,提取核心观点和数据

**使用场景**:
- 上传研报后自动分析
- 生成结构化结论卡数据
- 识别财务数据和评级变化

**参数**:
```javascript
{
  documentContent: string,  // 文档内容(Markdown或纯文本)
  companyInfo: {
    name: string,
    ticker: string,
    industry: string
  },
  analysisType: 'summary' | 'detailed' | 'financial'
}
```

**返回**:
```javascript
{
  success: true,
  data: {
    summary: "核心总结",
    stance: "bullish" | "neutral" | "bearish",
    target_price: 123.45,
    key_points: ["要点1", "要点2"],
    financial_metrics: {...},
    risk_factors: [...],
    confidence: 0.85
  }
}
```

### 2. research-qa-retriever (投研问答检索)
**功能**: 基于向量检索回答投资问题

**使用场景**:
- 基金经理提问
- 研究所领导询问
- 实时问答支持

**参数**:
```javascript
{
  question: string,
  companyId: number
}
```

**返回**:
```javascript
{
  success: true,
  data: {
    answer: "详细回答",
    sources: [
      { id: 123, title: "xxx", relevance: 0.92 }
    ],
    confidence: 0.8
  }
}
```

### 3. risk-monitor (风险监控)
**功能**: 监控持仓公司风险,生成预警

**使用场景**:
- 每日风险扫描
- 重大事件预警
- 持仓管理辅助

## 安装技能

```bash
# 进入OpenClaw容器
docker exec -it openclaw-gateway sh

# 安装技能
openclaw skills install /app/custom-skills/research-document-analyzer.js
openclaw skills install /app/custom-skills/research-qa-retriever.js
openclaw skills install /app/custom-skills/risk-monitor.js

# 验证安装
openclaw skills list
```

## 技能开发指南

### 技能模板

```javascript
module.exports = {
  name: 'your-skill-name',
  description: '技能描述',
  version: '1.0.0',
  
  parameters: {
    param1: {
      type: 'string',
      required: true,
      description: '参数描述'
    }
  },
  
  async execute(params, { llm, logger, http }) {
    logger.info(`执行技能: ${this.name}`);
    
    try {
      // 你的逻辑
      const result = await llm.complete({
        model: 'gpt-4-turbo',
        messages: [...]
      });
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      logger.error(`技能执行失败`, { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
};
```

### 可用工具

在技能的 `execute` 函数中,你可以使用以下工具:

- **llm**: LLM调用接口
  ```javascript
  const response = await llm.complete({
    model: 'gpt-4-turbo',
    messages: [{role: 'user', content: 'Hello'}],
    temperature: 0.3
  });
  ```

- **logger**: 日志记录
  ```javascript
  logger.info('信息日志', { key: 'value' });
  logger.error('错误日志', { error: 'xxx' });
  ```

- **http**: HTTP客户端
  ```javascript
  const response = await http.post('http://backend:8000/api/endpoint', {
    data: {...},
    headers: {'Authorization': 'Bearer xxx'}
  });
  ```

## 注意事项

1. **API密钥安全**: 不要在技能代码中硬编码API密钥,使用环境变量
2. **超时处理**: LLM调用可能耗时较长,设置合理的超时
3. **错误处理**: 始终使用try-catch包裹异步操作
4. **日志记录**: 记录关键步骤和错误,便于调试
5. **返回格式**: 统一返回 `{success, data/error}` 格式

## 技能测试

```bash
# 在OpenClaw容器中测试技能
openclaw skills test research-document-analyzer --params '{"documentContent": "..."}'
```

## 参考资源

- OpenClaw Skills文档: https://docs.openclaw.ai/skills
- 技能市场: https://openclaw.ai/skills
- 社区讨论: https://github.com/openclaw/openclaw/discussions
