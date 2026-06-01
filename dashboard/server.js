import express    from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { spawn, execSync } from 'child_process';
import crypto        from 'crypto';
import { fileURLToPath } from 'url';
import path          from 'path';
import fs           from 'fs';
import QRCode        from 'qrcode';
import dotenv        from 'dotenv';
import Database      from 'better-sqlite3';

import { readConfig, writeConfig } from '../src/config/configService.js';
import { DatabaseService }         from '../src/services/Database.js';
import { ReminderService }         from '../src/core/services/ReminderService.js';
import { UserResolver }            from '../src/core/services/UserResolver.js';

dotenv.config();

// ─── Sessões e Rate Limiting ─────────────────────────────────────────────────

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const sessions = new Map(); // token -> { createdAt }

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { createdAt: Date.now() });
  return token;
}

function isValidSession(token) {
  if (!token) return false;
  const session = sessions.get(token);
  if (!session) return false;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return false;
  }
  return true;
}

// Rate limiting simples em memória
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 min
const LOGIN_MAX_ATTEMPTS = 10;

const botControlAttempts = new Map();
const BOT_CONTROL_WINDOW_MS = 60 * 1000; // 1 min
const BOT_CONTROL_MAX = 10;

function checkRateLimit(map, key, windowMs, max) {
  const now = Date.now();
  const record = map.get(key);
  if (!record) {
    map.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }
  if (now - record.windowStart > windowMs) {
    record.count = 1;
    record.windowStart = now;
    return { ok: true };
  }
  record.count++;
  if (record.count > max) {
    return { ok: false, retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000) };
  }
  return { ok: true };
}

function cleanupRateLimitMaps() {
  const now = Date.now();
  for (const [key, record] of loginAttempts) {
    if (now - record.windowStart > LOGIN_WINDOW_MS) loginAttempts.delete(key);
  }
  for (const [key, record] of botControlAttempts) {
    if (now - record.windowStart > BOT_CONTROL_WINDOW_MS) botControlAttempts.delete(key);
  }
  for (const [token, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) sessions.delete(token);
  }
}
setInterval(cleanupRateLimitMaps, 60000);

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR   = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'src', 'public');
// App React buildado (Vite). Se existir, tem prioridade sobre o legado em src/public.
const WEB_DIST   = path.join(__dirname, 'web', 'dist');
const HAS_WEB_BUILD = fs.existsSync(path.join(WEB_DIST, 'index.html'));
const SERVE_DIR  = HAS_WEB_BUILD ? WEB_DIST : PUBLIC_DIR;

const PORT           = parseInt(process.env.DASHBOARD_PORT  || '3000', 10);
const PASSWORD       = process.env.DASHBOARD_PASSWORD       || '';
const TUNNEL_ENABLED  = process.env.CLOUDFLARE_TUNNEL === 'true';
const TUNNEL_URL_FILE = path.join(ROOT_DIR, 'data', 'tunnel-url.txt');
const DEPLOY_SECRET  = process.env.DEPLOY_WEBHOOK_SECRET    || '';

let deployDebounceTimer = null;
const DEPLOY_DEBOUNCE_MS = 5000;

// ─── Estado global ────────────────────────────────────────────────────────────

let botProcess   = null;
let botStatus    = 'stopped'; // stopped | starting | connecting | qr_wait | running | error
let botStartTime = null;
let reconnectCount = 0;
let currentQR    = null;
let publicUrl    = null;

const logBuffer = [];
const MAX_LOGS  = 500;
const wsClients = new Set();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseLevel(line) {
  if (/❌|error|Error/.test(line))        return 'error';
  if (/⚠️|warn|Warn/.test(line))         return 'warn';
  if (/✅|Conectado|sucesso/i.test(line)) return 'success';
  return 'info';
}

function pushLog(message, level) {
  const entry = {
    timestamp: Date.now(),
    level:     level ?? parseLevel(message),
    message:   message.trim(),
  };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) logBuffer.shift();
  broadcast({ type: 'log', ...entry });
}

function broadcast(event) {
  const data = JSON.stringify(event);
  for (const ws of wsClients) {
    if (ws.readyState === ws.OPEN) {
      try { ws.send(data); } catch (_) {}
    }
  }
}

function setStatus(status) {
  botStatus = status;
  broadcast({ type: 'status', status });
}

function getUptime() {
  return botStartTime ? Date.now() - botStartTime : 0;
}

// ─── Bot ──────────────────────────────────────────────────────────────────────

function startBot() {
  if (botProcess) return { ok: false, error: 'Bot já está rodando' };

  setStatus('starting');
  currentQR    = null;
  botStartTime = Date.now();
  pushLog('▶ Iniciando processo do bot...', 'info');

  botProcess = spawn('node', ['index.js'], {
    cwd:   ROOT_DIR,
    env:   { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdoutBuf = '';

  botProcess.stdout.on('data', (chunk) => {
    stdoutBuf += chunk.toString();
    const lines = stdoutBuf.split('\n');
    stdoutBuf   = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;

      if (line.startsWith('[LUMA_QR]:')) {
        handleQRSignal(line.slice('[LUMA_QR]:'.length).trim());
        continue;
      }
      if (line.startsWith('[LUMA_STATUS]:')) {
        handleStatusSignal(line.slice('[LUMA_STATUS]:'.length).trim());
        continue;
      }

      pushLog(line);
    }
  });

  botProcess.stderr.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text) pushLog(text, 'error');
  });

  botProcess.on('close', (code) => {
    botProcess   = null;
    botStartTime = null;
    currentQR    = null;
    reconnectCount++;
    pushLog(`Processo encerrado (código ${code ?? '?'})`, code === 0 ? 'info' : 'error');
    setStatus('stopped');
  });

  botProcess.on('error', (err) => {
    pushLog(`Erro ao iniciar processo: ${err.message}`, 'error');
    setStatus('error');
    botProcess = null;
  });

  return { ok: true };
}

function stopBot() {
  if (!botProcess) return { ok: false, error: 'Bot não está rodando' };
  pushLog('⏹ Encerrando bot...', 'warn');
  botProcess.kill('SIGTERM');
  return { ok: true };
}

function restartBot() {
  pushLog('🔄 Reiniciando bot...', 'warn');
  if (botProcess) { botProcess.kill('SIGTERM'); botProcess = null; }
  setTimeout(startBot, 1500);
  return { ok: true };
}

// Encerra os processos filhos (bot e tunnel) quando o dashboard sai — incluindo
// o restart de deploy — para não deixar uma segunda sessão do bot órfã.
function shutdownChildren() {
  try { botProcess?.kill('SIGTERM'); } catch { /* já encerrado */ }
  // Quando supervisionado pelo PM2, o tunnel roda como processo irmão (luma-tunnel)
  // e não deve ser encerrado junto com o dashboard.
  if (!IS_SUPERVISED) {
    try { tunnelProcess?.kill('SIGTERM'); } catch { /* já encerrado */ }
  }
}
process.on('exit', shutdownChildren);
process.on('SIGTERM', () => { shutdownChildren(); process.exit(0); });
process.on('SIGINT', () => { shutdownChildren(); process.exit(0); });

async function handleQRSignal(qrRaw) {
  try {
    const dataUrl = await QRCode.toDataURL(qrRaw, {
      margin: 1,
      width:  256,
      color:  { dark: '#00ff00', light: '#0d1117' },
    });
    currentQR = dataUrl;
    setStatus('qr_wait');
    broadcast({ type: 'qr', dataUrl });
    pushLog('📱 QR Code gerado — aguardando escaneamento', 'warn');
  } catch (err) {
    pushLog(`Erro ao renderizar QR: ${err.message}`, 'error');
  }
}

function handleStatusSignal(signal) {
  switch (signal) {
    case 'connected':
      currentQR    = null;
      botStartTime = botStartTime ?? Date.now();
      broadcast({ type: 'qr_clear' });
      setStatus('running');
      break;
    case 'connecting':
      setStatus('connecting');
      break;
    case 'disconnected':
      currentQR = null;
      setStatus('stopped');
      break;
  }
}

// ─── Cloudflare Tunnel ────────────────────────────────────────────────────────

let tunnelProcess  = null;
let tunnelRestarts = 0;
const MAX_TUNNEL_RESTARTS = 10;

function readTunnelUrlFile() {
  try {
    const url = fs.readFileSync(TUNNEL_URL_FILE, 'utf-8').trim();
    if (url && url !== publicUrl) {
      publicUrl = url;
      pushLog(`🌐 URL do tunnel: ${url}`, 'info');
      broadcast({ type: 'tunnel_url', url });
      console.log(`\n🌐 Acesso externo: ${url}\n`);
    }
  } catch { /* arquivo ainda não existe — tunnel ainda está subindo */ }
}

function startTunnel() {
  if (!TUNNEL_ENABLED || tunnelProcess) return;

  // Quando supervisionado (PM2), o tunnel roda como processo irmão (luma-tunnel).
  // O dashboard apenas lê a URL do arquivo gravado por aquele processo.
  if (IS_SUPERVISED) {
    readTunnelUrlFile();
    try { fs.watch(TUNNEL_URL_FILE, () => readTunnelUrlFile()); } catch { /* arquivo ainda não existe */ }
    return;
  }

  pushLog(`🌐 Iniciando Cloudflare Tunnel... (tentativa ${tunnelRestarts + 1})`, 'info');

  tunnelProcess = spawn(
    'cloudflared',
    ['tunnel', '--no-autoupdate', '--url', `http://localhost:${PORT}`],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const onData = (chunk) => {
    const text = chunk.toString();

    for (const line of text.split('\n')) {
      const clean = line.trim();
      if (!clean) continue;
      if (/INF|ERR|WRN/.test(clean)) {
        pushLog(`[cloudflared] ${clean}`, clean.includes('ERR') ? 'error' : clean.includes('WRN') ? 'warn' : 'info');
      }
    }

    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && match[0] !== publicUrl) {
      publicUrl = match[0];
      pushLog(`✅ URL pública: ${publicUrl}`, 'success');
      broadcast({ type: 'tunnel_url', url: publicUrl });
      console.log(`\n🌐 Acesso externo: ${publicUrl}\n`);
    }
  };

  tunnelProcess.stdout.on('data', onData);
  tunnelProcess.stderr.on('data', onData);

  tunnelProcess.on('close', (code) => {
    tunnelProcess = null;
    publicUrl     = null;
    broadcast({ type: 'tunnel_url', url: null });
    pushLog(`Tunnel encerrado (código ${code ?? '?'})`, code === 0 ? 'info' : 'warn');

    if (tunnelRestarts < MAX_TUNNEL_RESTARTS) {
      const delay = Math.min(5000 * ++tunnelRestarts, 60000);
      pushLog(`🔁 Reconectando tunnel em ${delay / 1000}s...`, 'info');
      setTimeout(startTunnel, delay);
    } else {
      pushLog('❌ Tunnel: máximo de tentativas atingido.', 'error');
    }
  });

  tunnelProcess.on('error', (err) => {
    tunnelProcess = null;
    pushLog(err.message.includes('ENOENT')
      ? '❌ cloudflared não encontrado no PATH.'
      : `Erro no tunnel: ${err.message}`, 'error');
  });
}

// ─── Deploy ───────────────────────────────────────────────────────────────────

function verifyGitHubSignature(req) {
  const signature = req.headers['x-hub-signature-256'] || '';
  const expected  = 'sha256=' + crypto
    .createHmac('sha256', DEPLOY_SECRET)
    .update(req.rawBody)
    .digest('hex');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  try {
    return crypto.timingSafeEqual(expBuf, sigBuf);
  } catch {
    return false;
  }
}

// Indica se o processo roda sob um supervisor (pm2/systemd) que o reinicia
// automaticamente ao sair. Necessário para aplicar mudanças no próprio server.js.
const IS_SUPERVISED = !!(
  process.env.LUMA_SUPERVISED ??
  process.env.pm_id ??
  process.env.PM2_HOME ??
  process.env.INVOCATION_ID
);
const WEB_DIR = path.join(__dirname, 'web');

function runDeploy() {
  pushLog('🚀 Deploy iniciado (push na main)...', 'info');
  try {
    pushLog('📥 Executando git pull...', 'info');
    execSync('git pull origin main', { cwd: ROOT_DIR, timeout: 60000 });

    // Arquivos alterados pelo pull (HEAD@{1} = estado anterior). Em caso de
    // falha (reflog ausente), assume que tudo mudou para não pular nenhum build.
    let changed = '';
    try {
      changed = execSync('git diff --name-only HEAD@{1} HEAD', { cwd: ROOT_DIR }).toString();
    } catch {
      changed = 'package.json dashboard/web/package.json';
    }

    if (/(^|\/)package(-lock)?\.json/m.test(changed)) {
      pushLog('📦 Instalando dependências do bot...', 'info');
      execSync('npm install --omit=dev --no-audit', { cwd: ROOT_DIR, timeout: 180000 });
    }

    // Dashboard React (Vite): instala devDeps (necessárias ao build) e regenera
    // o dist. O dist não é versionado, então precisa ser buildado no servidor.
    if (fs.existsSync(path.join(WEB_DIR, 'package.json'))) {
      const webDepsChanged = /dashboard\/web\/package(-lock)?\.json/.test(changed);
      const needsInstall = webDepsChanged || !fs.existsSync(path.join(WEB_DIR, 'node_modules'));
      if (needsInstall) {
        pushLog('📦 Instalando dependências do dashboard...', 'info');
        execSync('npm ci --no-audit', { cwd: WEB_DIR, timeout: 300000 });
      }
      pushLog('🏗️ Buildando o dashboard...', 'info');
      execSync('npm run build', { cwd: WEB_DIR, timeout: 300000 });
    }

    pushLog('✅ Deploy concluído.', 'success');

    if (IS_SUPERVISED) {
      // Reinicia o processo inteiro: carrega o novo server.js, serve o dist
      // recém-buildado e o backend sobe com o código novo. O supervisor respawna.
      pushLog('🔄 Reiniciando o dashboard para aplicar as mudanças...', 'warn');
      setTimeout(() => process.exit(0), 1500);
    } else {
      // Sem supervisor não podemos reiniciar a nós mesmos com segurança.
      // O backend é reiniciado; o painel exige restart manual do processo.
      restartBot();
      pushLog('⚠️ Backend reiniciado. Rode o dashboard sob pm2/systemd para que o painel também atualize sozinho (veja ecosystem.config.cjs).', 'warn');
    }
  } catch (error) {
    pushLog(`❌ Deploy falhou: ${error.message}`, 'error');
  }
}

function scheduleDeploy() {
  clearTimeout(deployDebounceTimer);
  deployDebounceTimer = setTimeout(runDeploy, DEPLOY_DEBOUNCE_MS);
}

// ─── Express ──────────────────────────────────────────────────────────────────

const app    = express();
const server = createServer(app);

// Headers de segurança (helmet-like)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws: wss:;");
  next();
});

app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; },
  limit: '10kb',
}));

function getToken(req) {
  const fromCookie = req.headers.cookie?.match(/(?:^|;\s*)dash_token=([^;]+)/)?.[1];
  return req.headers['x-dashboard-token']
    || (fromCookie ? decodeURIComponent(fromCookie) : '')
    || '';
}

// Assets estáticos públicos — necessários para a página de login renderizar com estilo
const PUBLIC_STATIC = new Set(['/styles.css', '/favicon.ico', '/barba-init.js']);

function authMiddleware(req, res, next) {
  if (!PASSWORD) return next();
  if (PUBLIC_STATIC.has(req.path)) return next();
  const token = getToken(req);
  if (isValidSession(token)) return next();
  if (req.headers.accept?.includes('text/html')) return res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
  return res.status(401).json({ error: 'Unauthorized' });
}

// Rotas públicas
app.post('/api/login', (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const limit = checkRateLimit(loginAttempts, clientIp, LOGIN_WINDOW_MS, LOGIN_MAX_ATTEMPTS);
  if (!limit.ok) {
    return res.status(429).json({ error: 'Muitas tentativas. Tente novamente mais tarde.' });
  }

  const { password } = req.body ?? {};
  if (!PASSWORD || password === PASSWORD) {
    const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.secure;
    const token = createSession();
    res.cookie('dash_token', token, {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'strict',
      secure:   isSecure,
      path:     '/',
      maxAge:   SESSION_TTL_MS,
    });
    res.json({ ok: true, token });
  } else {
    res.status(401).json({ error: 'Senha incorreta' });
  }
});

app.get('/login', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'login.html')));

app.post('/api/deploy', (req, res) => {
  if (!DEPLOY_SECRET) {
    pushLog('⚠️ /api/deploy desativado — configure DEPLOY_WEBHOOK_SECRET no .env', 'warn');
    return res.status(503).json({ error: 'Deploy não configurado' });
  }

  if (!verifyGitHubSignature(req)) {
    pushLog('⚠️ Deploy: assinatura inválida — request rejeitado', 'warn');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.body.ref !== 'refs/heads/main') {
    return res.status(200).json({ ok: true, message: 'Branch ignorada' });
  }

  res.status(200).json({ ok: true, message: 'Deploy agendado' });
  scheduleDeploy();
});

// ─── Servir a aplicação ────────────────────────────────────────────────────────
// Com build React presente, os assets são públicos (a UI cuida do login via API).
// Sem build, mantém o dashboard legado (vanilla) protegido pelo authMiddleware.
if (HAS_WEB_BUILD) {
  app.use(express.static(WEB_DIST));
} else {
  app.use(authMiddleware);
  app.use(express.static(PUBLIC_DIR));
}

/** Autenticação dos endpoints de dados — sempre JSON 401 quando não autorizado. */
function apiAuth(req, res, next) {
  if (!PASSWORD) return next();
  if (isValidSession(getToken(req))) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

app.get('/api/status', apiAuth, (_req, res) => {
  res.json({ status: botStatus, uptime: getUptime(), reconnects: reconnectCount, pid: botProcess?.pid ?? null, hasQR: !!currentQR, qr: currentQR, publicUrl });
});

app.get('/api/logs', apiAuth, (req, res) => {
  const { level, search, limit = 200 } = req.query;
  let logs = [...logBuffer];
  if (level && level !== 'all') logs = logs.filter(l => l.level === level);
  if (search) { const q = search.toLowerCase(); logs = logs.filter(l => l.message.toLowerCase().includes(q)); }
  res.json(logs.slice(-parseInt(limit)));
});

app.get('/api/stats', apiAuth, (_req, res) => {
  const dbPath = path.join(ROOT_DIR, 'data', 'luma_metrics.sqlite');
  try {
    if (!fs.existsSync(dbPath)) return res.json({});
    const db   = new Database(dbPath, { readonly: true });
    const rows = db.prepare('SELECT key, count FROM metrics').all();
    db.close();
    const stats = {};
    for (const row of rows) stats[row.key] = row.count;
    res.json(stats);
  } catch (_) {
    res.json({});
  }
});

// ─── Configuração ───────────────────────────────────────────────────────────────
app.get('/api/config', apiAuth, (_req, res) => {
  try {
    res.json(readConfig());
  } catch (err) {
    pushLog(`Erro ao ler config: ${err.message}`, 'error');
    res.status(500).json({ error: 'Falha ao ler configuração' });
  }
});

app.put('/api/config', apiAuth, (req, res) => {
  try {
    writeConfig(req.body?.changes ?? []);
    pushLog('⚙️ Configuração atualizada pelo dashboard', 'info');
    res.json({ ok: true });
  } catch (err) {
    pushLog(`Erro ao salvar config: ${err.message}`, 'error');
    res.status(400).json({ error: err.message });
  }
});

// ─── Usuários & Ranking ───────────────────────────────────────────────────────
app.get('/api/users', apiAuth, (_req, res) => {
  try {
    const users = DatabaseService.getAllWaUsers().map((u) => ({
      jid: u.jid,
      displayName: UserResolver.getDisplayName(u),
      nickname: u.bot_nickname ?? '',
      pushName: u.push_name ?? '',
      lastSeen: u.last_seen_at,
    }));
    res.json(users);
  } catch (_) {
    res.json([]);
  }
});

app.put('/api/users/:jid/nick', apiAuth, (req, res) => {
  const { jid } = req.params;
  const nickname = String(req.body?.nickname ?? '').trim().slice(0, 60);
  try {
    DatabaseService.setNickname(jid, nickname);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/ranking', apiAuth, (req, res) => {
  const { scope = 'global', jid } = req.query;
  try {
    const rows = scope === 'group' && jid
      ? DatabaseService.getGroupRanking(jid, 20)
      : DatabaseService.getGlobalRanking(20);
    res.json(rows.map((r) => ({
      jid: r.sender_jid,
      name: UserResolver.getDisplayName(r.sender_jid),
      count: r.count,
      lastAt: r.last_at,
    })));
  } catch (_) {
    res.json([]);
  }
});

// ─── Lembretes ────────────────────────────────────────────────────────────────
app.get('/api/reminders', apiAuth, (_req, res) => {
  try {
    res.json(ReminderService.getPending());
  } catch (_) {
    res.json([]);
  }
});

app.delete('/api/reminders/:id', apiAuth, (req, res) => {
  try {
    ReminderService.cancel(parseInt(req.params.id, 10));
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function botControlMiddleware(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const limit = checkRateLimit(botControlAttempts, clientIp, BOT_CONTROL_WINDOW_MS, BOT_CONTROL_MAX);
  if (!limit.ok) {
    return res.status(429).json({ error: 'Muitas requisições. Aguarde.' });
  }
  next();
}

app.post('/api/bot/start',   apiAuth, botControlMiddleware, (_req, res) => res.json(startBot()));
app.post('/api/bot/stop',    apiAuth, botControlMiddleware, (_req, res) => res.json(stopBot()));
app.post('/api/bot/restart', apiAuth, botControlMiddleware, (_req, res) => res.json(restartBot()));

// SPA fallback: qualquer GET fora de /api serve o index.html do app React.
if (HAS_WEB_BUILD) {
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(WEB_DIST, 'index.html')));
} else {
  app.get('/', authMiddleware, (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'dashboard.html')));
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // Autenticação: cookie httpOnly tem prioridade; query param ?token= como fallback
  // para ambientes onde proxies/tunnels não repassam Cookie no upgrade WebSocket.
  const cookieHeader = req.headers.cookie || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)dash_token=([^;]+)/);
  const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : '';

  const reqUrl     = new URL(req.url, 'http://localhost');
  const queryToken = reqUrl.searchParams.get('token') || '';

  const token = cookieToken || queryToken;

  if (PASSWORD && !isValidSession(token)) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  // Envia estado completo imediatamente
  ws.send(JSON.stringify({
    type:      'init',
    status:    botStatus,
    qr:        currentQR,
    publicUrl,
    logs:      logBuffer.slice(-150),
  }));

  wsClients.add(ws);

  // Keepalive ping a cada 25s
  const ping = setInterval(() => {
    if (ws.readyState === ws.OPEN) ws.ping();
  }, 25000);

  ws.on('close', () => { clearInterval(ping); wsClients.delete(ws); });
  ws.on('error', () => { clearInterval(ping); wsClients.delete(ws); });
});

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n🖥️  Dashboard disponível em http://localhost:${PORT}`);
  console.log(PASSWORD ? '🔒 Acesso protegido por senha.\n' : '⚠️  Sem senha. Defina DASHBOARD_PASSWORD no .env.\n');
  startBot();
  startTunnel();
});
