"""
向量检索 API 路由
支持语义搜索、文档检索等功能
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from typing import Optional, List
from pydantic import BaseModel, Field

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.document import Document
from app.models.company import Company

router = APIRouter()


# ==================== Request/Response Models ====================

class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500, description="搜索查询")
    company_id: Optional[int] = Field(None, description="限定公司范围")
    doc_types: Optional[List[str]] = Field(
        default=None,
        description="文档类型过滤"
    )
    top_k: int = Field(default=5, ge=1, le=20, description="返回结果数量")
    threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="相似度阈值")


class SearchResultItem(BaseModel):
    document_id: int
    title: str
    content: str
    source_type: str
    company_id: Optional[int]
    company_name: Optional[str]
    relevance_score: float
    published_date: Optional[str]


class SemanticSearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    total_count: int


class KeywordSearchRequest(BaseModel):
    keyword: str = Field(..., min_length=1, max_length=100)
    company_id: Optional[int] = None
    doc_types: Optional[List[str]] = None
    limit: int = Field(default=20, ge=1, le=100)


# ==================== API Endpoints ====================

@router.post("/semantic", response_model=SemanticSearchResponse)
async def semantic_search(
    request: SemanticSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    语义搜索接口
    
    使用向量相似度检索相关文档
    
    **注意:** 当前版本使用简化的关键词匹配,完整的向量检索功能需要:
    1. 安装向量数据库(Qdrant/Milvus/pgvector)
    2. 生成文档Embeddings
    3. 构建向量索引
    """
    # TODO: 实现真正的向量检索
    # 当前使用简化的关键词匹配作为占位符
    
    try:
        # 构建查询条件
        conditions = []
        
        # 关键词匹配(占位符逻辑)
        search_terms = request.query.split()
        keyword_conditions = []
        for term in search_terms:
            keyword_conditions.extend([
                Document.title.ilike(f"%{term}%"),
                Document.content.ilike(f"%{term}%")
            ])
        if keyword_conditions:
            conditions.append(or_(*keyword_conditions))
        
        # 公司过滤
        if request.company_id:
            conditions.append(Document.company_id == request.company_id)
        
        # 文档类型过滤
        if request.doc_types:
            conditions.append(Document.type.in_(request.doc_types))
        
        # 执行查询
        stmt = select(Document).where(and_(*conditions)).limit(request.top_k)
        result = await db.execute(stmt)
        documents = result.scalars().all()
        
        # 构建返回结果
        search_results = []
        for doc in documents:
            company_name = None
            if doc.company_id:
                company = await db.get(Company, doc.company_id)
                company_name = company.name if company else None
            
            # 简化的相似度评分(占位符)
            # 真实实现应该使用向量余弦相似度
            relevance_score = 0.8 if any(term.lower() in doc.title.lower() for term in search_terms) else 0.6
            
            search_results.append(SearchResultItem(
                document_id=doc.id,
                title=doc.title,
                content=doc.content[:500] + "..." if len(doc.content) > 500 else doc.content,
                source_type=doc.type,
                company_id=doc.company_id,
                company_name=company_name,
                relevance_score=relevance_score,
                published_date=doc.created_at.isoformat() if doc.created_at else None
            ))
        
        return SemanticSearchResponse(
            query=request.query,
            results=search_results,
            total_count=len(search_results)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"搜索失败: {str(e)}"
        )


@router.post("/keyword")
async def keyword_search(
    request: KeywordSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    关键词搜索接口
    
    基于标题和内容的精确/模糊匹配
    """
    try:
        conditions = [
            or_(
                Document.title.ilike(f"%{request.keyword}%"),
                Document.content.ilike(f"%{request.keyword}%")
            )
        ]
        
        if request.company_id:
            conditions.append(Document.company_id == request.company_id)
        
        if request.doc_types:
            conditions.append(Document.type.in_(request.doc_types))
        
        stmt = select(Document).where(and_(*conditions)).limit(request.limit)
        result = await db.execute(stmt)
        documents = result.scalars().all()
        
        return {
            "keyword": request.keyword,
            "results": [
                {
                    "id": doc.id,
                    "title": doc.title,
                    "type": doc.type,
                    "company_id": doc.company_id,
                    "created_at": doc.created_at.isoformat() if doc.created_at else None
                }
                for doc in documents
            ],
            "total": len(documents)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"关键词搜索失败: {str(e)}"
        )


@router.get("/companies/{company_id}/risk-data")
async def get_company_risk_data(
    company_id: int,
    days: int = Query(default=30, ge=1, le=180),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取公司风险监控数据
    
    用于 OpenClaw risk-monitor 技能
    """
    # 查询公司
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="公司不存在")
    
    try:
        # 查询最近的文档
        from datetime import datetime, timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        stmt = select(Document).where(
            and_(
                Document.company_id == company_id,
                Document.created_at >= cutoff_date
            )
        ).limit(10)
        result = await db.execute(stmt)
        recent_docs = result.scalars().all()
        
        # 构建返回数据
        return {
            "company_id": company_id,
            "company_name": company.name,
            "time_window_days": days,
            "recent_docs": [
                {
                    "id": doc.id,
                    "title": doc.title,
                    "type": doc.type,
                    "date": doc.created_at.isoformat() if doc.created_at else None
                }
                for doc in recent_docs
            ],
            "financial_metrics": {
                # TODO: 从数据库读取真实财务数据
                "revenue_growth": "未知",
                "profit_margin": "未知"
            },
            "news_sentiment": {
                # TODO: 实现新闻情绪分析
                "positive": 0,
                "neutral": len(recent_docs),
                "negative": 0
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取风险数据失败: {str(e)}"
        )
