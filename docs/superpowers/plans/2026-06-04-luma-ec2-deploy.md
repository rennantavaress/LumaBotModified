# Deploy LumaBot no EC2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar infraestrutura Terraform + GitHub Actions OIDC para deploy do LumaBot em EC2.

**Architecture:** Branch `monteiro/bulma-ec2` no repo `murillous/LumaBot` com Docker files (novos em relação a main) + pasta `infra/` com Terraform + workflow `.github/workflows/deploy-ec2.yml`. DDNS Cloudflare script via user_data.

**Tech Stack:** Terraform, AWS (EC2/VPC/IAM/OIDC), GitHub Actions, Docker Compose, Cloudflare API

---

## File Structure

```
murillous/LumaBot:monteiro/bulma-ec2
├── infra/
│   ├── main.tf                # provider, VPC, subnet, IGW, SG, EC2
│   ├── variables.tf           # variáveis tipadas
│   ├── outputs.tf             # outputs (IP público, etc)
│   ├── iam.tf                 # OIDC role GH Actions + EC2 IAM role
│   ├── user_data.sh.tpl       # template bootstrap (Docker, .env, DDNS)
│   └── terraform.tfvars.example
├── .github/
│   └── workflows/
│       └── deploy-ec2.yml     # CI/CD: OIDC auth, docker build, SSH deploy
└── dashboard/
    └── server.js              # + rota GET /health
```

---

### Task 1: Setup branch a partir de upstream/main

**Files:** Nenhum — operação git

- [ ] **Step 1: Fetch upstream e criar nova branch**

```bash
git fetch upstream
git checkout -b monteiro/bulma-ec2 upstream/main
```

- [ ] **Step 2: Cherry-pick commits de Docker da branch atual**

Lista de commits para cherry-pick:
- `1515b0f` — `feat: conternerizacao e preparo para amb de prod`
- `74f81ce` — `fix: review pr`
- `92787a8` — `fix: ajustes finais baseados na revisão do copilot`

```bash
git cherry-pick 1515b0f 74f81ce 92787a8
```

Esperar possíveis conflitos em:
- `dashboard/server.js` — upstream/main tem dashboard completo, resolver mantendo versão do upstream e **depois** adicionando `/health`
- `package.json` — resolver mantendo versão do upstream (v7.1.0)
- `nodemon.json` — resolver mantendo versão do upstream

- [ ] **Step 3: Verificar se cherry-pick foi limpo**

```bash
git status
git log --oneline -5
```

- [ ] **Step 4: Push branch para upstream**

```bash
git push upstream monteiro/bulma-ec2
```

---

### Task 2: Adicionar rota /health no dashboard/server.js

**Files:**
- Modify: `dashboard/server.js` (próximo à definição das outras rotas GET)

- [ ] **Step 1: Adicionar health endpoint antes do bloco de start**

```javascript
// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
```

Inserir antes do bloco `server.listen(...)` no final do arquivo.

---

### Task 3: infra/variables.tf

**Files:**
- Create: `infra/variables.tf`

- [ ] **Step 1: Criar variables.tf**

```hcl
variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-2"
}

variable "instance_type" {
  description = "Tipo da EC2"
  type        = string
  default     = "t3.small"
}

variable "instance_ami" {
  description = "AMI ID (Amazon Linux 2023)"
  type        = string
  default     = "ami-0df24ca1486a70a9c" # us-east-2 AL2023
}

variable "ssh_key_name" {
  description = "Nome do key pair EC2"
  type        = string
  default     = "access-key-crea-erp"
}

variable "allowed_ssh_cidr" {
  description = "CIDR permitido para SSH"
  type        = string
  default     = "0.0.0.0/0" # ou seu IP: "SEU_IP/32"
}

variable "domain_name" {
  description = "Domínio para o dashboard"
  type        = string
  default     = "luma.theralabs.com.br"
}

variable "github_repo" {
  description = "Repositório GitHub no formato owner/repo"
  type        = string
  default     = "murillous/LumaBot"
}

variable "environment" {
  description = "Ambiente (dev/prod)"
  type        = string
  default     = "production"
}
```

---

### Task 4: infra/iam.tf

**Files:**
- Create: `infra/iam.tf`

- [ ] **Step 1: Criar IAM role para EC2**

```hcl
# IAM role para a EC2 (acesso SSM, CloudWatch)
resource "aws_iam_role" "luma_bot_ec2" {
  name = "LumaBotEC2Role"
  path = "/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
  ]
}

resource "aws_iam_instance_profile" "luma_bot_ec2" {
  name = "LumaBotEC2InstanceProfile"
  role = aws_iam_role.luma_bot_ec2.name
}
```

- [ ] **Step 2: Criar OIDC role para GitHub Actions**

```hcl
# OIDC role para GitHub Actions
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_role" "luma_bot_gh_actions" {
  name = "LumaBotGHActionsRole"
  path = "/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = data.aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:ref:refs/heads/monteiro/bulma-ec2"
        }
      }
    }]
  })
}

# Policy para a OIDC role acessar EC2 (start/stop/describe) + SSM SendCommand
resource "aws_iam_policy" "luma_bot_deploy" {
  name        = "LumaBotDeployPolicy"
  description = "Policy for GitHub Actions to deploy LumaBot"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceStatus",
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:SendCommand",
          "ssm:GetCommandInvocation",
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*",
        ]
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "luma_bot_deploy" {
  role       = aws_iam_role.luma_bot_gh_actions.name
  policy_arn = aws_iam_policy.luma_bot_deploy.arn
}
```

- [ ] **Step 3: Criar data source para account ID**

Adicionar no início de `infra/iam.tf`:

```hcl
data "aws_caller_identity" "current" {}
```

---

### Task 5: infra/user_data.sh.tpl

**Files:**
- Create: `infra/user_data.sh.tpl`

- [ ] **Step 1: Criar template de user_data**

```bash
#!/bin/bash
set -ex

# ─── Variáveis injetadas pelo Terraform ──────────────────────────────────────
DOMAIN_NAME="${domain_name}"
ENVIRONMENT="${environment}"

# ─── Sistema ──────────────────────────────────────────────────────────────────
hostnamectl set-hostname "luma-bot-${ENVIRONMENT}"
echo "127.0.0.1 luma-bot-${ENVIRONMENT}" >> /etc/hosts

# ─── Docker ───────────────────────────────────────────────────────────────────
dnf install -y docker docker-compose-plugin
systemctl enable --now docker
usermod -aG docker ec2-user

# ─── Diretório da aplicação ───────────────────────────────────────────────────
mkdir -p /app/auth_info /app/data
chown -R ec2-user:ec2-user /app

# ─── .env ─────────────────────────────────────────────────────────────────────
cat > /app/.env << 'ENV_EOF'
AI_PROVIDER=${ai_provider}
GEMINI_API_KEY=${gemini_api_key}
OPENAI_API_KEY=${openai_api_key}
DEEPSEEK_API_KEY=${deepseek_api_key}
TAVILY_API_KEY=${tavily_api_key}
OWNER_NUMBER=${owner_number}
LOG_LEVEL=${log_level}
DASHBOARD_PORT=3000
DASHBOARD_PASSWORD=${dashboard_password}
CLOUDFLARE_TUNNEL=false
ENV_EOF

chown ec2-user:ec2-user /app/.env
chmod 600 /app/.env

# ─── DDNS Cloudflare ─────────────────────────────────────────────────────────
CLOUDFLARE_API_TOKEN="${cloudflare_api_token}"
CLOUDFLARE_ZONE_ID="${cloudflare_zone_id}"

cat > /usr/local/bin/cloudflare-ddns.sh << 'DDNS'
#!/bin/bash
set -e

DOMAIN="${1}"
ZONE_ID="${2}"
API_TOKEN="${3}"

CURRENT_IP=$(curl -s ifconfig.me)
DNS_RECORD=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=A&name=${DOMAIN}" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json")
DNS_IP=$(echo "${DNS_RECORD}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result'][0]['content'] if d['result'] else '')" 2>/dev/null)
RECORD_ID=$(echo "${DNS_RECORD}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result'][0]['id'] if d['result'] else '')" 2>/dev/null)

if [ "${CURRENT_IP}" != "${DNS_IP}" ] && [ -n "${RECORD_ID}" ]; then
  curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RECORD_ID}" \
    -H "Authorization: Bearer ${API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"A\",\"name\":\"${DOMAIN}\",\"content\":\"${CURRENT_IP}\",\"ttl\":120,\"proxied\":false}"
  echo "[$(date)] DDNS updated: ${DNS_IP} -> ${CURRENT_IP}" >> /var/log/cloudflare-ddns.log
else
  echo "[$(date)] DDNS no change: ${CURRENT_IP}" >> /var/log/cloudflare-ddns.log
fi
DDNS

chmod +x /usr/local/bin/cloudflare-ddns.sh

cat > /etc/systemd/system/cloudflare-ddns.service << 'SERVICE'
[Unit]
Description=Cloudflare DDNS for LumaBot
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/cloudflare-ddns.sh ${DOMAIN_NAME} ${CLOUDFLARE_ZONE_ID} ${CLOUDFLARE_API_TOKEN}
User=root
SERVICE

cat > /etc/systemd/system/cloudflare-ddns.timer << 'TIMER'
[Unit]
Description=Cloudflare DDNS timer (5 min)

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min

[Install]
WantedBy=multi-user.target
TIMER

systemctl daemon-reload
systemctl enable --now cloudflare-ddns.timer

# ─── Docker Compose ──────────────────────────────────────────────────────────
cat > /app/docker-compose.yml << 'COMPOSE'
services:
  nginx:
    image: nginx:1.26.0
    container_name: luma-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /app/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /app/nginx/conf.d:/etc/nginx/conf.d:ro
      - /app/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - luma-prod

  app:
    image: ghcr.io/${github_repo}/luma-bot:latest
    container_name: luma-bot
    restart: unless-stopped
    expose:
      - "3000"
    volumes:
      - /app/auth_info:/app/auth_info
      - /app/data:/app/data
      - /app/.env:/app/.env:ro
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => { if (r.statusCode !== 200) throw new Error(r.statusCode) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - luma-prod

volumes:
  auth_data:
    driver: local
  bot_data:
    driver: local

networks:
  luma-prod:
    driver: bridge
COMPOSE

# ─── Nginx config ─────────────────────────────────────────────────────────────
mkdir -p /app/nginx/conf.d /app/ssl

cat > /app/nginx/nginx.conf << 'NGINX_CONF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;
events { worker_connections 2048; }
http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  sendfile on; tcp_nopush on; tcp_nodelay on;
  keepalive_timeout 65;
  client_max_body_size 50M;
  gzip on; gzip_vary on; gzip_min_length 1024;
  gzip_comp_level 6;
  gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
  limit_req_zone $binary_remote_addr zone=luma_limit:10m rate=10r/s;
  include /etc/nginx/conf.d/*.conf;
}
NGINX_CONF

cat > /app/nginx/conf.d/default.conf << 'NGINX_SITE'
upstream luma_backend {
  least_conn;
  server luma-bot:3000 max_fails=3 fail_timeout=30s;
}
server {
  listen 80;
  server_name _;
  client_max_body_size 50M;
  location /health {
    proxy_pass http://luma_backend;
  }
  location / {
    limit_req zone=luma_limit burst=20 nodelay;
    proxy_pass http://luma_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_buffering off;
  }
  location ~ /\.env { deny all; return 404; }
  location ~ /\.git { deny all; return 404; }
}
NGINX_SITE

chown -R ec2-user:ec2-user /app/nginx

echo "✅ Bootstrap completo"
```

---

### Task 6: infra/main.tf

**Files:**
- Create: `infra/main.tf`

- [ ] **Step 1: Criar main.tf com provider, VPC, subnet, IGW, SG, EC2**

```hcl
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── VPC ──────────────────────────────────────────────────────────────────────

resource "aws_vpc" "luma_bot" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "luma-bot-${var.environment}"
  }
}

# ─── Subnet Pública ───────────────────────────────────────────────────────────

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.luma_bot.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "luma-bot-public-${var.environment}"
  }
}

# ─── Internet Gateway ─────────────────────────────────────────────────────────

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.luma_bot.id

  tags = {
    Name = "luma-bot-igw-${var.environment}"
  }
}

# ─── Route Table ──────────────────────────────────────────────────────────────

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.luma_bot.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "luma-bot-public-rt-${var.environment}"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ─── Security Group ───────────────────────────────────────────────────────────

resource "aws_security_group" "luma_bot" {
  name        = "luma-bot-${var.environment}"
  description = "Security group for LumaBot EC2"
  vpc_id      = aws_vpc.luma_bot.id

  tags = {
    Name = "luma-bot-sg-${var.environment}"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ssh" {
  security_group_id = aws_security_group.luma_bot.id
  cidr_ipv4         = var.allowed_ssh_cidr
  from_port         = 22
  to_port           = 22
  ip_protocol       = "tcp"
  description       = "SSH"
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.luma_bot.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  description       = "HTTP"
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  security_group_id = aws_security_group.luma_bot.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  description       = "HTTPS"
}

resource "aws_vpc_security_group_ingress_rule" "dashboard" {
  security_group_id = aws_security_group.luma_bot.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 3000
  to_port           = 3000
  ip_protocol       = "tcp"
  description       = "Dashboard"
}

resource "aws_vpc_security_group_egress_rule" "all" {
  security_group_id = aws_security_group.luma_bot.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "All outbound"
}

# ─── EC2 Instance ─────────────────────────────────────────────────────────────

resource "aws_instance" "luma_bot" {
  ami                    = var.instance_ami
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.luma_bot.id]
  key_name               = var.ssh_key_name
  iam_instance_profile   = aws_iam_instance_profile.luma_bot_ec2.name

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
    tags = {
      Name = "luma-bot-root-${var.environment}"
    }
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    domain_name          = var.domain_name
    environment          = var.environment
    ai_provider          = var.ai_provider
    gemini_api_key       = var.gemini_api_key
    openai_api_key       = var.openai_api_key
    deepseek_api_key     = var.deepseek_api_key
    tavily_api_key       = var.tavily_api_key
    owner_number         = var.owner_number
    log_level            = var.log_level
    dashboard_password   = var.dashboard_password
    cloudflare_api_token = var.cloudflare_api_token
    cloudflare_zone_id   = var.cloudflare_zone_id
    github_repo          = var.github_repo
  })

  tags = {
    Name        = "luma-bot-${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
```

- [ ] **Step 2: Adicionar variáveis sensíveis em variables.tf**

Adicionar ao final de `variables.tf`:

```hcl
# ─── Variáveis sensíveis (passadas via -var ou terraform.tfvars) ──────────────

variable "ai_provider" {
  description = "Provider de IA (gemini/openai/deepseek)"
  type        = string
  default     = "gemini"
}

variable "gemini_api_key" {
  description = "API key Gemini"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "API key OpenAI"
  type        = string
  sensitive   = true
  default     = ""
}

variable "deepseek_api_key" {
  description = "API key DeepSeek"
  type        = string
  sensitive   = true
  default     = ""
}

variable "tavily_api_key" {
  description = "API key Tavily (web search)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "owner_number" {
  description = "Número do dono do bot"
  type        = string
  default     = ""
}

variable "log_level" {
  description = "Nível de log"
  type        = string
  default     = "info"
}

variable "dashboard_password" {
  description = "Senha do dashboard"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloudflare_api_token" {
  description = "API token Cloudflare (DDNS)"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Zone ID do domínio na Cloudflare"
  type        = string
}
```

---

### Task 7: infra/outputs.tf

**Files:**
- Create: `infra/outputs.tf`

- [ ] **Step 1: Criar outputs**

```hcl
output "instance_id" {
  description = "ID da EC2"
  value       = aws_instance.luma_bot.id
}

output "public_ip" {
  description = "IP público da EC2"
  value       = aws_instance.luma_bot.public_ip
}

output "vpc_id" {
  description = "ID da VPC"
  value       = aws_vpc.luma_bot.id
}

output "security_group_id" {
  description = "ID do security group"
  value       = aws_security_group.luma_bot.id
}
```

---

### Task 8: infra/terraform.tfvars.example

**Files:**
- Create: `infra/terraform.tfvars.example`

- [ ] **Step 1: Criar arquivo de exemplo**

```hcl
# aws_region          = "us-east-2"
# instance_type       = "t3.small"
# ssh_key_name        = "access-key-crea-erp"
# allowed_ssh_cidr    = "0.0.0.0/0"
# domain_name         = "luma.theralabs.com.br"
# github_repo         = "murillous/LumaBot"
# environment         = "production"

# ai_provider         = "gemini"
# gemini_api_key      = "SEU_GEMINI_KEY"
# openai_api_key      = ""
# deepseek_api_key    = ""
# tavily_api_key      = ""
# owner_number        = ""
# log_level           = "info"
# dashboard_password  = ""
# cloudflare_api_token = "SEU_CLOUDFLARE_TOKEN"
# cloudflare_zone_id  = "SEU_ZONE_ID"
```

---

### Task 9: .github/workflows/deploy-ec2.yml

**Files:**
- Create: `.github/workflows/deploy-ec2.yml`

- [ ] **Step 1: Criar workflow de deploy**

```yaml
name: Deploy LumaBot to EC2

on:
  push:
    branches: [monteiro/bulma-ec2]
    paths-ignore:
      - 'docs/**'
      - 'tests/**'
      - 'infra/**'
      - '*.md'
      - '.gitignore'

env:
  AWS_REGION: us-east-2
  GHCR_IMAGE: ghcr.io/${{ github.repository }}/luma-bot

permissions:
  id-token: write
  contents: read
  packages: write

jobs:
  terraform:
    name: Terraform Apply
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/monteiro/bulma-ec2'
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::013459781186:role/LumaBotGHActionsRole
          aws-region: ${{ env.AWS_REGION }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        working-directory: infra
        run: terraform init

      - name: Terraform Apply
        working-directory: infra
        run: |
          terraform apply -auto-approve \
            -var="gemini_api_key=${{ secrets.GEMINI_API_KEY }}" \
            -var="openai_api_key=${{ secrets.OPENAI_API_KEY }}" \
            -var="deepseek_api_key=${{ secrets.DEEPSEEK_API_KEY }}" \
            -var="tavily_api_key=${{ secrets.TAVILY_API_KEY }}" \
            -var="owner_number=${{ secrets.OWNER_NUMBER }}" \
            -var="dashboard_password=${{ secrets.DASHBOARD_PASSWORD }}" \
            -var="cloudflare_api_token=${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -var="cloudflare_zone_id=${{ secrets.CLOUDFLARE_ZONE_ID }}"

      - name: Get EC2 Public IP
        id: ec2
        working-directory: infra
        run: |
          IP=$(terraform output -raw public_ip)
          echo "public_ip=$IP" >> $GITHUB_OUTPUT

  deploy:
    name: Deploy via SSH
    needs: terraform
    runs-on: ubuntu-latest
    if: success()
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::013459781186:role/LumaBotGHActionsRole
          aws-region: ${{ env.AWS_REGION }}

      - name: Get EC2 data via SSM
        id: ec2
        working-directory: infra
        run: |
          EC2_ID=$(terraform output -raw instance_id)
          echo "instance_id=$EC2_ID" >> $GITHUB_OUTPUT
          IP=$(aws ec2 describe-instances --instance-ids $EC2_ID \
            --query 'Reservations[0].Instances[0].PublicIpAddress' \
            --output text)
          echo "public_ip=$IP" >> $GITHUB_OUTPUT

      - name: Set up SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.EC2_SSH_PRIVATE_KEY }}" > ~/.ssh/luma-bot.pem
          chmod 600 ~/.ssh/luma-bot.pem

      - name: Deploy via SSM SendCommand
        run: |
          COMMAND_ID=$(aws ssm send-command \
            --instance-ids "${{ steps.ec2.outputs.instance_id }}" \
            --document-name "AWS-RunShellScript" \
            --parameters '{
              "commands": [
                "cd /app",
                "curl -s -H \"Authorization: token ${{ secrets.GITHUB_TOKEN }}\" \
                  -H \"Accept: application/vnd.github.v3.raw\" \
                  -L \"https://api.github.com/repos/${{ github.repository }}/contents/docker/compose.prod.yml\" \
                  -o /app/docker-compose.yml 2>/dev/null || true",
                "aws ecr get-login-password --region ${{ env.AWS_REGION }} | docker login --username AWS --password-stdin ${{ env.AWS_ACCOUNT }}.dkr.ecr.${{ env.AWS_REGION }}.amazonaws.com 2>/dev/null || true",
                "echo \"${{ secrets.GITHUB_TOKEN }}\" | docker login ghcr.io -u ${{ github.actor }} --password-stdin 2>/dev/null || true",
                "docker compose pull 2>/dev/null || true",
                "docker compose up -d",
                "sleep 5",
                "curl -sf http://localhost:3000/health && echo '✅ Health check passed' || echo '⚠️ Health check failed'"
              ]
            }' \
            --comment "Deploy LumaBot ${{ github.sha }}" \
            --query 'Command.CommandId' \
            --output text)
          echo "command_id=$COMMAND_ID" >> $GITHUB_OUTPUT

      - name: Wait for SSM command
        run: |
          sleep 15
          aws ssm get-command-invocation \
            --command-id "${{ steps.deploy.outputs.command_id }}" \
            --instance-id "${{ steps.ec2.outputs.instance_id }}" \
            --query 'Status' --output text

  healthcheck:
    name: Health Check
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Check /health endpoint
        run: |
          sleep 10
          IP=$(aws ec2 describe-instances \
            --filters "Name=tag:Name,Values=luma-bot-production" \
            --query 'Reservations[0].Instances[0].PublicIpAddress' \
            --output text)
          curl -sf "http://$IP/health" && echo "✅ LumaBot is healthy!" || echo "⚠️ Health check failed"
```

---

### Task 10: Commit e push

**Files:** Todos os arquivos acima

- [ ] **Step 1: Verificar status e commitar**

```bash
git add infra/ .github/ dashboard/server.js
git status
git commit -m "feat: add terraform + github actions for ec2 deploy"
```

- [ ] **Step 2: Push para upstream**

```bash
git push upstream monteiro/bulma-ec2
```
