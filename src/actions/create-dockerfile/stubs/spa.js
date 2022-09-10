const fs = require('fs')
const path = require('path')

module.exports = {  
  stub: `
# This file was autogenerated at <%= generatedAt %>.
FROM node:17-alpine as builder

WORKDIR /app

COPY . .

RUN <%= dependencyCommand %> \
  && npm run build

FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/<%= buildDirectory %> /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx"]
CMD ["-g daemon off;"]
`,

  defaultValues: {
    buildDirectory: 'build',
    dependencyCommand: () => {
      return fs.existsSync(path.join(process.cwd(), 'package-lock.json'))
        ? "npm install --force"
        : fs.existsSync(path.join(process.cwd(), 'yarn.lock'))
          ? "yarn"
          : "npm install --force"
    },
  },

  files: {
    'nginx.conf': `
worker_processes auto;

events {
    worker_connections 8000;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format compression '$remote_addr - $remote_user [$time_local] '
        '"$request" $status $upstream_addr '
        '"$http_referer" "$http_user_agent"';

    server {
        listen 80;
        access_log /var/log/nginx/access.log compression;
        root /usr/share/nginx/html;
        index index.html index.htm;

        location / {
            try_files $uri $uri/ /index.html$is_args$args;;
        }

        location ~* \.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc)$ {
          expires 1M;
          access_log off;
          add_header Cache-Control "public";
        }

        location ~* \.(?:css|js)$ {
            try_files $uri =404;
            expires 1y;
            access_log off;
            add_header Cache-Control "public";
        }

        location ~ ^.+\..+$ {
            try_files $uri =404;
        }
    }
}        
    `
  }
}
