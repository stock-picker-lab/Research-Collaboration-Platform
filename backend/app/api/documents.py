"""
投研协作平台 - 文档 API
"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, allow_all
from app.services.document_service import DocumentService
from app.schemas import DocumentCreate, DocumentResponse, PaginatedResponse

router = APIRouter(prefix="/documents", tags=["文档管理"])


@router.post("/", response_model=DocumentResponse, status_code=201)
async def create_document(
    data: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """创建文档记录"""
    doc = await DocumentService.create_document(db, data, current_user["user_id"])
    return DocumentResponse.model_validate(doc)


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = None,
    doc_type: str = "report",
    company_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """上传文档文件"""
    # TODO: 实际实现中需要将文件上传到 MinIO
    file_url = f"uploads/{file.filename}"

    # 读取内容 (简化: 直接读取文本内容)
    content = ""
    try:
        raw = await file.read()
        content = raw.decode("utf-8", errors="ignore")
    except Exception:
        pass

    data = DocumentCreate(
        title=title or file.filename,
        type=doc_type,
        company_id=company_id,
        content=content[:50000],  # 限制内容长度
    )
    doc = await DocumentService.create_document(
        db, data, current_user["user_id"], file_url=file_url
    )
    return DocumentResponse.model_validate(doc)


@router.get("/", response_model=PaginatedResponse)
async def list_documents(
    company_id: Optional[str] = None,
    doc_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取文档列表"""
    documents, total = await DocumentService.list_documents(
        db, company_id=company_id, doc_type=doc_type, page=page, page_size=page_size
    )
    return PaginatedResponse(
        items=[DocumentResponse.model_validate(d) for d in documents],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取文档详情"""
    doc = await DocumentService.get_document(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    return DocumentResponse.model_validate(doc)


@router.post("/{document_id}/analyze")
async def analyze_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """AI 自动解读文档"""
    try:
        analysis = await DocumentService.analyze_document(db, document_id)
        return {"document_id": document_id, "analysis": analysis}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
