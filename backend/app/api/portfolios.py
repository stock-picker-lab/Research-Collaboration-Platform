"""
持仓管理 API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.v2_models import Portfolio, Watchlist, Company, User
from app.schemas import PaginatedResponse

router = APIRouter(prefix="/portfolios", tags=["持仓管理"])


@router.get("")
async def get_portfolios(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取持仓列表"""
    query = select(Portfolio, Company.name.label("company_name")).join(
        Company, Portfolio.company_id == Company.id
    ).where(Portfolio.pm_user_id == current_user["user_id"])

    if status:
        query = query.where(Portfolio.status == status)

    # Count
    count_query = select(func.count()).select_from(Portfolio).where(
        Portfolio.pm_user_id == current_user["user_id"]
    )
    total = (await db.execute(count_query)).scalar()

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = result.all()

    return {
        "items": [
            {
                "id": item.Portfolio.id,
                "company_id": item.Portfolio.company_id,
                "company_name": item.company_name,
                "weight": item.Portfolio.weight,
                "shares": item.Portfolio.shares,
                "avg_cost": item.Portfolio.avg_cost,
                "current_price": item.Portfolio.current_price,
                "stance": item.Portfolio.stance.value,
                "status": item.Portfolio.status.value,
                "created_at": item.Portfolio.created_at.isoformat(),
            }
            for item in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("")
async def create_portfolio(
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """创建持仓"""
    portfolio = Portfolio(
        pm_user_id=current_user["user_id"],
        company_id=data["company_id"],
        weight=data["weight"],
        shares=data.get("shares"),
        avg_cost=data.get("avg_cost"),
        stance=data.get("stance", "neutral"),
        status="active",
    )
    db.add(portfolio)
    await db.flush()
    await db.commit()
    return {"id": portfolio.id}


@router.put("/{portfolio_id}")
async def update_portfolio(
    portfolio_id: str,
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新持仓"""
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.pm_user_id == current_user["user_id"],
        )
    )
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="持仓不存在")

    for key, value in data.items():
        if hasattr(portfolio, key):
            setattr(portfolio, key, value)

    await db.commit()
    return {"id": portfolio.id}


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除持仓"""
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.pm_user_id == current_user["user_id"],
        )
    )
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="持仓不存在")

    await db.delete(portfolio)
    await db.commit()
    return {"success": True}


# Watchlist endpoints
watchlist_router = APIRouter(prefix="/watchlist", tags=["观察池"])


@watchlist_router.get("")
async def get_watchlist(
    page: int = 1,
    page_size: int = 20,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取观察池"""
    query = select(Watchlist, Company.name.label("company_name")).join(
        Company, Watchlist.company_id == Company.id
    ).where(Watchlist.pm_user_id == current_user["user_id"])

    total = (await db.execute(select(func.count()).select_from(Watchlist).where(
        Watchlist.pm_user_id == current_user["user_id"]
    ))).scalar()

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = result.all()

    return {
        "items": [
            {
                "id": item.Watchlist.id,
                "company_id": item.Watchlist.company_id,
                "company_name": item.company_name,
                "reason": item.Watchlist.reason,
                "priority": item.Watchlist.priority.value,
                "status": item.Watchlist.status.value,
                "created_at": item.Watchlist.created_at.isoformat(),
            }
            for item in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@watchlist_router.post("")
async def create_watchlist(
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """添加到观察池"""
    watchlist = Watchlist(
        pm_user_id=current_user["user_id"],
        company_id=data["company_id"],
        reason=data.get("reason"),
        priority=data.get("priority", "P2"),
        status="watchlist",
    )
    db.add(watchlist)
    await db.flush()
    await db.commit()
    return {"id": watchlist.id}


@watchlist_router.post("/{watchlist_id}/move-to-portfolio")
async def move_to_portfolio(
    watchlist_id: str,
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """从观察池移入持仓"""
    result = await db.execute(
        select(Watchlist).where(
            Watchlist.id == watchlist_id,
            Watchlist.pm_user_id == current_user["user_id"],
        )
    )
    watchlist = result.scalar_one_or_none()
    if not watchlist:
        raise HTTPException(status_code=404, detail="观察项不存在")

    portfolio = Portfolio(
        pm_user_id=current_user["user_id"],
        company_id=watchlist.company_id,
        weight=data.get("weight", 5.0),
        stance=watchlist.priority,  # Use priority as stance default
        status="active",
    )
    db.add(portfolio)

    await db.delete(watchlist)
    await db.flush()
    await db.commit()
    return {"id": portfolio.id}
