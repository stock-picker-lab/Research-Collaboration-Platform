# OpenClaw IM软件集成指南

## 📱 功能概述

通过IM软件集成,用户可以直接在企业微信、钉钉、飞书、Slack等IM工具中与OpenClaw Agent交互,无需打开Web界面即可:

- 🤖 **智能问答** - 随时随地提问投研问题
- 📊 **研报分析** - 一键分析研报内容
- ⚠️ **风险监控** - 实时获取风险预警
- 💡 **投资洞察** - 获取AI生成的投资建议

---

## 🎯 支持的IM平台

| 平台 | 状态 | 优先级 | 使用场景 |
|------|------|--------|---------|
| 企业微信 | ✅ 完全支持 | ⭐⭐⭐ | 企业内部投研团队协作 |
| 钉钉 | ✅ 完全支持 | ⭐⭐⭐ | 企业内部投研团队协作 |
| 飞书 | ✅ 完全支持 | ⭐⭐⭐ | 企业内部投研团队协作 |
| Slack | ✅ 完全支持 | ⭐⭐ | 海外团队协作 |
| Microsoft Teams | 🔄 计划中 | ⭐ | 外企团队协作 |
| Telegram | 🔄 计划中 | ⭐ | 个人使用 |

---

## 🚀 快速开始

### 第一步: 配置环境变量

编辑 `.env.prod` 文件,添加对应IM平台的配置:

```bash
# 企业微信
WECHAT_WORK_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY

# 钉钉
DINGTALK_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send
DINGTALK_ACCESS_TOKEN=your-access-token
DINGTALK_SECRET=your-secret-for-sign

# 飞书
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_HOOK_ID

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX

# 总开关
IM_INTEGRATION_ENABLED=true
```

### 第二步: 配置IM平台Webhook

根据您使用的平台,按照下方详细配置步骤操作。

### 第三步: 测试集成

```bash
# 启动服务
docker compose up -d

# 在IM群聊中测试
@机器人 问答 什么是价值投资?
```

---

## 📋 详细配置步骤

### 1. 企业微信 (WeCom)

#### 1.1 创建群机器人

1. 在企业微信群聊中,点击 **群设置** → **群机器人** → **添加机器人**
2. 设置机器人名称: `投研助手`
3. 复制生成的 **Webhook地址**

#### 1.2 配置Webhook回调

在企业微信管理后台配置:

- **应用管理** → **自建应用** → **机器人**
- **接收消息服务器配置**:
  - URL: `https://your-domain.com/api/v1/im-webhook/wechat-work`
  - Token: 自定义令牌
  - EncodingAESKey: 自动生成或手动填写

#### 1.3 填写环境变量

```bash
WECHAT_WORK_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY
WECHAT_WORK_CORP_ID=ww1234567890abcdef
WECHAT_WORK_AGENT_SECRET=your-agent-secret
```

#### 1.4 测试

在群聊中发送:
```
@投研助手 问答 什么是ROE?
```

---

### 2. 钉钉 (DingTalk)

#### 2.1 创建自定义机器人

1. 进入钉钉群聊 → 右上角 **设置** → **智能群助手** → **添加机器人** → **自定义**
2. 设置机器人名称: `投研助手`
3. **安全设置** 选择 **加签** 方式(推荐)
4. 复制生成的 **Webhook地址** 和 **加签密钥(secret)**

#### 2.2 配置Webhook回调

在钉钉开放平台配置(如需主动推送):

- **开发管理** → **事件订阅**
- 订阅URL: `https://your-domain.com/api/v1/im-webhook/dingtalk`
- 订阅事件: `机器人接收消息`

#### 2.3 填写环境变量

```bash
DINGTALK_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send
DINGTALK_ACCESS_TOKEN=your-access-token
DINGTALK_SECRET=SECxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 2.4 测试

在群聊中发送:
```
@投研助手 分析 研报123
```

---

### 3. 飞书 (Lark/Feishu)

#### 3.1 创建自定义机器人

1. 进入飞书群聊 → 右上角 **设置** → **群机器人** → **添加机器人** → **自定义机器人**
2. 设置机器人名称: `投研助手`
3. **权限配置**:
   - 接收群消息
   - 发送消息
4. 复制生成的 **Webhook地址**

#### 3.2 配置事件订阅(可选)

在飞书开放平台:

- **事件订阅** → **添加事件订阅**
- 请求URL: `https://your-domain.com/api/v1/im-webhook/feishu`
- 订阅事件:
  - `im.message.receive_v1` (接收消息)
  - `im.message.message_read_v1` (消息已读)

#### 3.3 URL验证处理

飞书首次配置时会发送验证请求:

```json
{
  "type": "url_verification",
  "challenge": "ajls384kdjx98XX"
}
```

我们的API会自动返回:

```json
{
  "challenge": "ajls384kdjx98XX"
}
```

#### 3.4 填写环境变量

```bash
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_HOOK_ID
FEISHU_APP_ID=cli_your_app_id
FEISHU_APP_SECRET=your-app-secret
```

#### 3.5 测试

在群聊中发送:
```
@投研助手 风险 公司456
```

---

### 4. Slack

#### 4.1 创建Slack App

1. 访问 [Slack API](https://api.slack.com/apps)
2. 点击 **Create New App** → **From scratch**
3. 设置App名称: `投研助手`
4. 选择工作区

#### 4.2 启用Incoming Webhooks

- **Features** → **Incoming Webhooks** → **Activate**
- 点击 **Add New Webhook to Workspace**
- 选择目标频道
- 复制生成的 **Webhook URL**

#### 4.3 配置Event Subscriptions

- **Features** → **Event Subscriptions** → **Enable Events**
- Request URL: `https://your-domain.com/api/v1/im-webhook/slack`
- 订阅Bot Events:
  - `message.channels`
  - `message.groups`
  - `message.im`

#### 4.4 配置Bot权限

- **Features** → **OAuth & Permissions**
- Bot Token Scopes:
  - `chat:write`
  - `channels:history`
  - `groups:history`
  - `im:history`

#### 4.5 填写环境变量

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX
SLACK_BOT_TOKEN=xoxb-your-bot-token
```

#### 4.6 测试

在Slack频道中发送:
```
@投研助手 洞察 公司789
```

---

## 💬 使用指南

### 支持的指令格式

所有平台统一使用以下指令格式:

```
@机器人 <指令> <参数>
```

### 指令列表

| 指令 | 别名 | 功能 | 示例 |
|------|------|------|------|
| `问答` | `ask`, `问` | 智能问答 | `@机器人 问答 什么是价值投资?` |
| `分析` | `analyze`, `研报` | 分析研报 | `@机器人 分析 研报123` |
| `风险` | `risk`, `监控` | 风险监控 | `@机器人 风险 公司456` |
| `洞察` | `insight`, `投资` | 投资洞察 | `@机器人 洞察 公司789` |

### 使用示例

#### 1. 智能问答

```
用户: @投研助手 问答 什么是ROE指标?

机器人:
### 🤖 智能问答

ROE(Return on Equity,净资产收益率)是衡量公司盈利能力的核心指标...

**置信度:** high

**来源:**
- 《财务分析基础》
- 《价值投资指南》
```

#### 2. 研报分析

```
用户: @投研助手 分析 研报12345

机器人:
### 📊 研报分析

**投资立场:** bullish
**评级:** 买入
**目标价:** ¥88.00

**核心观点:**
- 公司Q4业绩超预期
- 新产品线增长强劲
- 市场份额持续扩大
```

#### 3. 风险监控

```
用户: @投研助手 风险 公司456

机器人:
### ⚠️ 风险监控

**风险等级:** 中等

**风险因素:**
- **财务风险:** 负债率上升至65%
- **市场风险:** 行业竞争加剧
- **政策风险:** 监管政策收紧
```

#### 4. 投资洞察

```
用户: @投研助手 洞察 公司789

机器人:
### 💡 投资洞察

- 公司技术壁垒显著,护城河稳固
- 估值处于历史低位,安全边际充足
- 行业景气度回升,未来3年高增长可期
```

---

## 🔧 高级配置

### 1. 自定义回复格式

修改 `backend/app/services/im_service.py` 中的 `_format_agent_result()` 方法:

```python
def _format_agent_result(self, command: str, result: Dict[str, Any]) -> str:
    # 自定义Markdown格式
    return f"### 自定义标题\n\n{result}"
```

### 2. 添加权限控制

在 `process_im_command()` 中添加用户权限检查:

```python
# 检查用户是否有权限
if im_message.user_id not in ALLOWED_USERS:
    await self._send_message(
        platform=im_message.platform,
        webhook_url=webhook_url,
        content="❌ 您没有权限使用此功能",
    )
    return {"success": False, "error": "Permission denied"}
```

### 3. 添加速率限制

使用Redis实现速率限制:

```python
from redis import Redis

redis_client = Redis(host="redis", port=6379)

# 检查速率限制(每用户每分钟10次)
key = f"rate_limit:{im_message.user_id}"
if redis_client.incr(key) > 10:
    await self._send_message(
        platform=im_message.platform,
        webhook_url=webhook_url,
        content="⏱️ 请求过于频繁,请稍后再试",
    )
    return {"success": False, "error": "Rate limit exceeded"}

redis_client.expire(key, 60)
```

### 4. 添加审计日志

记录所有IM交互:

```python
logger.info(
    "im_command_executed",
    user_id=im_message.user_id,
    platform=im_message.platform,
    command=command,
    query=query,
    success=True,
)
```

---

## 🧪 测试与调试

### 本地测试

使用 `/api/v1/im-webhook/test` 端点测试消息解析:

```bash
curl -X POST http://localhost:8000/api/v1/im-webhook/test?platform=wechat_work \
  -H "Content-Type: application/json" \
  -d '{
    "msgtype": "text",
    "text": {
      "content": "@机器人 问答 什么是价值投资?"
    },
    "from": {
      "userId": "test_user",
      "name": "测试用户"
    },
    "chatId": "test_chat"
  }'
```

### 查看Webhook日志

```bash
# 查看FastAPI日志
docker compose logs -f backend

# 过滤IM相关日志
docker compose logs backend | grep "im_webhook"
```

### 常见问题排查

#### 1. 消息收不到回复

**检查清单:**
- [ ] Webhook URL配置正确
- [ ] 网络防火墙开放端口
- [ ] IM平台验证通过
- [ ] 环境变量配置正确

**排查命令:**
```bash
# 检查Webhook端点可访问性
curl https://your-domain.com/api/v1/im-webhook/status

# 查看日志
docker compose logs backend | tail -100
```

#### 2. 签名验证失败(钉钉)

**原因:** 钉钉的加签算法需要精确匹配。

**解决:**
```python
# 确保secret配置正确
DINGTALK_SECRET=SECxxxxxxxxxxxxx

# 检查时间戳生成
timestamp = str(int(datetime.now().timestamp() * 1000))
```

#### 3. 飞书URL验证失败

**原因:** 首次配置时需要返回challenge。

**解决:**
```python
# 确保代码处理了url_verification事件
if data.get("type") == "url_verification":
    return {"challenge": data.get("challenge")}
```

---

## 📊 API端点

### Webhook接收端点

| 平台 | 端点 | 方法 |
|------|------|------|
| 企业微信 | `/api/v1/im-webhook/wechat-work` | POST |
| 钉钉 | `/api/v1/im-webhook/dingtalk` | POST |
| 飞书 | `/api/v1/im-webhook/feishu` | POST |
| Slack | `/api/v1/im-webhook/slack` | POST |
| 状态检查 | `/api/v1/im-webhook/status` | GET |
| 测试端点 | `/api/v1/im-webhook/test` | POST |

### 完整API文档

访问 `http://localhost:8000/docs` 查看Swagger文档。

---

## 🔒 安全建议

### 1. 使用HTTPS

生产环境必须使用HTTPS,确保通信加密:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api/v1/im-webhook/ {
        proxy_pass http://backend:8000;
    }
}
```

### 2. 启用签名验证

钉钉和企业微信支持签名验证,务必启用:

```python
# 钉钉签名验证
if not self._verify_dingtalk_signature(timestamp, sign, secret):
    raise HTTPException(status_code=401, detail="Invalid signature")
```

### 3. IP白名单

限制只允许IM平台的IP访问:

```nginx
location /api/v1/im-webhook/ {
    # 企业微信IP段
    allow 140.207.54.0/24;
    # 钉钉IP段
    allow 106.15.0.0/16;
    deny all;
}
```

### 4. 速率限制

使用Nginx或Redis实现速率限制:

```nginx
limit_req_zone $binary_remote_addr zone=im_webhook:10m rate=10r/m;

location /api/v1/im-webhook/ {
    limit_req zone=im_webhook burst=5 nodelay;
}
```

---

## 📈 监控与告警

### 1. Prometheus指标

```python
from prometheus_client import Counter, Histogram

im_requests_total = Counter(
    'im_requests_total',
    'Total IM webhook requests',
    ['platform', 'command', 'status']
)

im_response_time = Histogram(
    'im_response_time_seconds',
    'IM webhook response time',
    ['platform', 'command']
)
```

### 2. 告警规则

```yaml
groups:
  - name: im_integration
    rules:
      - alert: IMWebhookHighErrorRate
        expr: rate(im_requests_total{status="error"}[5m]) > 0.1
        annotations:
          summary: "IM Webhook错误率过高"
```

---

## 📚 参考文档

### 官方文档链接

- [企业微信机器人开发](https://developer.work.weixin.qq.com/document/path/91770)
- [钉钉自定义机器人](https://open.dingtalk.com/document/orgapp/custom-robot-access)
- [飞书机器人开发](https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot)
- [Slack Bot开发](https://api.slack.com/bot-users)

---

## 🎉 总结

IM软件集成是OpenClaw平台的**重要能力增强**,使投研团队可以:

- ✅ 随时随地与AI Agent交互
- ✅ 无需打开Web界面
- ✅ 在熟悉的IM工具中工作
- ✅ 实时接收风险预警
- ✅ 团队协作更加高效

**立即配置您的IM平台,开启智能投研新体验!** 🚀
