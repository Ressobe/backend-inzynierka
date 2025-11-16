FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY . .

RUN apk add --no-cache bash curl && \
    curl -o /usr/local/bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x /usr/local/bin/wait-for-it.sh

RUN npm install

RUN npm run build

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"]
