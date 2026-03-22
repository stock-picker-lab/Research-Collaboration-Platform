# 部署配置说明

## 敏感信息配置

为了安全起见，以下敏感信息**不应该**提交到 Git 仓库中，需要在服务器上手动配置。

### 1. LLM API Key 配置

#### 方式一：通过环境变量（推荐）

在服务器上执行 `deploy.sh` 之前，先设置环境变量：

```bash
# 临时设置（当前会话有效）
export LLM_API_KEY="your-actual-api-key-here"
./deploy.sh

# 或永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export LLM_API_KEY="your-actual-api-key-here"' >> ~/.bashrc
source ~/.bashrc
./deploy.sh
```

#### 方式二：手动编辑 `.env.prod` 文件

1. 执行 `./deploy.sh` 后，脚本会自动生成 `.env.prod` 文件
2. 手动编辑该文件，将 `LLM_API_KEY` 的值替换为真实密钥：

```bash
vim .env.prod
# 找到这一行：
# LLM_API_KEY=your_llm_api_key_here
# 替换为：
# LLM_API_KEY=sk-K8qQ7MTNLrF6GqUxzcMGlGhAYyMaMKV2OZZrzy984LHLjMXt
```

3. 保存后重新启动服务：

```bash
docker compose -f docker-compose.prod.yml restart backend
```

### 2. 其他自动生成的密钥

以下密钥在首次运行 `deploy.sh` 时会自动生成（无需手动配置）：

- `SECRET_KEY` - 应用密钥
- `JWT_SECRET_KEY` - JWT 签名密钥
- `POSTGRES_PASSWORD` - 数据库密码
- `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` - 对象存储密钥
- `OPENCLAW_API_KEY` - AI Agent 密钥
- `BACKEND_API_KEY` - 后端 API 密钥

⚠️ **重要提示**：这些密钥会保存在 `.env.prod` 文件中，该文件已被 `.gitignore` 忽略，**不会**提交到 Git。

### 3. 已忽略的敏感文件

以下文件已添加到 `.gitignore`，不会被提交：

```
.env
.env.local
.env.production
.env.prod
```

## 生产环境安全建议

### 1. 修改默认演示账号密码

首次部署后，请尽快修改默认演示账号的密码：

```bash
# 进入后端容器
docker exec -it research-backend bash

# 使用 Python 脚本修改密码（需要你自己实现）
python -m app.scripts.change_password --username admin --password new_secure_password
```

### 2. 配置防火墙

确保只开放必要的端口：

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (如果配置了SSL)
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --add-service=https --permanent
sudo firewall-cmd --reload
```

### 3. 定期备份数据库

建议设置定时任务备份数据库：

```bash
# 添加到 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * docker exec research-postgres pg_dump -U postgres research_platform > /backup/db_$(date +\%Y\%m\%d).sql
```

### 4. 配置 HTTPS（可选但推荐）

使用 Nginx + Let's Encrypt 配置 SSL 证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（需要域名）
sudo certbot --nginx -d yourdomain.com
```

## 获取 LLM API Key

### 腾讯云 LKEAP（推荐）

1. 访问 [LKEAP 控制台](https://console.cloud.tencent.com/lkeap)
2. 创建应用并获取 API Key
3. 支持的模型：
   - `kimi-k2.5` - Moonshot Kimi K2.5（默认）
   - `gpt-4o` - OpenAI GPT-4 Turbo
   - `claude-3.5-sonnet` - Anthropic Claude 3.5

### Moonshot AI（备选）

1. 访问 [Moonshot AI 开放平台](https://platform.moonshot.cn)
2. 注册并创建 API Key
3. 修改 `.env.prod`：

```bash
LLM_BASE_URL=https://api.moonshot.cn/v1
LLM_MODEL=moonshot-v1-8k
```

## 常见问题

### Q1: 如何查看当前配置的 API Key？

```bash
grep "LLM_API_KEY" .env.prod
```

### Q2: 修改配置后如何生效？

```bash
# 重启后端服务
docker compose -f docker-compose.prod.yml restart backend

# 或重启所有服务
docker compose -f docker-compose.prod.yml restart
```

### Q3: 如何验证配置是否正确？

访问 http://your-server-ip/docs，查看 API 文档中的健康检查接口：

```bash
curl http://your-server-ip/health
```

---

**注意**：请妥善保管所有密钥和密码，不要在公开场合（如 GitHub Issue、论坛）泄露。
