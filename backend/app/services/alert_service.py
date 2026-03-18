"""
投研协作平台 - 预警推送服务
事件监测、分级、路由、推送
"""
from __future__ import annotations

from typing import Optional, List
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.models import (
    Alert, AlertDelivery, AlertSeverity, AlertPushStatus,
    User, UserRole, Company,
)
from app.core.event_bus import event_bus, EventTypes

import structlog

logger = structlog.get_logger()


class AlertService:
    """预警推送业务逻辑"""

    @staticmethod
    async def create_alert(
        db: AsyncSession,
        event_type: str,
        severity: str,
        title: str,
        summary: str,
        related_company_ids: Optional[List[str]] = None,
        source_document_id: Optional[str] = None,
        detail: Optional[dict] = None,
    ) -> Alert:
        """创建预警"""
        alert = Alert(
            event_type=event_type,
            severity=AlertSeverity(severity),
            related_company_ids=related_company_ids or [],
            title=title,
            summary=summary,
            source_document_id=source_document_id,
            detail=detail,
            created_by="system",
            updated_by="system",
        )
        db.add(alert)
        await db.flush()

        # 路由推送
        await AlertService._route_and_deliver(db, alert)

        return alert

    @staticmethod
    async def _route_and_deliver(db: AsyncSession, alert: Alert):
        """智能推送路由：根据用户角色和覆盖范围匹配推送对象"""
        target_users = []

        # 获取所有活跃用户
        result = await db.execute(select(User).where(User.is_active == True))
        users = result.scalars().all()

        for user in users:
            should_push = False
            coverage = user.coverage_scope or {}

            if user.role == UserRole.RESEARCHER:
                # 研究员：推送覆盖标的相关事件
                covered_companies = coverage.get("company_ids", [])
                if alert.related_company_ids:
                    if any(cid in covered_companies for cid in alert.related_company_ids):
                        should_push = True

                    # 检查产业链关联
                    for cid in alert.related_company_ids:
                        company_result = await db.execute(select(Company).where(Company.id == cid))
                        company = company_result.scalar_one_or_none()
                        if company:
                            chain_up = company.supply_chain_up or []
                            chain_down = company.supply_chain_down or []
                            related_all = chain_up + chain_down
                            if any(rid in covered_companies for rid in related_all):
                                should_push = True
                                break

            elif user.role == UserRole.PM:
                # 基金经理：推送持仓和观察池相关事件
                portfolio_ids = coverage.get("portfolio_ids", [])
                watchlist_ids = coverage.get("watchlist_ids", [])
                all_ids = portfolio_ids + watchlist_ids
                if alert.related_company_ids:
                    if any(cid in all_ids for cid in alert.related_company_ids):
                        should_push = True

            elif user.role == UserRole.LEADER:
                # 领导层：仅推送 P0 级
                if alert.severity == AlertSeverity.P0:
                    should_push = True

            # 检查用户推送偏好
            if should_push:
                prefs = user.push_preferences or {}
                min_severity = prefs.get("min_severity", "P2")
                severity_rank = {"P0": 0, "P1": 1, "P2": 2}
                if severity_rank.get(alert.severity.value, 2) <= severity_rank.get(min_severity, 2):
                    target_users.append(user)

        # 创建推送记录
        for user in target_users:
            # 站内通知（所有级别）
            delivery = AlertDelivery(
                alert_id=alert.id,
                user_id=user.id,
                channel="in_app",
                push_status=AlertPushStatus.SENT,
                sent_at=datetime.now(timezone.utc),
            )
            db.add(delivery)

            # P0 额外邮件通知
            if alert.severity == AlertSeverity.P0:
                email_delivery = AlertDelivery(
                    alert_id=alert.id,
                    user_id=user.id,
                    channel="email",
                    push_status=AlertPushStatus.PENDING,
                )
                db.add(email_delivery)

        await db.flush()

        logger.info(
            "Alert routed",
            alert_id=alert.id,
            severity=alert.severity.value,
            target_user_count=len(target_users),
        )

    @staticmethod
    async def get_user_alerts(
        db: AsyncSession,
        user_id: str,
        severity: Optional[str] = None,
        unread_only: bool = False,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[dict], int]:
        """获取用户的预警列表"""
        query = (
            select(Alert, AlertDelivery)
            .join(AlertDelivery, AlertDelivery.alert_id == Alert.id)
            .where(AlertDelivery.user_id == user_id)
            .where(AlertDelivery.channel == "in_app")
        )

        if severity:
            query = query.where(Alert.severity == AlertSeverity(severity))

        if unread_only:
            query = query.where(AlertDelivery.viewed_at.is_(None))

        count_result = await db.execute(query)
        total = len(count_result.all())

        query = query.order_by(desc(Alert.created_at)).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        rows = result.all()

        alerts = []
        for alert, delivery in rows:
            alerts.append({
                "id": alert.id,
                "event_type": alert.event_type,
                "severity": alert.severity.value,
                "title": alert.title,
                "summary": alert.summary,
                "related_company_ids": alert.related_company_ids,
                "source_document_id": alert.source_document_id,
                "push_status": delivery.push_status.value,
                "viewed_at": delivery.viewed_at,
                "created_at": alert.created_at,
            })

        return alerts, total

    @staticmethod
    async def mark_as_viewed(db: AsyncSession, alert_id: str, user_id: str):
        """标记预警为已查看"""
        result = await db.execute(
            select(AlertDelivery).where(
                AlertDelivery.alert_id == alert_id,
                AlertDelivery.user_id == user_id,
            )
        )
        deliveries = result.scalars().all()
        for delivery in deliveries:
            delivery.viewed_at = datetime.now(timezone.utc)
            delivery.push_status = AlertPushStatus.VIEWED
        await db.flush()
