"""
模板管理 API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import ResearchTemplate

router = APIRouter(prefix="/templates", tags=["模板管理"])


@router.get("")
async def get_templates(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取所有模板"""
    result = await db.execute(select(ResearchTemplate).where(ResearchTemplate.is_active == True))
    templates = result.scalars().all()

    return [
        {
            "id": t.id,
            "name": t.name,
            "type": t.type.value,
            "description": t.description,
            "sections": t.sections,
            "is_system_default": t.is_system_default,
            "version": t.version,
            "usage_count": t.usage_count,
            "created_at": t.created_at.isoformat(),
        }
        for t in templates
    ]


@router.get("/{template_id}")
async def get_template(
    template_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取模板详情"""
    result = await db.execute(select(ResearchTemplate).where(ResearchTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")

    return {
        "id": template.id,
        "name": template.name,
        "type": template.type.value,
        "description": template.description,
        "sections": template.sections,
        "is_system_default": template.is_system_default,
        "version": template.version,
        "usage_count": template.usage_count,
        "created_at": template.created_at.isoformat(),
    }


@router.post("")
async def create_template(
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """创建模板"""
    template = ResearchTemplate(
        name=data["name"],
        type=data["type"],
        description=data.get("description"),
        sections=data.get("sections", []),
        is_system_default=False,
        is_active=True,
        version=1,
        usage_count=0,
    )
    db.add(template)
    await db.flush()
    await db.commit()
    return {"id": template.id}


@router.put("/{template_id}")
async def update_template(
    template_id: str,
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新模板"""
    result = await db.execute(select(ResearchTemplate).where(ResearchTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")

    for key, value in data.items():
        if hasattr(template, key) and key != "id":
            setattr(template, key, value)

    template.version += 1
    await db.commit()
    return {"id": template.id}


@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除模板"""
    result = await db.execute(select(ResearchTemplate).where(ResearchTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")

    if template.is_system_default:
        raise HTTPException(status_code=400, detail="无法删除系统默认模板")

    template.is_active = False
    await db.commit()
    return {"success": True}
