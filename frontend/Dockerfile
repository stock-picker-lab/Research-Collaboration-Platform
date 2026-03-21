# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# 增加内存限制和超时设置
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NPM_CONFIG_FETCH_TIMEOUT=600000

# 安装依赖时清理npm缓存
COPY package.json package-lock.json* ./
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-audit --prefer-offline || \
    (echo "NPM install failed!" && exit 1)

COPY . .

# 检查关键文件是否存在
RUN ls -la && \
    ls -la src/ || echo "No src directory" && \
    ls -la app/ || echo "No app directory"

ENV NEXT_TELEMETRY_DISABLED=1

# 构建并显示详细日志
RUN echo "Starting Next.js build..." && \
    npm run build 2>&1 || \
    (echo "======= BUILD FAILED =======" && \
     echo "Checking for error logs..." && \
     cat .next/trace 2>/dev/null || echo "No trace file" && \
     exit 1)

# 验证构建产物
RUN ls -la .next/ && \
    ls -la .next/standalone/ && \
    echo "Build artifacts verified!"

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
