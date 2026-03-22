#!/usr/bin/env bash
# ============================================
# 投研协作平台 - 快速更新部署脚本
# ============================================
set -euo pipefail

echo "========================================"
echo "  投研协作平台 - 快速更新"
echo "========================================"

# 1. 拉取最新代码
echo "[1/5] 拉取最新代码..."
git pull origin main
echo "  ✅ 代码已更新"

# 2. 备份当前运行的容器
echo ""
echo "[2/5] 备份当前服务..."
docker compose -f docker-compose.prod.yml ps > /tmp/services-backup.txt
echo "  ✅ 服务状态已备份"

# 3. 重新构建镜像
echo ""
echo "[3/5] 构建新镜像..."
docker compose -f docker-compose.prod.yml build --no-cache
echo "  ✅ 镜像构建完成"

# 4. 重启服务
echo ""
echo "[4/5] 重启服务..."
docker compose -f docker-compose.prod.yml up -d --force-recreate
echo "  ✅ 服务已重启"

# 5. 健康检查
echo ""
echo "[5/5] 健康检查..."
sleep 10

if curl -sf http://localhost:8000/health > /dev/null; then
    echo "  ✅ 后端服务正常"
else
    echo "  ⚠️  后端服务异常,请检查日志"
fi

if curl -sf http://localhost:3000 > /dev/null; then
    echo "  ✅ 前端服务正常"
else
    echo "  ⚠️  前端服务异常,请检查日志"
fi

echo ""
echo "========================================"
echo "  🎉 更新完成！"
echo "========================================"
echo ""
echo "  查看日志: docker compose -f docker-compose.prod.yml logs -f"
echo "  查看状态: docker compose -f docker-compose.prod.yml ps"
echo ""
