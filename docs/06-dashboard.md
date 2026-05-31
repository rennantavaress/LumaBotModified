# 🎛 Dashboard Web

O dashboard controla o bot, mostra logs/métricas em tempo real e permite
configurar **tudo** que vive em `src/config` sem editar código. São duas peças:

- **Backend** — `dashboard/server.js` (Express + WebSocket + API REST). Sobe o
  servidor web e spawna o bot (`index.js`) como processo filho.
- **Frontend** — `dashboard/web/` (Vite + React + TypeScript + Tailwind),
  buildado para `dashboard/web/dist` e servido pelo backend.

```
Navegador ──HTTP/WS──► dashboard/server.js ──spawn──► index.js (bot)
                              │                            │
                       serve dist/ (SPA)           stdout: [LUMA_QR] / [LUMA_STATUS]
                              │                            │
                       API REST /api/*  ◄── lê SQLite (data/*.sqlite)
```

---

## 🚀 Como rodar

```bash
# build do app React (uma vez, ou quando o front mudar)
npm run dashboard:build        # → dashboard/web/dist

# subir backend + bot (via launcher, com auto-restart)
npm run dashboard              # http://localhost:3000

# desenvolvimento do front (hot-reload, proxy /api e /ws → :3000)
npm run dashboard:web:dev      # http://localhost:5173
```

Se `dashboard/web/dist` não existir, o backend cai no dashboard **legado** em
`src/public` (vanilla). Com o build presente, serve a SPA React.

---

## 🔌 API REST

Todas as rotas de dados exigem sessão válida (cookie `dash_token`) quando
`DASHBOARD_PASSWORD` está definido; caso contrário ficam abertas. Corpo limitado
a 10 KB, com os mesmos headers de segurança e rate-limit do resto do servidor.

| Método | Rota | Função |
|--------|------|--------|
| `POST` | `/api/login` | Autentica e devolve cookie `dash_token` (TTL 7 dias) |
| `GET`  | `/api/status` | Estado do bot (status, uptime, PID, QR, tunnel) |
| `GET`  | `/api/logs` | Histórico de logs (filtros `level`, `search`, `limit`) |
| `GET`  | `/api/stats` | Métricas agregadas (`luma_metrics.sqlite`) |
| `GET`  | `/api/config` | Schema + valores atuais (secrets mascarados) |
| `PUT`  | `/api/config` | Grava alterações (`{ changes: [...] }`) |
| `GET`  | `/api/users` | Perfis conhecidos (`wa_users`) com nome resolvido |
| `PUT`  | `/api/users/:jid/nick` | Define o apelido (`bot_nickname`) |
| `GET`  | `/api/ranking?scope=global\|group&jid=` | Ranking de interações |
| `GET`  | `/api/reminders` | Lembretes pendentes |
| `DELETE` | `/api/reminders/:id` | Cancela um lembrete |
| `POST` | `/api/bot/start\|stop\|restart` | Controle do processo do bot |
| `POST` | `/api/deploy` | Webhook de deploy (HMAC, push na `main`) |

**WebSocket** (`/ws`): envia `init` com o estado completo ao conectar e depois
eventos `log`, `status`, `qr`, `qr_clear`, `tunnel_url`. Autenticação por cookie
(fallback `?token=`).

---

## ⚙️ Configuração em runtime (camada de override)

O dashboard edita toda a config sem reescrever os arquivos `.js`:

```
src/config/configSchema.js   → descreve cada campo (grupo, tipo, source, secret)
src/config/configService.js  → lê valores atuais + grava alterações
src/config/ConfigStore.js    → mescla overrides sobre os defaults no boot
```

Cada campo tem um `source`:

- **`env`** → vai para o arquivo `.env` (e atualiza `process.env` para o próximo
  spawn do bot). Ex: `AI_PROVIDER`, chaves de API, `DASHBOARD_PORT`.
- **`config`** → vai para `data/config-overrides.json` (gitignored), mesclado
  por `ConfigStore` sobre `constants.js`/`lumaConfig.js`. Ex: personalidades,
  `generationConfig`, limites, spontaneous, prompts, mensagens.

> As alterações entram em vigor **no restart do bot**. O dashboard oferece um
> botão "Reiniciar agora" após salvar. Secrets são mascarados na leitura
> (`••••XXXX`) e só sobrescritos se um novo valor for digitado.

Grupos do schema: IA & Provedor · Bot & Dashboard · Ajuste fino da IA ·
Interações espontâneas · Mídia & Limites · Personalidades · Prompts ·
Mensagens & Menus.

---

## 🖥 Telas (`dashboard/web/src/pages`)

| Tela | O que faz |
|------|-----------|
| **Overview** | Status, controles start/stop/restart, QR Code, métricas |
| **Logs** | Stream em tempo real (WS), filtros por nível + busca |
| **Config** | Formulários gerados do schema — edita toda a `src/config` |
| **Social** | Ranking de interações + edição de apelidos dos usuários |
| **Lembretes** | Lista e cancela lembretes pendentes |
| **Login** | Autenticação por senha (quando configurada) |

Identidade visual da marca **Thera**: roxo `#8B2FE0` (primária), azul `#0A6CE0`
(accent), fundo quase-preto, off-white. Mobile-first e 100% responsivo (rail
lateral no desktop, navegação inferior no mobile). Fontes self-hosted
(Space Grotesk / IBM Plex Sans / JetBrains Mono) para respeitar o CSP `'self'`.

---

## 🚀 Deploy e supervisão

### Auto-deploy (`/api/deploy`)

Push na `main` → webhook (HMAC-SHA256 com `DEPLOY_WEBHOOK_SECRET`) →
`runDeploy`:

```
git pull → npm install (se package* mudou) → npm ci + build do dashboard → restart
```

O restart só ocorre quando o processo é **supervisionado** (PM2/systemd ou o
launcher) — aí backend **e** painel sobem com o código novo. Sem supervisor,
apenas o bot reinicia e um aviso é logado.

### Launcher (`dashboard/launch.js`)

Mantém `npm run dashboard` como comando único e reinicia o `server.js` quando
ele sai (código 0 no deploy → respawn imediato; crash → backoff). Mata o
bot-filho ao reiniciar para não duplicar a sessão do WhatsApp. Marca o ambiente
com `LUMA_SUPERVISED=1`.

### PM2 (produção, sobrevive a reboot)

```bash
npm install -g pm2
npm run dashboard:build
pm2 start ecosystem.config.cjs   # script: dashboard/server.js, LUMA_SUPERVISED=1
pm2 save && pm2 startup
```

Autorestart + persistência no boot. No deploy, o `server.js` sai com código 0 e
o PM2 respawna.

---

## 🔐 Segurança

- Sessões aleatórias (`crypto.randomBytes`), cookie `httpOnly` + `sameSite`.
- Rate-limit em login (10/15min) e controle do bot (10/min).
- Headers `X-Content-Type-Options`, `X-Frame-Options`, CSP `'self'`.
- API keys mascaradas na leitura; nunca trafegam em texto no WebSocket.
- Webhook de deploy validado por HMAC com guarda de comprimento antes do
  `timingSafeEqual`.

---

**Anterior:** [05-conexao-wa.md](./05-conexao-wa.md) · **Início:** [README](./README.md)
