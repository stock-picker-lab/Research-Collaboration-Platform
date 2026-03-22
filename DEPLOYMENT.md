# 云服务器部署指南

## 📋 服务器信息

- **IP**: 43.129.28.2
- **用户**: ubuntu
- **项目路径**: `/home/ubuntu/Research-Collaboration-Platform`

---

## 🚀 一键部署

```bash
# 1. SSH登录服务器
ssh ubuntu@43.129.28.2

# 2. 进入项目目录
cd /home/ubuntu/Research-Collaboration-Platform

# 3. 拉取最新代码
git pull origin main

# 4. 执行部署脚本
./deploy.sh
```

**脚本会自动完成:**
- ✅ 检查/安装 Docker
- ✅ 生成所有密钥和密码
- ✅ 配置腾讯云 Kimi K2.5 LLM
- ✅ 配置 OpenClaw AI Agent
- ✅ 构建并启动所有服务
- ✅ 初始化数据库

---

## 🌐 访问地址

部署成功后可访问:

- **前端**: http://43.129.28.2:3000
- **后端API**: http://43.129.28.2:8000
- **API文档**: http://43.129.28.2:8000/docs
- **MinIO**: http://43.129.28.2:9001

---

## 🔧 常用命令

```bash
# 查看服务状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 重启服务
docker compose -f docker-compose.prod.yml restart

# 停止服务
docker compose -f docker-compose.prod.yml down

# 更新部署
git pull origin main && ./deploy.sh
```

---

## 🔍 故障排查

```bash
# 查看后端日志
docker compose -f docker-compose.prod.yml logs -f backend

# 查看OpenClaw日志
docker compose -f docker-compose.prod.yml logs -f openclaw

# 检查配置
cat .env.prod | grep -E "(LLM_|OPENCLAW_)"

# 健康检查
curl http://43.129.28.2:8000/health
```

---

## 📦 数据库备份

```bash
# 备份数据库
docker exec research-postgres pg_dump -U postgres research_platform > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup_20260322.sql | docker exec -i research-postgres psql -U postgres research_platform
```

---

## ⚙️ 配置说明

`deploy.sh` 自动生成的配置 (`.env.prod`):

- **LLM**: 腾讯云 Kimi K2.5 (已配置密钥)
- **数据库密码**: 自动生成 (64字符)
- **所有密钥**: 自动生成 (强随机)
- **服务器IP**: 自动检测

如需修改配置，编辑 `.env.prod` 后重启服务:

```bash
vim .env.prod
docker compose -f docker-compose.prod.yml restart
```

---

## 🎉 完成！

部署完成后即可使用系统所有功能，包括:
- ✅ AI智能分析 (Kimi K2.5)
- ✅ OpenClaw Agent
- ✅ 研报生成
- ✅ 数据管理
- ✅ 协作功能
