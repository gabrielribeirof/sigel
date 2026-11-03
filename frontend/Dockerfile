FROM node:24.22.2-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --non-interactive \
    && yarn cache clean

COPY . .

EXPOSE 5173

CMD ["yarn", "run", "dev", "--", "--host", "0.0.0.0"]