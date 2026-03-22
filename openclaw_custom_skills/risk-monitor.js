/**
 * OpenClaw Custom Skill: 风险监控预警
 * 监控公司基本面、市场舆情等风险因素
 */

const axios = require('axios');

module.exports = {
  name: 'risk-monitor',
  description: '监控公司风险因素,生成风险预警和操作建议',
  
  parameters: {
    type: 'object',
    properties: {
      company_id: {
        type: 'integer',
        description: '公司ID'
      },
      company_name: {
        type: 'string',
        description: '公司名称'
      },
      risk_types: {
        type: 'array',
        items: { type: 'string' },
        description: '监控的风险类型',
        default: ['financial', 'operational', 'market', 'regulatory', 'reputation']
      },
      time_window_days: {
        type: 'integer',
        description: '监控时间窗口(天)',
        default: 30
      },
      backend_api_url: {
        type: 'string',
        default: process.env.BACKEND_API_URL || 'http://backend:8000'
      }
    },
    required: ['company_id', 'company_name']
  },

  async execute(args, context) {
    const { company_id, company_name, risk_types, time_window_days, backend_api_url } = args;
    const { llm, logger } = context;

    try {
      logger.info(`开始监控${company_name}的风险因素...`);

      // Step 1: 从后端获取公司最近的数据
      let companyData = {};
      try {
        const dataResponse = await axios.get(
          `${backend_api_url}/api/v1/companies/${company_id}/risk-data`,
          {
            headers: { 'Authorization': `Bearer ${process.env.BACKEND_API_KEY}` },
            params: { days: time_window_days },
            timeout: 10000
          }
        );
        companyData = dataResponse.data;
        logger.info('获取公司数据成功');
      } catch (dataError) {
        logger.warn('获取公司数据失败,使用模拟数据:', dataError.message);
        companyData = {
          recent_docs: [],
          financial_metrics: {},
          news_sentiment: { positive: 0, neutral: 0, negative: 0 }
        };
      }

      // Step 2: 构建风险分析提示词
      const prompt = `
你是一位风险管理专家。请分析以下公司的风险状况:

**公司信息:**
- 名称: ${company_name}
- 监控周期: 最近${time_window_days}天
- 关注风险类型: ${risk_types.join(', ')}

**数据概况:**
- 相关文档数: ${companyData.recent_docs?.length || 0}
- 财务指标: ${JSON.stringify(companyData.financial_metrics || {})}
- 新闻情绪: 正面${companyData.news_sentiment?.positive || 0}条, 负面${companyData.news_sentiment?.negative || 0}条

**最近重要事件/文档:**
${companyData.recent_docs?.slice(0, 5).map(doc => 
  `- [${doc.type}] ${doc.title} (${doc.date})`
).join('\n') || '无'}

**分析要求:**
请识别潜在风险因素,并按优先级排序。输出JSON格式:

\`\`\`json
{
  "overall_risk_level": "low/medium/high/critical",
  "risk_alerts": [
    {
      "risk_type": "financial/operational/market/regulatory/reputation",
      "severity": "low/medium/high",
      "title": "风险标题",
      "description": "风险详细描述",
      "evidence": "支持证据或数据来源",
      "potential_impact": "潜在影响评估",
      "recommended_action": "建议采取的行动"
    }
  ],
  "positive_signals": [
    "积极信号1",
    "积极信号2"
  ],
  "monitoring_suggestions": [
    "建议持续监控的指标1",
    "建议持续监控的指标2"
  ],
  "summary": "风险状况总结(150字以内)"
}
\`\`\`

**注意:**
1. 优先关注${risk_types.join('、')}类风险
2. 基于实际数据进行判断,避免过度解读
3. 如果数据不足,请明确说明
`;

      // Step 3: 调用LLM进行风险分析
      const response = await llm.chat({
        messages: [
          { role: 'system', content: '你是专业的风险管理专家,擅长识别企业经营和投资风险。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      // 解析JSON
      let riskAnalysis;
      try {
        const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
        riskAnalysis = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(response.content);
      } catch (parseError) {
        logger.error('JSON解析失败', parseError);
        riskAnalysis = {
          overall_risk_level: 'unknown',
          risk_alerts: [],
          summary: response.content.substring(0, 300)
        };
      }

      logger.info(`风险监控完成,风险等级: ${riskAnalysis.overall_risk_level}`);

      return {
        success: true,
        data: {
          ...riskAnalysis,
          company_id,
          company_name,
          analyzed_period: `${time_window_days}天`,
          analyzed_at: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('风险监控失败:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
};
