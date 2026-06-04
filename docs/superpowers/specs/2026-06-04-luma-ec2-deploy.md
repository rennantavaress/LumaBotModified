# Deploy LumaBot no EC2 — Terraform + GitHub Actions OIDC

## Contexto

Fazer deploy do LumaBot (WhatsApp bot com IA) em uma EC2 na AWS,
com CI/CD via GitHub Actions autenticado por OIDC, sem usar S3 para
state do Terraform (state local versionado).

## Decisões

| Decisão | Escolha |
|---|---|
| Instância | t3.small (2vCPU, 2GB) — custo-benefício para Node + SQLite |
| Secrets | GitHub Secrets → user_data → `.env` na EC2 |
| Domínio | `luma.theralabs.com.br` na Cloudflare |
| IP | Público efêmero (sem Elastic IP) com DDNS |
| State Terraform | Local (versionar `.tfstate` no git ou `.gitignore`) |
| Branch | `monteiro/bulma-ec2` no repositório `murillous/LumaBot` |

## Estrutura de Arquivos

```
murillous/LumaBot:monteiro/bulma-ec2
├── Dockerfile                  # (já existe na branch, novo em relação a main)
├── Dockerfile.dev              # (novo)
├── .dockerignore               # (novo)
├── docker/
│   ├── compose.prod.yml
│   ├── compose.dev.yml
│   ├── docker-entrypoint.sh
│   ├── nginx/nginx.conf
│   └── nginx/conf.d/default.conf
├── docs/
│   ├── 06-Docker.md
│   └── 07-Producao.md
├── infra/
│   ├── main.tf                 # provider, VPC, subnet, IGW, SG, EC2
│   ├── variables.tf
│   ├── outputs.tf
│   ├── iam.tf                  # EC2 IAM role + GH Actions OIDC role
│   ├── user_data.sh.tpl        # script de bootstrap da EC2
│   └── terraform.tfvars.example
├── .github/
│   └── workflows/
│       └── deploy-ec2.yml      # CI/CD: build + deploy via SSH
└── dashboard/server.js         # + rota /health
```

## Arquitetura AWS

- **VPC**: `10.0.0.0/16` com 1 subnet pública `10.0.1.0/24`
- **Internet Gateway**: para acesso público
- **Security Group**:
  - SSH (22) — apenas IP do desenvolvedor
  - HTTP (80) — público (para Let's Encrypt)
  - HTTPS (443) — público
  - Dashboard (3000) — público com senha via env
- **EC2**: Amazon Linux 2023, t3.small, 20GB gp3, Docker + compose plugin
- **IAM**:
  - `LumaBotEC2Role` — perfil EC2 (acesso logs, SSM opcional)
  - `LumaBotGHActionsRole` — OIDC federado para GitHub Actions (`murillous/LumaBot`, branch `monteiro/bulma-ec2`)
- **Key pair**: reutilizar `access-key-crea-erp` (já existe na conta)

## Fluxo de Deploy

```
Push na branch monteiro/bulma-ec2
  → GitHub Actions (OIDC → AWS)
  → docker build + docker tag + (registry opcional)
  → SSH na EC2
  → docker compose pull (ou build local)
  → docker compose up -d
  → healthcheck valida
```

## Bootstrap da EC2 (user_data)

1. Instala Docker + docker compose plugin
2. Cria diretório `/app`
3. Monta `.env` a partir das variáveis recebidas (GitHub Secrets)
4. Instala script DDNS Cloudflare como serviço systemd
5. (Opcional) Gera certificado Let's Encrypt se domínio apontar
6. Sobe os containers via docker compose

## Estratégia de Dados Persistentes

- `auth_info/` — sessão do WhatsApp (volume Docker)
- `data/` — SQLite (volume Docker)
- Ambos montados como volumes locais na EC2
- Backup manual via script (fora do escopo inicial)

## DDNS (Cloudflare)

Script `/usr/local/bin/cloudflare-ddns.sh`:
- Obtém IP público via `ifconfig.me`
- Compara com registro A atual de `luma.theralabs.com.br`
- Atualiza via API Cloudflare se mudou
- Roda a cada 5 min via systemd timer
- Logs em `/var/log/cloudflare-ddns.log`
