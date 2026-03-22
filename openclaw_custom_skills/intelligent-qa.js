/**
 * OpenClaw Custom Skill: 智能问答系统
 * 基于RAG(检索增强生成)的投资问答
 */

const axios = require('axios');

module.exports = {
  name: 'intelligent-qa',
  description: '基于向量检索的智能投资问答系统,支持RAG增强',
  
  parameters: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: '用户提出的问题'
      },
      company_id: {
        type: 'integer',
        description: '公司ID(可选,用于限定检索范围)'
      },
      doc_types: {
        type: 'array',
        items: { type: 'string' },
        description: '文档类型过滤',
        default: ['research_report', 'financial_statement', 'news']
      },
      top_k: {
        type: 'integer',
        description: '检索相关文档数量',
        default: 5
      },
      backend_api_url: {
        type: 'string',
        description: 'FastAPI后端URL',
        default: process.env.BACKEND_API_URL || 'http://backend:8000'
      }
    },
    required: ['question']
  },

  async execute(args, context) {
    const { question, company_id, doc_types, top_k, backend_api_url } = args;
    const { llm, logger } = context;

    try {
      logger.info(`处理问题: ${question}`);

      // Step 1: 调用FastAPI后端进行向量检索
      let relevantDocs = [];
      try {
        const searchResponse = await axios.post(
          `${backend_api_url}/api/v1/search/semantic`,
          {
            query: question,
            company_id,
            doc_types,
            top_k
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        relevantDocs = searchResponse.data.results || [];
        logger.info(`检索到${relevantDocs.length}个相关文档`);
      } catch (searchError) {
        logger.warn('向量检索失败,使用无检索模式:', searchError.message);
      }

      // Step 2: 构建RAG提示词
      const contextText = relevantDocs.length > 0
        ? relevantDocs.map((doc, idx) => 
            `[文档${idx + 1}] ${doc.title}\n内容: ${doc.content.substring(0, 500)}...\n来源: ${doc.source_type}`
          ).join('\n\n')
        : '(无相关文档)';

      const prompt = `
你是一位专业的投资顾问助手。请基于以下检索到的文档信息,回答用户的问题。

**用户问题:**
${question}

**相关文档信息:**
${contextText}

**回答要求:**
1. 优先使用检索到的文档信息回答
2. 如果文档信息不足,可以补充你的专业知识,但要明确标注
3. 保持客观中立,不做投资建议(除非文档中有明确建议)
4. 标注信息来源(引用哪个文档)
5. 如果无法准确回答,请诚实说明

请按以下JSON格式输出:

\`\`\`json
{
  "answer": "详细回答(200-500字)",
  "sources": [
    {
      "doc_index": 1,
      "relevance": "high/medium/low",
      "key_info": "该文档提供的关键信息"
    }
  ],
  "confidence": "high/medium/low",
  "follow_up_questions": [
    "建议的追问1",
    "建议的追问2"
  ],
  "disclaimer": "免责声明(如适用)"
}
\`\`\`
`;

      // Step 3: 调用LLM生成回答
      const response = await llm.chat({
        messages: [
          { role: 'system', content: '你是专业的投资顾问助手,擅长基于研报和财务数据回答投资相关问题。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500
      });

      // 解析JSON响应
      let qaResult;
      try {
        const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
        qaResult = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(response.content);
      } catch (parseError) {
        logger.error('JSON解析失败', parseError);
        qaResult = {
          answer: response.content,
          sources: [],
          confidence: 'low'
        };
      }

      logger.info('问答完成');

      return {
        success: true,
        data: {
          ...qaResult,
          question,
          retrieved_docs_count: relevantDocs.length,
          answered_at: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('问答处理失败:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
};
