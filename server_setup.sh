#!/usr/bin/env bash
# ============================================
# 投研协作平台 - 云服务器自动配置脚本
# 服务器: 43.129.28.2
# ============================================
set -euo pipefail

echo "========================================"
echo "  投研协作平台 - 服务器自动配置"
echo "========================================"

# 进入项目目录
cd /home/ubuntu/Research-Collaboration-Platform

# 1. 拉取最新代码
echo ""
echo "[1/5] 拉取最新代码..."
git pull origin main
echo "  ✅ 代码已更新"

# 2. 备份旧配置
echo ""
echo "[2/5] 备份旧配置..."
if [ -f .env.prod ]; then
    cp .env.prod .env.prod.backup_$(date +%Y%m%d_%H%M%S)
    echo "  ✅ 已备份旧配置"
else
    echo "  ℹ️  无旧配置文件，跳过备份"
fi

# 3. 生成密钥
echo ""
echo "[3/5] 生成随机密钥..."
PG_PASSWORD=$(openssl rand -hex 32)
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
OPENCLAW_API_KEY=$(openssl rand -hex 32)
BACKEND_API_KEY=$(openssl rand -hex 32)
MINIO_USER=$(openssl rand -hex 16)
MINIO_PASSWORD=$(openssl rand -hex 32)

echo "  ✅ 密钥生成完成"

# 4. 生成配置文件
echo ""
echo "[4/5] 生成生产环境配置..."

cat > .env.prod << EOF
# ============================================
# 投研协作平台 - 生产环境配置
# 自动生成于 $(date '+%Y-%m-%d %H:%M:%S')
# ============================================

# ============================================
# 服务器配置
# ============================================
SERVER_IP=43.129.28.2
CORS_ORIGINS=["http://43.129.28.2:3000","http://43.129.28.2","http://localhost:3000"]

# ============================================
# 数据库配置
# ============================================
POSTGRES_DB=research_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${PG_PASSWORD}
DATABASE_URL=postgresql+asyncpg://postgres:${PG_PASSWORD}@postgres:5432/research_platform
DATABASE_SYNC_URL=postgresql://postgres:${PG_PASSWORD}@postgres:5432/research_platform

# ============================================
# Redis配置
# ============================================
REDIS_URL=redis://redis:6379/0

# ============================================
# 认证与安全
# ============================================
SECRET_KEY=${SECRET_KEY}
JWT_SECRET_KEY=${JWT_SECRET_KEY}
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# ============================================
# AI / LLM API配置 (腾讯云 LKEAP - Kimi K2.5)
# ============================================
LLM_API_KEY=sk-K8qQ7MTNLrF6GqUxzcMGlGhAYyMaMKV2OZZrzy984LHLjMXt
LLM_BASE_URL=https://api.lkeap.com/v1
LLM_MODEL=kimi-k2.5

# Kimi K2.5 特定配置
KIMI_MODEL=kimi-k2.5
KIMI_ENABLED=true
MOONSHOT_API_KEY=sk-K8qQ7MTNLrF6GqUxzcMGlGhAYyMaMKV2OZZrzy984LHLjMXt

# ============================================
# OpenClaw配置 (AI Agent核心功能)
# ============================================
OPENCLAW_BASE_URL=http://openclaw:18789
OPENCLAW_API_KEY=${OPENCLAW_API_KEY}
OPENCLAW_ENABLED=true
OPENCLAW_TIMEOUT=300

# 后端API密钥(供OpenClaw技能调用后端)
BACKEND_API_KEY=${BACKEND_API_KEY}

# ============================================
# MinIO文件存储
# ============================================
MINIO_ENDPOINT=minio:9000
MINIO_ROOT_USER=${MINIO_USER}
MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}
MINIO_ACCESS_KEY=${MINIO_USER}
MINIO_SECRET_KEY=${MINIO_PASSWORD}
MINIO_BUCKET=research-docs
MINIO_SECURE=false

# ============================================
# Celery任务队列
# ============================================
CELERY_BROKER_URL=redis://redis:6379/3
CELERY_RESULT_BACKEND=redis://redis:6379/4

# ============================================
# 应用配置
# ============================================
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO

# ============================================
# IM软件集成 (可选)
# ============================================
IM_INTEGRATION_ENABLED=false

# ============================================
# 配置说明
# ============================================
# ✅ 所有密钥已自动生成
# ✅ 已配置腾讯云 LKEAP Kimi K2.5
# ✅ 已配置 OpenClaw AI Agent
# ⚠️  如需 IM 集成，请手动添加 Webhook URL
EOF

echo "  ✅ 配置文件已生成"

# 创建软链接
if [ ! -L .env ] || [ "$(readlink .env)" != ".env.prod" ]; then
    ln -sf .env.prod .env
    echo "  ✅ 已创建 .env -> .env.prod 软链"
fi

# 5. 重启服务
echo ""
echo "[5/5] 重启 Docker 服务..."

# 停止旧服务
if docker compose -f docker-compose.prod.yml ps -q | grep -q .; then
    echo "  ⏳ 停止旧服务..."
    docker compose -f docker-compose.prod.yml down
fi

# 启动新服务
echo "  ⏳ 启动新服务 (这可能需要 1-2 分钟)..."
docker compose -f docker-compose.prod.yml up -d

# 等待服务就绪
echo "  ⏳ 等待服务就绪..."
sleep 15

# 显示服务状态
echo ""
echo "========================================"
echo "  服务状态"
echo "========================================"
docker compose -f docker-compose.prod.yml ps

# 健康检查
echo ""
echo "========================================"
echo "  健康检查"
echo "========================================"
sleep 5

if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "  ✅ 后端服务正常: http://43.129.28.2:8000"
else
    echo "  ⚠️  后端服务未就绪，请稍后检查"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✅ 前端服务正常: http://43.129.28.2:3000"
else
    echo "  ⚠️  前端服务未就绪，请稍后检查"
fi

echo ""
echo "========================================"
echo "  配置完成！"
echo "========================================"
echo ""
echo "🎉 服务已成功部署到云服务器！"
echo ""
echo "📋 访问地址:"
echo "   前端: http://43.129.28.2:3000"
echo "   后端API: http://43.129.28.2:8000"
echo "   API文档: http://43.129.28.2:8000/docs"
echo ""
echo "📝 配置信息已保存到: .env.prod"
echo "   (包含数据库密码、API密钥等敏感信息)"
echo ""
echo "🔍 查看日志:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🔄 重启服务:"
echo "   docker compose -f docker-compose.prod.yml restart"
echo ""
echo "========================================"
