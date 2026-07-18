# Deployment Guide

## Mode A: Single VPS

Run all processes on one host behind Nginx:

```bash
npm ci
npm run build:web
pm2 start ecosystem.config.cjs
```

Nginx sends web traffic to `127.0.0.1:3000` and API traffic to `127.0.0.1:4000`.

## Mode B: Vercel + Cloud Server

Deploy `apps/web` with:

```bash
npm run build:web
```

Set `NEXT_PUBLIC_API_BASE_URL=https://api.example.com` in Vercel. Run `apps/api` and `apps/worker` on the VM with PM2 or Docker. No source code changes are required.

## Mode C: Docker Compose

```bash
docker compose -f docker/docker-compose.yml up --build
```

This starts:

- `web` on port `3000`
- `api` on port `4000`
- `worker` as a background process

## Nginx Example

```nginx
server {
  listen 80;
  server_name example.com;

  location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
