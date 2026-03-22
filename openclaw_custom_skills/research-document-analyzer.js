/**
 * OpenClaw Custom Skill: 研报智能分析器
 * 用于分析投资研究报告,提取核心观点和投资建议
 */

const axios = require('axios');

module.exports = {
  name: 'research-document-analyzer',
  description: '分析投资研报,提取核心观点、投资评级、目标价、风险因素',
  
  // 技能参数定义
  parameters: {
    type: 'object',
    properties: {
      document_content: {
        type: 'string',
        description: '研报文本内容(完整或摘要)'
      },
      company_name: {
        type: 'string',
        description: '公司名称'
      },
      company_code: {
        type: 'string',
        description: '股票代码'
      },
      analysis_focus: {
        type: 'array',
        items: { type: 'string' },
        description: '分析重点领域',
        default: ['valuation', 'growth', 'risk', 'competition']
      }
    },
    required: ['document_content', 'company_name']
  },

  // 技能执行函数
  async execute(args, context) {
    const { document_content, company_name, company_code, analysis_focus } = args;
    const { llm, logger } = context;

    try {
      logger.info(`开始分析${company_name}(${company_code})的研报...`);

      // 构建分析提示词
      const prompt = `
你是一位资深的投资分析师。请分析以下投资研报,提取关键信息:

**公司信息:**
- 公司名称: ${company_name}
- 股票代码: ${company_code || '未提供'}

**研报内容:**
${document_content}

**分析要求:**
请按照以下JSON格式输出分析结果:

\`\`\`json
{
  "summary": "研报核心内容摘要(200字以内)",
  "investment_stance": "bullish/neutral/bearish",
  "rating": "买入/增持/中性/减持/卖出",
  "target_price": "目标价(数字,无货币符号)",
  "key_points": [
    "核心观点1",
    "核心观点2",
    "核心观点3"
  ],
  "financial_highlights": {
    "revenue": "营收数据及增长率",
    "profit": "净利润数据及增长率",
    "margins": "利润率数据",
    "other_metrics": "其他重要财务指标"
  },
  "risk_factors": [
    "风险因素1",
    "风险因素2"
  ],
  "catalysts": [
    "催化剂1",
    "催化剂2"
  ],
  "analyst_confidence": "high/medium/low",
  "tags": ["行业标签", "主题标签"]
}
\`\`\`

**注意:**
1. 如果某些信息在研报中未提及,请填写"未提及"
2. 数字尽量保留原始数据
3. 保持客观中立,准确提取研报观点
4. 重点关注: ${analysis_focus.join(', ')}
`;

      // 调用LLM进行分析
      const response = await llm.chat({
        messages: [
          { role: 'system', content: '你是专业的投资分析师,擅长解读研报并提取结构化信息。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // 低温度保证输出稳定
        max_tokens: 2000
      });

      // 解析LLM返回的JSON
      let analysisResult;
      try {
        const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[1]);
        } else {
          analysisResult = JSON.parse(response.content);
        }
      } catch (parseError) {
        logger.error('JSON解析失败,返回原始内容', parseError);
        analysisResult = {
          summary: response.content.substring(0, 500),
          raw_response: response.content
        };
      }

      logger.info(`研报分析完成: ${analysisResult.investment_stance}`);

      return {
        success: true,
        data: {
          ...analysisResult,
          analyzed_at: new Date().toISOString(),
          company_name,
          company_code
        }
      };

    } catch (error) {
      logger.error('研报分析失败:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
};
