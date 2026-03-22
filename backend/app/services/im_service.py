"""
投研协作平台 - IM软件集成服务
支持企业微信、钉钉、飞书、Slack等IM平台与OpenClaw Agent交互
"""
from __future__ import annotations

import json
import hmac
import hashlib
import base64
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from enum import Enum

import httpx
import structlog

from app.core.config import settings
from app.services.agent_service import AgentService

logger = structlog.get_logger()


class IMPlatform(str, Enum):
    """IM平台类型"""
    WECHAT_WORK = "wechat_work"  # 企业微信
    DINGTALK = "dingtalk"        # 钉钉
    FEISHU = "feishu"            # 飞书
    SLACK = "slack"              # Slack
    TEAMS = "teams"              # Microsoft Teams
    TELEGRAM = "telegram"        # Telegram


class IMMessage:
    """IM消息统一模型"""
    def __init__(
        self,
        platform: IMPlatform,
        message_id: str,
        user_id: str,
        username: str,
        content: str,
        chat_id: str,
        chat_type: str = "group",  # group/private
        raw_data: Optional[Dict[str, Any]] = None,
    ):
        self.platform = platform
        self.message_id = message_id
        self.user_id = user_id
        self.username = username
        self.content = content
        self.chat_id = chat_id
        self.chat_type = chat_type
        self.raw_data = raw_data or {}
        self.timestamp = datetime.now(timezone.utc)


class IMService:
    """IM软件集成服务"""

    def __init__(self):
        self.agent_service = AgentService()
        self.http_client = httpx.AsyncClient(timeout=30.0)

    # ==================== 企业微信集成 ====================

    async def parse_wechat_work_message(self, webhook_data: Dict[str, Any]) -> Optional[IMMessage]:
        """解析企业微信Webhook消息"""
        try:
            # 企业微信消息格式: https://developer.work.weixin.qq.com/document/path/90236
            msg_type = webhook_data.get("msgtype")
            if msg_type != "text":
                return None

            content = webhook_data.get("text", {}).get("content", "")
            webhook_data_inner = webhook_data.get("webhook", {})

            return IMMessage(
                platform=IMPlatform.WECHAT_WORK,
                message_id=webhook_data.get("msgId", ""),
                user_id=webhook_data.get("from", {}).get("userId", ""),
                username=webhook_data.get("from", {}).get("name", ""),
                content=content,
                chat_id=webhook_data.get("chatId", ""),
                chat_type=webhook_data.get("chatType", "group"),
                raw_data=webhook_data,
            )
        except Exception as e:
            logger.error("parse_wechat_work_message_failed", error=str(e))
            return None

    async def send_wechat_work_message(
        self,
        webhook_url: str,
        content: str,
        mentioned_list: Optional[List[str]] = None,
    ) -> bool:
        """发送企业微信消息"""
        try:
            payload = {
                "msgtype": "markdown",
                "markdown": {
                    "content": content,
                },
            }
            if mentioned_list:
                payload["markdown"]["mentioned_list"] = mentioned_list

            response = await self.http_client.post(webhook_url, json=payload)
            result = response.json()
            return result.get("errcode") == 0
        except Exception as e:
            logger.error("send_wechat_work_message_failed", error=str(e))
            return False

    # ==================== 钉钉集成 ====================

    async def parse_dingtalk_message(self, webhook_data: Dict[str, Any]) -> Optional[IMMessage]:
        """解析钉钉Webhook消息"""
        try:
            # 钉钉消息格式: https://open.dingtalk.com/document/orgapp/robot-message-types-and-data-format
            msg_type = webhook_data.get("msgtype")
            if msg_type != "text":
                return None

            content = webhook_data.get("text", {}).get("content", "")
            sender = webhook_data.get("senderStaffId", "")

            return IMMessage(
                platform=IMPlatform.DINGTALK,
                message_id=webhook_data.get("msgId", ""),
                user_id=sender,
                username=webhook_data.get("senderNick", ""),
                content=content,
                chat_id=webhook_data.get("conversationId", ""),
                chat_type=webhook_data.get("conversationType", "2"),  # 1=私聊,2=群聊
                raw_data=webhook_data,
            )
        except Exception as e:
            logger.error("parse_dingtalk_message_failed", error=str(e))
            return None

    async def send_dingtalk_message(
        self,
        webhook_url: str,
        access_token: str,
        secret: str,
        content: str,
        at_mobiles: Optional[List[str]] = None,
    ) -> bool:
        """发送钉钉消息(带签名)"""
        try:
            # 计算签名
            timestamp = str(int(datetime.now().timestamp() * 1000))
            sign = self._generate_dingtalk_sign(timestamp, secret)

            # 构造请求
            url = f"{webhook_url}?access_token={access_token}&timestamp={timestamp}&sign={sign}"
            payload = {
                "msgtype": "markdown",
                "markdown": {
                    "title": "OpenClaw Agent通知",
                    "text": content,
                },
                "at": {
                    "atMobiles": at_mobiles or [],
                    "isAtAll": False,
                },
            }

            response = await self.http_client.post(url, json=payload)
            result = response.json()
            return result.get("errcode") == 0
        except Exception as e:
            logger.error("send_dingtalk_message_failed", error=str(e))
            return False

    def _generate_dingtalk_sign(self, timestamp: str, secret: str) -> str:
        """生成钉钉签名"""
        string_to_sign = f"{timestamp}\n{secret}"
        hmac_code = hmac.new(
            secret.encode("utf-8"),
            string_to_sign.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()
        return base64.b64encode(hmac_code).decode("utf-8")

    # ==================== 飞书集成 ====================

    async def parse_feishu_message(self, webhook_data: Dict[str, Any]) -> Optional[IMMessage]:
        """解析飞书Webhook消息"""
        try:
            # 飞书消息格式: https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot
            event = webhook_data.get("event", {})
            message = event.get("message", {})

            content = message.get("content", "")
            if message.get("message_type") == "text":
                content = json.loads(content).get("text", "")

            return IMMessage(
                platform=IMPlatform.FEISHU,
                message_id=message.get("message_id", ""),
                user_id=event.get("sender", {}).get("sender_id", {}).get("user_id", ""),
                username=event.get("sender", {}).get("sender_id", {}).get("user_id", ""),
                content=content,
                chat_id=message.get("chat_id", ""),
                chat_type=message.get("chat_type", "group"),
                raw_data=webhook_data,
            )
        except Exception as e:
            logger.error("parse_feishu_message_failed", error=str(e))
            return None

    async def send_feishu_message(
        self,
        webhook_url: str,
        content: str,
        msg_type: str = "text",
    ) -> bool:
        """发送飞书消息"""
        try:
            payload = {
                "msg_type": msg_type,
            }

            if msg_type == "text":
                payload["content"] = json.dumps({"text": content})
            elif msg_type == "post":
                payload["content"] = content  # 富文本格式

            response = await self.http_client.post(webhook_url, json=payload)
            result = response.json()
            return result.get("code") == 0
        except Exception as e:
            logger.error("send_feishu_message_failed", error=str(e))
            return False

    # ==================== Slack集成 ====================

    async def parse_slack_message(self, webhook_data: Dict[str, Any]) -> Optional[IMMessage]:
        """解析Slack消息"""
        try:
            event = webhook_data.get("event", {})
            if event.get("type") != "message":
                return None

            return IMMessage(
                platform=IMPlatform.SLACK,
                message_id=event.get("client_msg_id", ""),
                user_id=event.get("user", ""),
                username=event.get("username", ""),
                content=event.get("text", ""),
                chat_id=event.get("channel", ""),
                chat_type="channel",
                raw_data=webhook_data,
            )
        except Exception as e:
            logger.error("parse_slack_message_failed", error=str(e))
            return None

    async def send_slack_message(
        self,
        webhook_url: str,
        content: str,
        channel: Optional[str] = None,
    ) -> bool:
        """发送Slack消息"""
        try:
            payload = {
                "text": content,
                "mrkdwn": True,
            }
            if channel:
                payload["channel"] = channel

            response = await self.http_client.post(webhook_url, json=payload)
            return response.status_code == 200
        except Exception as e:
            logger.error("send_slack_message_failed", error=str(e))
            return False

    # ==================== 统一消息处理 ====================

    async def process_im_command(
        self,
        im_message: IMMessage,
        webhook_url: str,
        platform_config: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        处理IM指令并调用OpenClaw Agent
        
        支持的指令格式:
        - @机器人 问答 什么是价值投资?
        - @机器人 分析 研报123
        - @机器人 风险 公司456
        - @机器人 洞察 公司456
        """
        try:
            content = im_message.content.strip()
            
            # 移除@机器人前缀
            if content.startswith("@"):
                content = content.split(maxsplit=1)[1].strip()

            # 解析指令
            parts = content.split(maxsplit=1)
            if len(parts) < 2:
                await self._send_help_message(im_message.platform, webhook_url, platform_config)
                return {"success": False, "error": "指令格式错误"}

            command, query = parts[0], parts[1]

            # 路由到不同的Agent
            agent_result = None
            if command in ["问答", "ask", "问"]:
                agent_result = await self.agent_service.ask_question(
                    question=query,
                    company_id=None,
                )
            elif command in ["分析", "analyze", "研报"]:
                # 提取文档ID (假设格式: "研报123" 或 "doc_id=123")
                doc_id = self._extract_id(query)
                if doc_id:
                    agent_result = await self.agent_service.analyze_document(document_id=doc_id)
            elif command in ["风险", "risk", "监控"]:
                company_id = self._extract_id(query)
                if company_id:
                    agent_result = await self.agent_service.monitor_risk(company_id=company_id)
            elif command in ["洞察", "insight", "投资"]:
                company_id = self._extract_id(query)
                if company_id:
                    agent_result = await self.agent_service.generate_insight(company_id=company_id)
            else:
                await self._send_help_message(im_message.platform, webhook_url, platform_config)
                return {"success": False, "error": "未知指令"}

            # 格式化并发送结果
            if agent_result:
                formatted_message = self._format_agent_result(command, agent_result)
                await self._send_message(
                    platform=im_message.platform,
                    webhook_url=webhook_url,
                    content=formatted_message,
                    platform_config=platform_config,
                )
                return {"success": True, "result": agent_result}
            else:
                error_msg = "❌ Agent执行失败,请稍后重试"
                await self._send_message(
                    platform=im_message.platform,
                    webhook_url=webhook_url,
                    content=error_msg,
                    platform_config=platform_config,
                )
                return {"success": False, "error": "Agent执行失败"}

        except Exception as e:
            logger.error("process_im_command_failed", error=str(e), message=im_message.content)
            error_msg = f"❌ 处理失败: {str(e)}"
            await self._send_message(
                platform=im_message.platform,
                webhook_url=webhook_url,
                content=error_msg,
                platform_config=platform_config,
            )
            return {"success": False, "error": str(e)}

    def _extract_id(self, text: str) -> Optional[int]:
        """从文本中提取ID"""
        import re
        match = re.search(r'\d+', text)
        return int(match.group()) if match else None

    def _format_agent_result(self, command: str, result: Dict[str, Any]) -> str:
        """格式化Agent结果为Markdown"""
        if command in ["问答", "ask", "问"]:
            answer = result.get("answer", "")
            confidence = result.get("confidence_level", "medium")
            citations = result.get("citations", [])
            
            message = f"### 🤖 智能问答\n\n{answer}\n\n"
            message += f"**置信度:** {confidence}\n\n"
            if citations:
                message += "**来源:**\n"
                for cite in citations[:3]:
                    message += f"- {cite.get('title', '')}\n"
            return message

        elif command in ["分析", "analyze", "研报"]:
            sentiment = result.get("sentiment", {})
            key_points = result.get("key_points", [])
            
            message = f"### 📊 研报分析\n\n"
            message += f"**投资立场:** {sentiment.get('stance', 'N/A')}\n"
            message += f"**评级:** {sentiment.get('rating', 'N/A')}\n"
            message += f"**目标价:** {sentiment.get('target_price', 'N/A')}\n\n"
            message += "**核心观点:**\n"
            for point in key_points[:5]:
                message += f"- {point}\n"
            return message

        elif command in ["风险", "risk", "监控"]:
            risk_level = result.get("risk_level", "未知")
            risk_factors = result.get("risk_factors", [])
            
            message = f"### ⚠️ 风险监控\n\n"
            message += f"**风险等级:** {risk_level}\n\n"
            message += "**风险因素:**\n"
            for factor in risk_factors[:5]:
                category = factor.get("category", "")
                description = factor.get("description", "")
                message += f"- **{category}:** {description}\n"
            return message

        elif command in ["洞察", "insight", "投资"]:
            insights = result.get("insights", [])
            
            message = f"### 💡 投资洞察\n\n"
            for insight in insights[:5]:
                message += f"- {insight}\n"
            return message

        return "✅ 执行成功"

    async def _send_help_message(
        self,
        platform: IMPlatform,
        webhook_url: str,
        platform_config: Optional[Dict[str, Any]],
    ):
        """发送帮助信息"""
        help_text = """### 🤖 OpenClaw Agent 使用指南

**支持的指令:**
- `@机器人 问答 <问题>` - 智能问答
- `@机器人 分析 <研报ID>` - 研报分析
- `@机器人 风险 <公司ID>` - 风险监控
- `@机器人 洞察 <公司ID>` - 投资洞察

**示例:**
```
@机器人 问答 什么是价值投资?
@机器人 分析 研报123
@机器人 风险 公司456
```
"""
        await self._send_message(platform, webhook_url, help_text, platform_config)

    async def _send_message(
        self,
        platform: IMPlatform,
        webhook_url: str,
        content: str,
        platform_config: Optional[Dict[str, Any]] = None,
    ):
        """统一的消息发送接口"""
        platform_config = platform_config or {}

        if platform == IMPlatform.WECHAT_WORK:
            await self.send_wechat_work_message(webhook_url, content)
        elif platform == IMPlatform.DINGTALK:
            await self.send_dingtalk_message(
                webhook_url=webhook_url,
                access_token=platform_config.get("access_token", ""),
                secret=platform_config.get("secret", ""),
                content=content,
            )
        elif platform == IMPlatform.FEISHU:
            await self.send_feishu_message(webhook_url, content, msg_type="text")
        elif platform == IMPlatform.SLACK:
            await self.send_slack_message(webhook_url, content)

    async def close(self):
        """关闭HTTP客户端"""
        await self.http_client.aclose()


# 单例
_im_service_instance: Optional[IMService] = None


def get_im_service() -> IMService:
    """获取IM服务单例"""
    global _im_service_instance
    if _im_service_instance is None:
        _im_service_instance = IMService()
    return _im_service_instance
