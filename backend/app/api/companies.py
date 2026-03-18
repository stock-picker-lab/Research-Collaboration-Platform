"""
投研协作平台 - 公司 API
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, allow_all
from app.models.models import Company
from app.schemas import CompanyCreate, CompanyResponse, CompanyUpdate, PaginatedResponse

router = APIRouter(prefix="/companies", tags=["公司管理"])


@router.post("/", response_model=CompanyResponse, status_code=201)
async def create_company(
    data: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """创建公司"""
    company = Company(
        name=data.name,
        ticker=data.ticker,
        industry=data.industry,
        sector=data.sector,
        tags=data.tags,
        peer_list=data.peer_list,
        supply_chain_up=data.supply_chain_up,
        supply_chain_down=data.supply_chain_down,
        description=data.description,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
    )
    db.add(company)
    await db.flush()
    return CompanyResponse.model_validate(company)


@router.get("/", response_model=PaginatedResponse)
async def list_companies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    industry: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取公司列表"""
    query = select(Company).where(Company.is_active == True)

    if industry:
        query = query.where(Company.industry == industry)
    if search:
        query = query.where(
            Company.name.ilike(f"%{search}%") | Company.ticker.ilike(f"%{search}%")
        )

    # 总数
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # 分页
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [CompanyResponse.model_validate(c) for c in result.scalars().all()]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取公司详情"""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="公司不存在")
    return CompanyResponse.model_validate(company)


@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: str,
    data: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """更新公司信息"""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="公司不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)
    company.updated_by = current_user["user_id"]

    await db.flush()
    return CompanyResponse.model_validate(company)
