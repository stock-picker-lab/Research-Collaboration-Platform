"""
投研协作平台 - Celery 异步任务定义
用于文档处理、AI 分析、推送发送等耗时操作
"""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "research_platform",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_default_queue="default",
    task_routes={
        "app.tasks.*": {"queue": "default"},
        "app.tasks.analyze_document_task": {"queue": "ai"},
        "app.tasks.send_email_notification": {"queue": "notification"},
    },
)


@celery_app.task(name="app.tasks.analyze_document_task", bind=True, max_retries=3)
def analyze_document_task(self, document_id: str):
    """异步文档分析任务"""
    import asyncio
    from app.core.database import async_session_factory
    from app.services.document_service import DocumentService

    async def _run():
        async with async_session_factory() as session:
            try:
                await DocumentService.analyze_document(session, document_id)
                await session.commit()
            except Exception as e:
                await session.rollback()
                raise e

    try:
        asyncio.run(_run())
    except Exception as exc:
        self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@celery_app.task(name="app.tasks.send_email_notification", bind=True, max_retries=3)
def send_email_notification(self, to_email: str, subject: str, body: str):
    """异步邮件发送任务"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    if not settings.SMTP_HOST:
        return {"status": "skipped", "reason": "SMTP not configured"}

    try:
        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_USER
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html", "utf-8"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        return {"status": "sent", "to": to_email}
    except Exception as exc:
        self.retry(exc=exc, countdown=30 * (self.request.retries + 1))


@celery_app.task(name="app.tasks.check_assumption_deviations")
def check_assumption_deviations():
    """定时检查假设偏离 (Celery Beat 调度)"""
    import asyncio
    from sqlalchemy import select
    from app.core.database import async_session_factory
    from app.models.models import Assumption, AssumptionStatus
    from app.core.event_bus import event_bus, EventTypes

    async def _run():
        async with async_session_factory() as session:
            result = await session.execute(
                select(Assumption).where(Assumption.status == AssumptionStatus.PENDING)
            )
            assumptions = result.scalars().all()

            for assumption in assumptions:
                if assumption.actual_value and assumption.expected_value:
                    try:
                        actual = float(assumption.actual_value)
                        expected = float(assumption.expected_value)
                        deviation = abs(actual - expected) / max(abs(expected), 0.001)
                        assumption.deviation_ratio = deviation

                        if deviation > 0.2:  # 偏离超过 20%
                            assumption.status = AssumptionStatus.BROKEN
                            await event_bus.publish(EventTypes.ASSUMPTION_BROKEN, {
                                "assumption_id": assumption.id,
                                "conclusion_card_id": assumption.conclusion_card_id,
                                "deviation_ratio": deviation,
                            })
                        else:
                            assumption.status = AssumptionStatus.VERIFIED
                            await event_bus.publish(EventTypes.ASSUMPTION_VERIFIED, {
                                "assumption_id": assumption.id,
                                "conclusion_card_id": assumption.conclusion_card_id,
                            })
                    except (ValueError, TypeError):
                        pass

            await session.commit()

    asyncio.run(_run())


# Celery Beat 定时任务配置
celery_app.conf.beat_schedule = {
    "check-assumption-deviations": {
        "task": "app.tasks.check_assumption_deviations",
        "schedule": 3600.0,  # 每小时
    },
}
