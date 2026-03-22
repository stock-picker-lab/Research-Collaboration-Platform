#!/usr/bin/env bash
# ============================================
# 投研协作平台 - 服务器一键部署脚本
# ============================================
set -euo pipefail

echo "========================================"
echo "  投研协作平台 - 一键部署"
echo "========================================"

# ---------- 备份检查 ----------
check_backup() {
    if docker compose -f docker-compose.prod.yml ps -q postgres | grep -q .; then
        echo ""
        echo "⚠️  检测到运行中的数据库服务"
        echo ""
        echo "建议在部署前备份数据库:"
        echo "  docker exec research-postgres pg_dump -U postgres research_platform > backup_\$(date +%Y%m%d_%H%M%S).sql"
        echo ""
        read -p "是否继续部署? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "  已取消部署"
            exit 0
        fi
    fi
}

check_backup

# ---------- 检测 / 安装 Docker ----------
install_docker() {
    echo "[1/6] 检查 Docker..."
    if command -v docker &>/dev/null; then
        echo "  ✅ Docker 已安装: $(docker --version)"
    else
        echo "  ⏳ 安装 Docker..."
        curl -fsSL https://get.docker.com | sh
        
        # 启动Docker服务 (兼容systemd和非systemd系统)
        if command -v systemctl &>/dev/null; then
            sudo systemctl enable docker
            sudo systemctl start docker
        else
            sudo service docker start
        fi
        echo "  ✅ Docker 安装完成"
    fi

    if ! docker compose version &>/dev/null; then
        echo "  ⏳ 安装 docker-compose-plugin..."
        
        # 检测Linux发行版
        if command -v apt-get &>/dev/null; then
            # Debian/Ubuntu
            sudo apt-get update -qq
            sudo apt-get install -y -qq docker-compose-plugin
        elif command -v yum &>/dev/null; then
            # CentOS/RHEL
            sudo yum install -y docker-compose-plugin
        elif command -v dnf &>/dev/null; then
            # Fedora
            sudo dnf install -y docker-compose-plugin
        else
            echo "  ⚠️  无法自动安装 docker-compose-plugin"
            echo "     请手动安装: https://docs.docker.com/compose/install/"
            exit 1
        fi
    fi
    echo "  ✅ Docker Compose: $(docker compose version --short)"
}

# ---------- 检查磁盘空间 ----------
check_disk_space() {
    echo ""
    echo "[2/6] 检查磁盘空间..."
    available_kb=$(df -k . | tail -1 | awk '{print $4}')
    available_gb=$((available_kb / 1024 / 1024))
    if [ "${available_gb}" -lt 5 ]; then
        echo "  ⚠️  磁盘空间不足 (${available_gb}GB)，建议预留至少 5GB"
        echo "     继续执行，如构建失败请清理磁盘后重试"
    else
        echo "  ✅ 磁盘空间充足 (${available_gb}GB 可用)"
    fi
}

# ---------- 配置环境变量 ----------
setup_env() {
    echo ""
    echo "[3/6] 配置环境变量..."
    
    # 检查 openssl 是否安装
    if ! command -v openssl &>/dev/null; then
        echo "  ⚠️  openssl 未安装，正在安装..."
        if command -v apt-get &>/dev/null; then
            sudo apt-get install -y openssl
        elif command -v yum &>/dev/null; then
            sudo yum install -y openssl
        else
            echo "  ❌ 无法自动安装 openssl，请手动安装后重试"
            exit 1
        fi
    fi
    
    if [ ! -f .env.prod ]; then
        # 自动检测服务器公网 IP
        SERVER_IP=$(curl -s --connect-timeout 5 ifconfig.me || curl -s --connect-timeout 5 icanhazip.com || echo "localhost")

        # 生成强随机密钥 (至少32字节)
        SECRET_KEY=$(openssl rand -hex 32)
        JWT_SECRET_KEY=$(openssl rand -hex 32)
        PG_PASSWORD=$(openssl rand -hex 32)
        MINIO_USER=$(openssl rand -hex 16)
        MINIO_PASSWORD=$(openssl rand -hex 32)
        OPENCLAW_API_KEY=$(openssl rand -hex 32)
        BACKEND_API_KEY=$(openssl rand -hex 32)

        cat > .env.prod << EOF
# ============================================
# 投研协作平台 - 生产环境配置
# 自动生成于 $(date '+%Y-%m-%d %H:%M:%S')
# ============================================

# 服务器 IP (用于 CORS 和前端 API 地址)
SERVER_IP=${SERVER_IP}
CORS_ORIGINS=["http://localhost:3000","http://${SERVER_IP}:3000","http://${SERVER_IP}"]

# 安全密钥 (自动生成)
SECRET_KEY=${SECRET_KEY}
JWT_SECRET_KEY=${JWT_SECRET_KEY}
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# PostgreSQL
POSTGRES_DB=research_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${PG_PASSWORD}
DATABASE_URL=postgresql+asyncpg://postgres:${PG_PASSWORD}@postgres:5432/research_platform
DATABASE_SYNC_URL=postgresql://postgres:${PG_PASSWORD}@postgres:5432/research_platform
DB_ECHO=false

# Redis
REDIS_URL=redis://redis:6379/0
REDIS_EVENT_BUS_DB=1

# LLM API配置 (需要手动配置)
# 请从环境变量或手动设置 LLM_API_KEY
LLM_API_KEY=\${LLM_API_KEY:-your_llm_api_key_here}
LLM_BASE_URL=https://api.lkeap.com/v1
LLM_MODEL=kimi-k2.5
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=4096

# Kimi K2.5 特定配置
KIMI_MODEL=kimi-k2.5
KIMI_ENABLED=true
MOONSHOT_API_KEY=\${LLM_API_KEY:-your_llm_api_key_here}

# OpenClaw配置 (AI Agent核心功能)
OPENCLAW_BASE_URL=http://openclaw:18789
OPENCLAW_API_KEY=${OPENCLAW_API_KEY}
OPENCLAW_ENABLED=true
OPENCLAW_TIMEOUT=300
OPENCLAW_MODEL=kimi-k2.5

# 向量嵌入模型
EMBEDDING_MODEL=text-embedding-ada-002

# 后端API密钥 (供OpenClaw技能调用)
BACKEND_API_KEY=${BACKEND_API_KEY}

# MinIO (S3兼容存储)
MINIO_ROOT_USER=${MINIO_USER}
MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=${MINIO_USER}
MINIO_SECRET_KEY=${MINIO_PASSWORD}
MINIO_BUCKET=research-docs
MINIO_SECURE=false

# Celery任务队列
CELERY_BROKER_URL=redis://redis:6379/3
CELERY_RESULT_BACKEND=redis://redis:6379/4

# 应用配置
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO

# IM软件集成 (可选)
IM_INTEGRATION_ENABLED=false

# ============================================
# 配置说明:
# ============================================
# ✅ 所有密钥已自动生成
# ✅ 已配置腾讯云 Kimi K2.5 LLM
# ⚠️  如需修改LLM配置,请编辑 LLM_API_KEY/LLM_BASE_URL/LLM_MODEL
# ⚠️  如需IM集成,请添加对应的Webhook配置
# ============================================
EOF
        echo "  ✅ 已生成 .env.prod (服务器 IP: ${SERVER_IP})"
        echo "  ✅ 已配置腾讯云 Kimi K2.5 LLM"
    else
        echo "  ✅ .env.prod 已存在，跳过生成"
        
        # 检查是否配置了LLM_API_KEY
        if ! grep -q "^LLM_API_KEY=" .env.prod; then
            echo "  ⚠️  警告: .env.prod 中缺少 LLM_API_KEY 配置"
            echo "     请手动编辑 .env.prod 添加你的 LLM API Key"
        else
            # 检查是否还是占位符
            if grep -q "your_llm_api_key_here" .env.prod; then
                echo "  ⚠️  警告: 请替换 LLM_API_KEY 的占位符为真实密钥"
            else
                echo "  ✅ LLM_API_KEY 已配置"
            fi
        fi
    fi

    # 创建 .env 软链，让 docker compose 直接执行时也能正确加载变量
    if [ ! -L .env ] || [ "$(readlink .env)" != ".env.prod" ]; then
        ln -sf .env.prod .env
        echo "  ✅ 已创建 .env -> .env.prod 软链"
    fi
}

# ---------- 构建镜像 ----------
build_images() {
    echo ""
    echo "[4/6] 构建 Docker 镜像 (如需强制重建，可手动删除旧镜像)..."
    set -a; source .env.prod; set +a
    docker compose -f docker-compose.prod.yml build
    echo "  ✅ 镜像构建完成"
}

# ---------- 启动服务 ----------
start_services() {
    echo ""
    echo "[5/6] 启动服务..."
    set -a; source .env.prod; set +a
    
    # 先停止旧服务 (如果存在)
    if docker compose -f docker-compose.prod.yml ps -q | grep -q .; then
        echo "  ⏳ 检测到运行中的服务,正在停止..."
        docker compose -f docker-compose.prod.yml down
        echo "  ✅ 旧服务已停止"
    fi
    
    # 启动新服务
    docker compose -f docker-compose.prod.yml up -d
    echo "  ⏳ 等待服务就绪 (这可能需要1-2分钟)..."
    
    # 等待基础服务就绪
    for i in $(seq 1 60); do
        postgres_ready=false
        redis_ready=false
        
        if docker compose -f docker-compose.prod.yml ps postgres | grep -q "healthy"; then
            postgres_ready=true
        fi
        
        if docker compose -f docker-compose.prod.yml ps redis | grep -q "healthy"; then
            redis_ready=true
        fi
        
        if [ "$postgres_ready" = true ] && [ "$redis_ready" = true ]; then
            echo "  ✅ 基础服务已就绪 (PostgreSQL + Redis)"
            break
        fi
        
        if [ $i -eq 60 ]; then
            echo "  ⚠️  服务启动超时,请检查日志"
            docker compose -f docker-compose.prod.yml ps
            exit 1
        fi
        
        sleep 2
    done
    
    # 额外等待后端完全启动
    sleep 10
    echo "  ✅ 所有服务已启动"
}

# ---------- 初始化数据库 ----------
init_database() {
    echo ""
    echo "[6/6] 初始化数据库..."
    set -a; source .env.prod; set +a

    # 等待后端完全启动（从宿主机访问映射端口）
    backend_ready=false
    for i in $(seq 1 30); do
        if curl -sf http://127.0.0.1:8000/health > /dev/null 2>&1; then
            backend_ready=true
            echo "  ✅ 后端服务已就绪"
            break
        fi
        echo "  ⏳ 等待后端启动... ($i/30)"
        sleep 3
    done

    if [ "$backend_ready" = false ]; then
        echo "  ⚠️  后端启动超时，请检查日志: docker compose -f docker-compose.prod.yml logs backend"
        return 1
    fi

    if docker exec research-backend python -m app.db.init_db; then
        echo "  ✅ 数据库初始化完成"
    else
        echo "  ⚠️  数据库初始化失败，请检查日志"
        return 1
    fi
}

# ---------- 打印结果 ----------
print_result() {
    set -a; source .env.prod; set +a
    echo ""
    echo "========================================"
    echo "  🎉 部署完成！"
    echo "========================================"
    echo ""
    echo "  🌐 平台地址:    http://${SERVER_IP}"
    echo "  📖 API 文档:    http://${SERVER_IP}/docs"
    echo "  🗄️  MinIO 控制台: http://${SERVER_IP}:9001"
    echo ""
    echo "  ⚠️  重要提示:"
    echo "     1. 请检查 .env.prod 中的 LLM_API_KEY 是否已配置"
    echo "     2. 默认演示账号密码仅供测试，生产环境请及时修改"
    echo ""
    echo "  📋 演示账号:"
    echo "     研究员:   researcher1 / research123"
    echo "     基金经理: pm1 / pm123"
    echo "     领导:     leader1 / leader123"
    echo "     管理员:   admin / admin123"
    echo ""
    echo "  🔧 常用命令:"
    echo "     查看日志:   docker compose -f docker-compose.prod.yml logs -f"
    echo "     重启服务:   docker compose -f docker-compose.prod.yml restart"
    echo "     停止服务:   docker compose -f docker-compose.prod.yml down"
    echo "     更新部署:   git pull && ./deploy.sh"
    echo ""
}

# ---------- 执行 ----------
install_docker
check_disk_space
setup_env
build_images
start_services
init_database
print_result