from app.api.auth import router as auth_router
from app.api.companies import router as companies_router
from app.api.documents import router as documents_router
from app.api.research import task_router, conclusion_router, assumption_router, question_router
from app.api.copilot_and_dashboard import (
    copilot_router, alert_router, workbench_router, dashboard_router, management_router,
    multi_agent_router,
)
from app.api.portfolios import router as portfolios_router, watchlist_router
from app.api.templates import router as templates_router
from app.api.admin_routes import router as admin_router, user_mgmt_router, audit_router, datasource_router