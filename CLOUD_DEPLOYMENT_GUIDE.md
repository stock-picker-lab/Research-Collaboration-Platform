# 云服务器部署指南

## 服务器信息

- **IP地址**: 43.129.28.2
- **用户**: ubuntu
- **项目路径**: `/home/ubuntu/Research-Collaboration-Platform`

## 🚀 快速部署步骤

### 方式一: 一键自动部署（推荐）

```bash
# 1. SSH登录到服务器
ssh ubuntu@43.129.28.2

# 2. 切换到项目目录
cd /home/ubuntu/Research-Collaboration-Platform

# 3. 拉取最新代码
git pull origin main

# 4. 执行自动配置脚本
chmod +x server_setup.sh
./server_setup.sh
```

**脚本会自动完成:**
- ✅ 拉取最新代码
- ✅ 备份旧配置
- ✅ 生成所有密钥和密码
- ✅ 创建完整的 `.env.prod` 配置文件
- ✅ 配置腾讯云 Kimi K2.5 LLM
- ✅ 配置 OpenClaw AI Agent
- ✅ 重启所有 Docker 服务
- ✅ 健康检查

---

### 方式二: 手动部署

如果自动脚本有问题，可以手动执行：

```bash
# 1. 登录服务器
ssh ubuntu@43.129.28.2

# 2. 进入项目目录
cd /home/ubuntu/Research-Collaboration-Platform

# 3. 拉取最新代码
git pull origin main

# 4. 备份旧配置
cp .env.prod .env.prod.backup

# 5. 复制配置模板
cp .env.example .env.prod

# 6. 编辑配置文件
vim .env.prod
```

**必须修改的配置项:**

```bash
# 服务器IP
SERVER_IP=43.129.28.2

# 数据库密码 (使用 openssl rand -hex 32 生成)
POSTGRES_PASSWORD=your_generated_password
DATABASE_URL=postgresql+asyncpg://postgres:your_generated_password@postgres:5432/research_platform

# 安全密钥
SECRET_KEY=your_generated_secret_key
JWT_SECRET_KEY=your_generated_jwt_secret

# LLM配置 (腾讯云 Kimi K2.5)
LLM_API_KEY=sk-K8qQ7MTNLrF6GqUxzcMGlGhAYyMaMKV2OZZrzy984LHLjMXt
LLM_BASE_URL=https://api.lkeap.com/v1
LLM_MODEL=kimi-k2.5

# OpenClaw
OPENCLAW_API_KEY=your_generated_openclaw_key
BACKEND_API_KEY=your_generated_backend_key

# MinIO
MINIO_ROOT_USER=your_generated_minio_user
MINIO_ROOT_PASSWORD=your_generated_minio_password
```

**7. 重启服务:**

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

## 📋 部署后验证

### 1. 检查服务状态

```bash
docker compose -f docker-compose.prod.yml ps
```

预期输出：所有服务都应该是 `Up` 状态

### 2. 查看服务日志

```bash
# 查看所有服务日志
docker compose -f docker-compose.prod.yml logs -f

# 查看后端日志
docker compose -f docker-compose.prod.yml logs -f backend

# 查看OpenClaw日志
docker compose -f docker-compose.prod.yml logs -f openclaw

# 查看前端日志
docker compose -f docker-compose.prod.yml logs -f frontend
```

### 3. 健康检查

```bash
# 后端健康检查
curl http://43.129.28.2:8000/health

# 前端访问
curl http://43.129.28.2:3000

# 测试API
curl http://43.129.28.2:8000/api/v1/health
```

### 4. 访问服务

- **前端界面**: http://43.129.28.2:3000
- **后端API**: http://43.129.28.2:8000
- **API文档**: http://43.129.28.2:8000/docs
- **MinIO控制台**: http://43.129.28.2:9001

---

## 🔧 常用运维命令

### 服务管理

```bash
# 查看服务状态
docker compose -f docker-compose.prod.yml ps

# 重启所有服务
docker compose -f docker-compose.prod.yml restart

# 重启单个服务
docker compose -f docker-compose.prod.yml restart backend

# 停止服务
docker compose -f docker-compose.prod.yml down

# 停止并删除数据卷 (危险!)
docker compose -f docker-compose.prod.yml down -v
```

### 日志查看

```bash
# 实时查看所有日志
docker compose -f docker-compose.prod.yml logs -f

# 查看最近100行日志
docker compose -f docker-compose.prod.yml logs --tail=100

# 查看特定服务日志
docker compose -f docker-compose.prod.yml logs -f backend
```

### 代码更新

```bash
# 快速更新脚本
./update.sh

# 或手动更新
git pull origin main
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 数据库管理

```bash
# 进入数据库容器
docker exec -it research-postgres psql -U postgres -d research_platform

# 备份数据库
docker exec research-postgres pg_dump -U postgres research_platform > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup_20260322.sql | docker exec -i research-postgres psql -U postgres research_platform
```

### 资源监控

```bash
# 查看容器资源占用
docker stats

# 查看磁盘使用
df -h

# 查看Docker磁盘占用
docker system df

# 清理未使用的镜像
docker image prune -a
```

---

## 🔐 安全配置

### 1. 防火墙设置

```bash
# 切换到root用户
sudo su

# 安装UFW
apt-get update
apt-get install -y ufw

# 允许SSH
ufw allow 22/tcp

# 允许HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 允许应用端口
ufw allow 3000/tcp
ufw allow 8000/tcp

# 启用防火墙
ufw enable

# 查看状态
ufw status
```

### 2. 配置HTTPS (可选)

```bash
# 安装Certbot
sudo apt-get install -y certbot

# 获取证书 (需要域名)
sudo certbot certonly --standalone -d your-domain.com

# 证书自动续期
sudo crontab -e
# 添加: 0 3 * * * certbot renew --quiet
```

### 3. 定期备份

```bash
# 创建备份脚本
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/home/ubuntu/backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

# 备份数据库
docker exec research-postgres pg_dump -U postgres research_platform > $BACKUP_DIR/db_$DATE.sql

# 备份配置文件
cp /home/ubuntu/Research-Collaboration-Platform/.env.prod $BACKUP_DIR/env_$DATE.backup

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/ubuntu/backup.sh

# 设置每天凌晨3点自动备份
crontab -e
# 添加: 0 3 * * * /home/ubuntu/backup.sh >> /home/ubuntu/backup.log 2>&1
```

---

## 🐛 故障排查

### 问题1: 服务启动失败

```bash
# 查看详细错误日志
docker compose -f docker-compose.prod.yml logs backend

# 检查配置文件
cat .env.prod | grep -E "(API_KEY|PASSWORD)"

# 重新构建镜像
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### 问题2: 数据库连接失败

```bash
# 检查数据库容器状态
docker compose -f docker-compose.prod.yml ps postgres

# 查看数据库日志
docker compose -f docker-compose.prod.yml logs postgres

# 进入数据库测试连接
docker exec -it research-postgres psql -U postgres
```

### 问题3: OpenClaw AI功能不工作

```bash
# 检查OpenClaw容器
docker compose -f docker-compose.prod.yml logs openclaw

# 检查LLM API配置
docker exec -it research-backend bash -c "echo $LLM_API_KEY"

# 测试LLM连接
curl -X POST https://api.lkeap.com/v1/chat/completions \
  -H "Authorization: Bearer sk-K8qQ7MTNLrF6GqUxzcMGlGhAYyMaMKV2OZZrzy984LHLjMXt" \
  -H "Content-Type: application/json" \
  -d '{"model":"kimi-k2.5","messages":[{"role":"user","content":"Hello"}]}'
```

### 问题4: 前端无法访问

```bash
# 检查Nginx配置
docker compose -f docker-compose.prod.yml logs nginx

# 检查前端容器
docker compose -f docker-compose.prod.yml logs frontend

# 重启Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

---

## 📞 技术支持

如遇到问题：

1. 查看日志: `docker compose -f docker-compose.prod.yml logs -f`
2. 检查服务状态: `docker compose -f docker-compose.prod.yml ps`
3. 验证配置文件: `cat .env.prod`
4. 检查磁盘空间: `df -h`
5. 查看资源占用: `docker stats`

---

## 🎉 部署成功标志

✅ 所有Docker容器都是 `Up` 状态  
✅ 后端健康检查返回正常: `curl http://43.129.28.2:8000/health`  
✅ 前端页面可以访问: http://43.129.28.2:3000  
✅ API文档可以打开: http://43.129.28.2:8000/docs  
✅ 日志中没有错误信息  

祝部署顺利! 🚀
