FROM node:14-alpine as BUILDER

WORKDIR /usr/src/app

COPY package.json package.json
RUN npm ci

COPY src/ src/
RUN npm build


FROM node:14-alpine as RUNNER

WORKDIR /usr/src/app
ENV NODE_ENV="production"

COPY package.json package.json
RUN npm ci

COPY --from=BUILDER /usr/src/app/dist/ dist/

CMD ["node", "."]