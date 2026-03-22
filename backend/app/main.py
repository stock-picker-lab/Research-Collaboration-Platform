"""
投研协作平台 - FastAPI 主入口
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.event_bus import event_bus
from app.api import (
    auth_router, companies_router, documents_router,
    task_router, conclusion_router, assumption_router, question_router,
    copilot_router, alert_router, workbench_router, dashboard_router, management_router,
    portfolios_router, watchlist_router, templates_router,
    admin_router, user_mgmt_router, audit_router, datasource_router,
    multi_agent_router, agents_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # Startup
    try:
        await event_bus.connect()
        await event_bus.start_listening()
    except Exception as e:
        print(f"Warning: EventBus connection failed: {e}")
    yield
    # Shutdown
    await event_bus.disconnect()


app = FastAPI(
    title="投研协作平台 API",
    description="Research Collaboration Copilot Platform - 面向基金公司研究所的智能投研协作平台",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- 注册路由 ----------

API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(companies_router, prefix=API_PREFIX)
app.include_router(documents_router, prefix=API_PREFIX)
app.include_router(task_router, prefix=API_PREFIX)
app.include_router(conclusion_router, prefix=API_PREFIX)
app.include_router(assumption_router, prefix=API_PREFIX)
app.include_router(question_router, prefix=API_PREFIX)
app.include_router(copilot_router, prefix=API_PREFIX)
app.include_router(alert_router, prefix=API_PREFIX)
app.include_router(workbench_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(management_router, prefix=API_PREFIX)
app.include_router(portfolios_router, prefix=API_PREFIX)
app.include_router(watchlist_router, prefix=API_PREFIX)
app.include_router(templates_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
app.include_router(user_mgmt_router, prefix=API_PREFIX)
app.include_router(audit_router, prefix=API_PREFIX)
app.include_router(datasource_router, prefix=API_PREFIX)
app.include_router(multi_agent_router, prefix=API_PREFIX)


# ---------- 健康检查 ----------

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "investment-research-platform"}


@app.get("/")
async def root():
    return {
        "name": "投研协作平台 API",
        "version": "0.1.0",
        "docs": "/docs",
    }
