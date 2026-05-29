# =============================================================================
# Dockerfile — Portafolio Institucional BFF
#
# Build completamente autocontenido — Jenkins no necesita cambios.
#
#   deps     → instala todas las dependencias (dev + prod) para el build
#   builder  → compila Vite (client) + esbuild (server, bundle completo)
#   runner   → imagen mínima de runtime (node:20-alpine, non-root)
#
# El servidor BFF se bundlea en un solo .cjs — no necesita node_modules
# en runtime, eliminando la dependencia del cache de Docker para prod-deps.
# =============================================================================

# ─── Stage 1: Dependencias completas (para compilar) ─────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts


# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copia environments/.env.production → .env para que Vite lo lea
RUN node ./tools/run-compilation.js production

# Build 1: Vite → dist/ (cliente)
RUN npx vite build --mode production

# Build 2: esbuild → dist/server/index.cjs (BFF, bundle completo sin externos)
RUN npx esbuild src/server/index.ts \
      --bundle \
      --platform=node \
      --target=node20 \
      --format=cjs \
      --outfile=dist/server/index.cjs


# ─── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S bff && adduser -S bff -G bff

COPY --from=builder --chown=bff:bff /app/dist ./dist

USER bff

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

CMD ["node", "--max-old-space-size=400", "dist/server/index.cjs"]
