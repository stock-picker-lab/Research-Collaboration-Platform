# 🚀 投研协作平台 - 云服务器部署指南

## 一、购买云服务器

### 推荐配置

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 系统盘 | 50 GB SSD | 80 GB SSD |
| 操作系统 | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| 带宽 | 3 Mbps | 5 Mbps |

> 💡 **选购建议**：
> - 腾讯云 Lighthouse / 阿里云 ECS / 华为云 ECS 均可
> - **系统选 Ubuntu 22.04 LTS**（脚本已适配）
> - 内存建议 ≥ 4GB（PostgreSQL + Redis + 前后端同时运行比较吃内存）
> - 购买后记住 **公网 IP** 和 **root 密码**（或 SSH 密钥）

### 安全组 / 防火墙规则

购买后需要开放以下端口：

| 端口 | 用途 | 必须 |
|------|------|------|
| 22 | SSH 远程登录 | ✅ |
| 80 | HTTP 访问（平台入口） | ✅ |
| 443 | HTTPS（如后续配置 SSL） | 可选 |

> ⚠️ 其他端口（5432/6379/9000 等）**不要对外开放**，仅在服务器内部通信。

---

## 二、登录服务器

```bash
# 方式1：密码登录
ssh root@你的服务器IP

# 方式2：密钥登录
ssh -i ~/.ssh/your_key.pem root@你的服务器IP
```

---

## 三、一键部署（推荐）

登录服务器后，执行以下命令即可完成全部部署：

```bash
# 1. 安装 Git
apt update && apt install -y git

# 2. 克隆项目
git clone https://github.com/stock-picker-lab/Research-Collaboration-Platform.git
cd Research-Collaboration-Platform

# 3. 一键部署
bash deploy.sh
```

脚本会自动完成以下操作：
1. ✅ 安装 Docker 和 Docker Compose
2. ✅ 生成 `.env.prod` 配置文件（自动检测公网 IP、生成随机密钥）
3. ✅ 构建所有 Docker 镜像（首次约 5-10 分钟）
4. ✅ 启动所有 7 个服务
5. ✅ 初始化数据库 + 种子数据

部署完成后会看到类似输出：

```
========================================
  🎉 部署完成！
========================================

  🌐 平台地址:    http://123.45.67.89
  📖 API 文档:    http://123.45.67.89/docs
  🗄️  MinIO 控制台: http://123.45.67.89:9001

  📋 演示账号:
     研究员:   researcher1 / research123
     基金经理: pm1 / pm123
     领导:     leader1 / leader123
     管理员:   admin / admin123
```

在浏览器中访问 `http://你的服务器IP` 即可使用。

---

## 四、手动部署（如果一键脚本遇到问题）

### 4.1 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 验证
docker --version
docker compose version
```

### 4.2 克隆项目

```bash
git clone https://github.com/stock-picker-lab/Research-Collaboration-Platform.git
cd Research-Collaboration-Platform
```

### 4.3 配置环境变量

```bash
# 获取服务器公网 IP
SERVER_IP=$(curl -s ifconfig.me)
echo "服务器 IP: $SERVER_IP"

# 创建生产环境配置
cat > .env.prod << EOF
SERVER_IP=$SERVER_IP

SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)

POSTGRES_DB=research_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -hex 16)

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=$(openssl rand -hex 16)
EOF
```

### 4.4 构建并启动

```bash
# 加载环境变量
set -a; source .env.prod; set +a

# 构建镜像
docker compose -f docker-compose.prod.yml build

# 启动所有服务
docker compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker compose -f docker-compose.prod.yml ps
```

### 4.5 初始化数据库

```bash
# 等待后端完全启动（约 15-30 秒）
sleep 20

# 初始化数据库和种子数据
docker exec research-backend python -m app.db.init_db
```

### 4.6 验证

```bash
# 检查所有服务是否运行
docker compose -f docker-compose.prod.yml ps

# 检查后端健康
curl http://localhost/health

# 检查 API 文档
curl http://localhost/docs
```

浏览器访问 `http://你的服务器IP` 即可。

---

## 五、日常运维

### 查看服务状态

```bash
cd ~/Research-Collaboration-Platform
docker compose -f docker-compose.prod.yml ps
```

### 查看日志

```bash
# 查看所有服务日志
docker compose -f docker-compose.prod.yml logs -f

# 查看单个服务日志
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
```

### 重启服务

```bash
# 重启所有服务
docker compose -f docker-compose.prod.yml restart

# 重启单个服务
docker compose -f docker-compose.prod.yml restart backend
```

### 停止服务

```bash
docker compose -f docker-compose.prod.yml down
```

### 更新代码并重新部署

```bash
cd ~/Research-Collaboration-Platform

# 拉取最新代码
git pull origin main

# 重新构建并启动
set -a; source .env.prod; set +a
docker compose -f docker-compose.prod.yml up -d --build
```

### 数据备份

```bash
# 备份 PostgreSQL 数据库
docker exec research-postgres pg_dump -U postgres research_platform > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup_20260318.sql | docker exec -i research-postgres psql -U postgres research_platform
```

---

## 六、可选：配置 HTTPS（SSL 证书）

如果你有域名，可以配置免费 SSL 证书：

### 6.1 安装 Certbot

```bash
apt install -y certbot
```

### 6.2 申请证书

```bash
# 先停止 nginx 释放 80 端口
docker compose -f docker-compose.prod.yml stop nginx

# 申请证书（替换为你的域名和邮箱）
certbot certonly --standalone -d your-domain.com -m your@email.com --agree-tos

# 重启 nginx
docker compose -f docker-compose.prod.yml start nginx
```

### 6.3 修改 Nginx 配置

编辑 `nginx/nginx.conf`，在 server 块中添加 SSL 配置：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... 其他配置同 80 端口的 server 块
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

然后在 `docker-compose.prod.yml` 的 nginx 服务中增加证书目录挂载：

```yaml
nginx:
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - /etc/letsencrypt:/etc/letsencrypt:ro
  ports:
    - "80:80"
    - "443:443"
```

---

## 七、架构说明

部署后的服务架构：

```
用户浏览器
    │
    ▼ (端口 80)
┌─────────┐
│  Nginx  │  ← 反向代理、负载均衡
└────┬────┘
     │
     ├── /api/*  ──→  Backend (FastAPI :8000)  ──→ PostgreSQL / Redis / MinIO
     │                     │
     │                     ├── Celery Worker (异步任务)
     │                     └── Celery Beat  (定时任务)
     │
     └── /*     ──→  Frontend (Next.js :3000)
```

共 8 个 Docker 容器：

| 容器 | 说明 | 内部端口 |
|------|------|---------|
| research-nginx | Nginx 反向代理 | 80 |
| research-frontend | Next.js 前端 | 3000 |
| research-backend | FastAPI 后端 | 8000 |
| research-celery-worker | Celery 异步任务 | - |
| research-celery-beat | Celery 定时任务 | - |
| research-postgres | PostgreSQL + pgvector | 5432 |
| research-redis | Redis 缓存/消息 | 6379 |
| research-minio | MinIO 文件存储 | 9000/9001 |

---

## 八、常见问题排查

### Q: 构建镜像时很慢

```bash
# 使用国内 Docker 镜像加速（如果在国内服务器）
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << EOF
{
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
}
EOF
systemctl restart docker
```

### Q: 前端页面打不开

```bash
# 查看前端日志
docker logs research-frontend

# 查看 nginx 日志
docker logs research-nginx
```

### Q: 后端报数据库连接失败

```bash
# 确认 PostgreSQL 已启动
docker ps | grep postgres

# 查看 PostgreSQL 日志
docker logs research-postgres
```

### Q: 内存不足

```bash
# 查看内存使用
free -h
docker stats --no-stream
```

建议至少 4GB 内存。如果内存紧张，可以减少 Celery Worker 并发数：
在 `docker-compose.prod.yml` 中将 `--concurrency=4` 改为 `--concurrency=2`。

### Q: 磁盘空间不足

```bash
# 清理未使用的 Docker 资源
docker system prune -af
```
