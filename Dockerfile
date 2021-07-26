FROM node:14-alpine as BUILDER

WORKDIR /usr/src/app

COPY package* tsconfig* .
RUN npm ci --no-progress

COPY src/ src/
RUN npm run build && \
	npm prune --production
	
#############################

FROM node:14-alpine as RUNNER

ENV TZ America/Los_Angeles
ENV NODE_ENV production
WORKDIR /usr/src/app

COPY --from=BUILDER /usr/src/app/package.json package.json
COPY --from=BUILDER /usr/src/app/node_modules/ node_modules/
COPY --from=BUILDER /usr/src/app/dist/ dist/

CMD ["node", "dist/app.js", "--input-type=module"]