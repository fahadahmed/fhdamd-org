# Build context: monorepo root
# pnpm-lock.yaml lives at the root, so we build from there

FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
# Copy workspace config so pnpm resolves the lockfile correctly
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/pdf-processor/package.json apps/pdf-processor/
RUN pnpm install --filter=pdf-processor --frozen-lockfile
COPY apps/pdf-processor/tsconfig.json apps/pdf-processor/
COPY apps/pdf-processor/src apps/pdf-processor/src
RUN pnpm --filter=pdf-processor run build

FROM node:22-alpine
RUN apk add --no-cache qpdf && corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/pdf-processor/package.json apps/pdf-processor/
RUN pnpm install --filter=pdf-processor --frozen-lockfile --prod
COPY --from=builder /app/apps/pdf-processor/dist apps/pdf-processor/dist
EXPOSE 8080
CMD ["node", "apps/pdf-processor/dist/index.js"]
