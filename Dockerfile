FROM node:16-alpine as BUILDER

WORKDIR /usr/src/app

COPY package* tsconfig* .
RUN yarn install

COPY src/ src/
RUN yarn run build && \
	yarn install --production
	
#############################

FROM node:16-alpine as RUNNER

ENV TZ America/Los_Angeles
ENV NODE_ENV production
WORKDIR /usr/src/app

COPY --from=BUILDER /usr/src/app/package.json package.json
COPY --from=BUILDER /usr/src/app/node_modules/ node_modules/
COPY --from=BUILDER /usr/src/app/dist/ dist/

CMD ["node", "dist/app.js", "--input-type=module"]