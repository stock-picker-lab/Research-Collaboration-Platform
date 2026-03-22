# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# 优化内存限制（适配小内存服务器）
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NPM_CONFIG_FETCH_TIMEOUT=600000
ENV NEXT_TELEMETRY_DISABLED=1

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖（使用更稳定的策略）
RUN npm cache clean --force && \
    npm ci --legacy-peer-deps --no-audit || \
    npm install --legacy-peer-deps --no-audit

# 复制源代码
COPY . .

# 构建
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
