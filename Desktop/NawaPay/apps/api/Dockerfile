FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
RUN npm install

FROM deps AS build
COPY apps/api apps/api
RUN npm run build --workspace apps/api

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/apps/api/dist dist
COPY apps/api/package.json package.json
EXPOSE 4100
CMD ["node", "dist/server.js"]
