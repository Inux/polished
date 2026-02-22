# Deployment Guide

This project uses [Kamal](https://kamal-deploy.org/) for deployment to Hetzner VPS.

## Prerequisites

1. **Hetzner VPS** with Ubuntu 22.04+ (or similar)
2. **Domain** pointed to your server's IP
3. **GitHub Container Registry** (or another Docker registry)
4. **Kamal** installed locally: `gem install kamal`

## Initial Server Setup

SSH into your Hetzner server and run:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group (if not root)
usermod -aG docker $USER
```

## Configuration

### 1. Update deploy.yml

Edit `config/deploy.yml` and replace:

- `YOUR_HETZNER_IP` - Your server's IP address
- `your-domain.com` - Your actual domain
- `your-email@example.com` - Your email for Let's Encrypt
- `your-registry/polished` - Your Docker registry path

Example for GitHub Container Registry:
```yaml
image: ghcr.io/your-username/polished
```

### 2. Set up secrets

```bash
cp .kamal/secrets.example .kamal/secrets
```

Edit `.kamal/secrets` with your credentials:

```bash
# For GitHub Container Registry
KAMAL_REGISTRY_USERNAME=your-github-username
KAMAL_REGISTRY_PASSWORD=ghp_your_personal_access_token
```

To create a GitHub PAT:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create token with `write:packages` and `read:packages` scopes

### 3. SSH Access

Ensure your SSH key is added to the server:

```bash
ssh-copy-id root@YOUR_HETZNER_IP
```

## Deployment Commands

### First-time setup

```bash
kamal setup
```

This will:
- Install Docker on the server (if needed)
- Set up Traefik as reverse proxy
- Configure SSL certificates via Let's Encrypt
- Deploy the application

### Deploy updates

```bash
kamal deploy
```

### Other useful commands

```bash
# View logs
kamal app logs

# Access Rails console (N/A for static site)
kamal app exec -i bash

# Rollback to previous version
kamal rollback

# Check deployment status
kamal details

# Stop the application
kamal app stop

# Remove everything
kamal remove
```

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'

      - name: Install Kamal
        run: gem install kamal

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Deploy with Kamal
        env:
          KAMAL_REGISTRY_USERNAME: ${{ github.actor }}
          KAMAL_REGISTRY_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
        run: kamal deploy
```

Add your server's SSH private key as a GitHub secret named `SSH_PRIVATE_KEY`.

## Troubleshooting

### SSL Certificate Issues

If Let's Encrypt fails:

```bash
# Check Traefik logs
kamal traefik logs

# Ensure ports 80 and 443 are open
ufw allow 80/tcp
ufw allow 443/tcp
```

### Container won't start

```bash
# Check container logs
kamal app logs

# Check health endpoint
curl http://YOUR_SERVER_IP/health
```

### Docker build fails

```bash
# Build locally to debug
docker build -t polished-test .
docker run -p 8080:80 polished-test
```

## Architecture

```
Internet
    │
    ▼
┌─────────┐
│ Traefik │ ← SSL termination, routing
└────┬────┘
     │
     ▼
┌─────────┐
│  Nginx  │ ← Static file serving
│ (Docker)│
└─────────┘
     │
     ▼
┌─────────┐
│  Astro  │ ← Static HTML/CSS/JS
│  Build  │
└─────────┘
```

## Costs

Estimated monthly costs on Hetzner:
- **CX11** (1 vCPU, 2GB RAM): ~€3.85/month - sufficient for this static site
- **CX21** (2 vCPU, 4GB RAM): ~€5.83/month - for higher traffic

Domain and SSL certificates are free (via Let's Encrypt).
