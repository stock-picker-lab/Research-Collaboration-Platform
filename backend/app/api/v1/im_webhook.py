"""
投研协作平台 - IM Webhook API
接收企业微信、钉钉、飞书等IM平台的消息回调
"""
from fastapi import APIRouter, Request, HTTPException, Header, BackgroundTasks
from typing import Optional, Dict, Any
import structlog

from app.services.im_service import get_im_service, IMPlatform
from app.core.config import settings

logger = structlog.get_logger()
router = APIRouter()


@router.post("/wechat-work")
async def wechat_work_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    企业微信Webhook接收端点
    
    文档: https://developer.work.weixin.qq.com/document/path/90236
    
    配置路径: 企业微信管理后台 -> 应用管理 -> 机器人 -> Webhook地址
    """
    try:
        data = await request.json()
        logger.info("received_wechat_work_webhook", data=data)

        im_service = get_im_service()
        im_message = await im_service.parse_wechat_work_message(data)
        
        if not im_message:
            return {"errcode": 0, "errmsg": "ok"}

        # 后台异步处理
        webhook_url = getattr(settings, "WECHAT_WORK_WEBHOOK_URL", "")
        background_tasks.add_task(
            im_service.process_im_command,
            im_message,
            webhook_url,
        )

        return {"errcode": 0, "errmsg": "ok"}

    except Exception as e:
        logger.error("wechat_work_webhook_failed", error=str(e))
        return {"errcode": -1, "errmsg": str(e)}


@router.post("/dingtalk")
async def dingtalk_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    timestamp: Optional[str] = Header(None),
    sign: Optional[str] = Header(None),
):
    """
    钉钉Webhook接收端点
    
    文档: https://open.dingtalk.com/document/orgapp/robot-message-types-and-data-format
    
    配置路径: 钉钉管理后台 -> 智能群助手 -> 自定义机器人 -> Webhook地址
    """
    try:
        data = await request.json()
        logger.info("received_dingtalk_webhook", data=data)

        im_service = get_im_service()
        im_message = await im_service.parse_dingtalk_message(data)
        
        if not im_message:
            return {"errcode": 0, "errmsg": "ok"}

        # 后台异步处理
        webhook_url = getattr(settings, "DINGTALK_WEBHOOK_URL", "")
        platform_config = {
            "access_token": getattr(settings, "DINGTALK_ACCESS_TOKEN", ""),
            "secret": getattr(settings, "DINGTALK_SECRET", ""),
        }
        background_tasks.add_task(
            im_service.process_im_command,
            im_message,
            webhook_url,
            platform_config,
        )

        return {"errcode": 0, "errmsg": "ok"}

    except Exception as e:
        logger.error("dingtalk_webhook_failed", error=str(e))
        return {"errcode": -1, "errmsg": str(e)}


@router.post("/feishu")
async def feishu_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    飞书Webhook接收端点
    
    文档: https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot
    
    配置路径: 飞书管理后台 -> 应用管理 -> 机器人 -> Webhook地址
    """
    try:
        data = await request.json()
        logger.info("received_feishu_webhook", data=data)

        # 处理飞书的URL验证请求
        if data.get("type") == "url_verification":
            return {"challenge": data.get("challenge")}

        im_service = get_im_service()
        im_message = await im_service.parse_feishu_message(data)
        
        if not im_message:
            return {"code": 0, "msg": "ok"}

        # 后台异步处理
        webhook_url = getattr(settings, "FEISHU_WEBHOOK_URL", "")
        background_tasks.add_task(
            im_service.process_im_command,
            im_message,
            webhook_url,
        )

        return {"code": 0, "msg": "ok"}

    except Exception as e:
        logger.error("feishu_webhook_failed", error=str(e))
        return {"code": -1, "msg": str(e)}


@router.post("/slack")
async def slack_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Slack Webhook接收端点
    
    文档: https://api.slack.com/messaging/webhooks
    
    配置路径: Slack App管理 -> Event Subscriptions -> Request URL
    """
    try:
        data = await request.json()
        logger.info("received_slack_webhook", data=data)

        # 处理Slack的URL验证请求
        if data.get("type") == "url_verification":
            return {"challenge": data.get("challenge")}

        im_service = get_im_service()
        im_message = await im_service.parse_slack_message(data)
        
        if not im_message:
            return {"ok": True}

        # 后台异步处理
        webhook_url = getattr(settings, "SLACK_WEBHOOK_URL", "")
        background_tasks.add_task(
            im_service.process_im_command,
            im_message,
            webhook_url,
        )

        return {"ok": True}

    except Exception as e:
        logger.error("slack_webhook_failed", error=str(e))
        return {"ok": False, "error": str(e)}


@router.get("/status")
async def webhook_status():
    """Webhook服务状态检查"""
    return {
        "status": "healthy",
        "supported_platforms": [
            "wechat_work",
            "dingtalk",
            "feishu",
            "slack",
        ],
        "endpoints": {
            "wechat_work": "/api/v1/im-webhook/wechat-work",
            "dingtalk": "/api/v1/im-webhook/dingtalk",
            "feishu": "/api/v1/im-webhook/feishu",
            "slack": "/api/v1/im-webhook/slack",
        },
    }


@router.post("/test")
async def test_webhook(
    request: Request,
    platform: str,
):
    """
    测试Webhook功能
    
    用于本地开发和调试
    """
    try:
        data = await request.json()
        im_service = get_im_service()

        if platform == "wechat_work":
            im_message = await im_service.parse_wechat_work_message(data)
        elif platform == "dingtalk":
            im_message = await im_service.parse_dingtalk_message(data)
        elif platform == "feishu":
            im_message = await im_service.parse_feishu_message(data)
        elif platform == "slack":
            im_message = await im_service.parse_slack_message(data)
        else:
            raise HTTPException(status_code=400, detail="Unsupported platform")

        if not im_message:
            return {"success": False, "error": "Failed to parse message"}

        # 模拟Webhook URL
        test_webhook_url = "https://example.com/webhook"
        result = await im_service.process_im_command(im_message, test_webhook_url)

        return {
            "success": True,
            "parsed_message": {
                "platform": im_message.platform,
                "user_id": im_message.user_id,
                "content": im_message.content,
            },
            "agent_result": result,
        }

    except Exception as e:
        logger.error("test_webhook_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
