#!/usr/bin/env bash
# ============================================
# 投研协作平台 - 服务器一键部署脚本
# ============================================
set -euo pipefail

echo "========================================"
echo "  投研协作平台 - 一键部署"
echo "========================================"

# ---------- 检测 / 安装 Docker ----------
install_docker() {
    echo "[1/5] 检查 Docker..."
    if command -v docker &>/dev/null; then
        echo "  ✅ Docker 已安装: $(docker --version)"
    else
        echo "  ⏳ 安装 Docker..."
        curl -fsSL https://get.docker.com | sh
        sudo systemctl enable docker
        sudo systemctl start docker
        echo "  ✅ Docker 安装完成"
    fi

    if ! docker compose version &>/dev/null; then
        echo "  ⏳ 安装 docker-compose-plugin..."
        sudo apt-get update -qq
        sudo apt-get install -y -qq docker-compose-plugin
    fi
    echo "  ✅ Docker Compose: $(docker compose version --short)"
}

# ---------- 配置环境变量 ----------
setup_env() {
    echo ""
    echo "[2/5] 配置环境变量..."
    if [ ! -f .env.prod ]; then
        # 自动检测服务器公网 IP
        SERVER_IP=$(curl -s --connect-timeout 5 ifconfig.me || curl -s --connect-timeout 5 icanhazip.com || echo "localhost")

        # 生成随机密钥
        SECRET_KEY=$(openssl rand -hex 32)
        JWT_SECRET_KEY=$(openssl rand -hex 32)
        PG_PASSWORD=$(openssl rand -hex 16)

        cat > .env.prod << EOF
# ============================================
# 投研协作平台 - 生产环境配置
# 自动生成于 $(date '+%Y-%m-%d %H:%M:%S')
# ============================================

# 服务器 IP (用于 CORS 和前端 API 地址)
SERVER_IP=${SERVER_IP}

# 安全密钥
SECRET_KEY=${SECRET_KEY}
JWT_SECRET_KEY=${JWT_SECRET_KEY}

# PostgreSQL
POSTGRES_DB=research_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${PG_PASSWORD}

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=$(openssl rand -hex 16)
EOF
        echo "  ✅ 已生成 .env.prod (服务器 IP: ${SERVER_IP})"
        echo "  ⚠️  请检查 .env.prod 中的配置是否正确"
    else
        echo "  ✅ .env.prod 已存在，跳过生成"
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
    echo "[3/5] 构建 Docker 镜像..."
    set -a; source .env.prod; set +a
    docker compose -f docker-compose.prod.yml build --no-cache
    echo "  ✅ 镜像构建完成"
}

# ---------- 启动服务 ----------
start_services() {
    echo ""
    echo "[4/5] 启动服务..."
    set -a; source .env.prod; set +a
    docker compose -f docker-compose.prod.yml up -d
    echo "  ⏳ 等待服务就绪..."
    sleep 10
    echo "  ✅ 所有服务已启动"
}

# ---------- 初始化数据库 ----------
init_database() {
    echo ""
    echo "[5/5] 初始化数据库..."
    set -a; source .env.prod; set +a

    # 等待后端完全启动（从宿主机访问映射端口）
    for i in $(seq 1 30); do
        if curl -sf http://127.0.0.1:8000/health > /dev/null 2>&1; then
            echo "  ✅ 后端服务已就绪"
            break
        fi
        if [ "$i" -eq 30 ]; then
            echo "  ⚠️  后端启动超时，请手动检查日志: docker logs research-backend"
            return 1
        fi
        echo "  ⏳ 等待后端启动... ($i/30)"
        sleep 3
    done

    docker exec research-backend python -m app.db.init_db && echo "  ✅ 数据库初始化完成" || echo "  ⚠️  数据库初始化失败，请检查日志"
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
setup_env
build_images
start_services
init_database
print_result
