"""
投研协作平台 - 事件总线 (Redis Pub/Sub)
支撑预警推送、假设验证、关联提醒等事件驱动功能
"""
import json
import asyncio
from typing import Callable, Dict, List, Optional
from datetime import datetime, timezone

import redis.asyncio as redis
from app.core.config import settings

import structlog

logger = structlog.get_logger()


# ============================================
# 事件类型定义
# ============================================

class EventTypes:
    """系统事件类型常量"""
    # 文档事件
    DOCUMENT_CREATED = "document.created"
    DOCUMENT_ANALYZED = "document.analyzed"

    # 结论卡事件
    CONCLUSION_UPDATED = "conclusion.updated"
    CONCLUSION_STANCE_CHANGED = "conclusion.stance_changed"

    # 假设事件
    ASSUMPTION_VERIFIED = "assumption.verified"
    ASSUMPTION_BROKEN = "assumption.broken"
    ASSUMPTION_DEVIATION = "assumption.deviation"

    # 问题事件
    QUESTION_CREATED = "question.created"
    QUESTION_ANSWERED = "question.answered"

    # 预警事件
    ALERT_GENERATED = "alert.generated"
    ALERT_P0 = "alert.p0"
    ALERT_P1 = "alert.p1"

    # 任务事件
    TASK_CREATED = "task.created"
    TASK_COMPLETED = "task.completed"
    TASK_OVERDUE = "task.overdue"

    # 关联事件
    SUPPLY_CHAIN_EVENT = "supply_chain.event"
    PEER_MAJOR_EVENT = "peer.major_event"


# ============================================
# 事件总线
# ============================================

class EventBus:
    """基于 Redis Pub/Sub 的事件总线"""

    def __init__(self):
        self._redis: Optional[redis.Redis] = None
        self._handlers: Dict[str, List[Callable]] = {}
        self._pubsub = None
        self._listener_task: Optional[asyncio.Task] = None

    async def connect(self):
        """连接 Redis"""
        self._redis = redis.from_url(
            settings.REDIS_URL,
            db=settings.REDIS_EVENT_BUS_DB,
            decode_responses=True,
        )
        self._pubsub = self._redis.pubsub()
        logger.info("EventBus connected to Redis")

    async def disconnect(self):
        """断开连接"""
        if self._listener_task:
            self._listener_task.cancel()
        if self._pubsub:
            await self._pubsub.unsubscribe()
            await self._pubsub.close()
        if self._redis:
            await self._redis.close()
        logger.info("EventBus disconnected")

    async def publish(self, event_type: str, data: dict):
        """发布事件"""
        if not self._redis:
            logger.warning("EventBus not connected, skipping publish", event_type=event_type)
            return

        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await self._redis.publish(f"events:{event_type}", json.dumps(event, default=str))
        logger.info("Event published", event_type=event_type)

    def subscribe(self, event_type: str, handler: Callable):
        """订阅事件"""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
        logger.info("Handler subscribed", event_type=event_type, handler=handler.__name__)

    async def start_listening(self):
        """启动事件监听"""
        if not self._pubsub:
            return

        # 订阅所有已注册的事件频道
        channels = [f"events:{et}" for et in self._handlers.keys()]
        if channels:
            await self._pubsub.subscribe(*channels)

        self._listener_task = asyncio.create_task(self._listen())
        logger.info("EventBus listener started", channels=channels)

    async def _listen(self):
        """监听并分发事件"""
        try:
            async for message in self._pubsub.listen():
                if message["type"] == "message":
                    try:
                        event = json.loads(message["data"])
                        event_type = event.get("type")
                        handlers = self._handlers.get(event_type, [])
                        for handler in handlers:
                            try:
                                if asyncio.iscoroutinefunction(handler):
                                    await handler(event)
                                else:
                                    handler(event)
                            except Exception as e:
                                logger.error(
                                    "Event handler error",
                                    event_type=event_type,
                                    handler=handler.__name__,
                                    error=str(e),
                                )
                    except json.JSONDecodeError:
                        logger.warning("Invalid event message", data=message["data"])
        except asyncio.CancelledError:
            pass


# 全局事件总线实例
event_bus = EventBus()
