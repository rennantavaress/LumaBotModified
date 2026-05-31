// Configuração do PM2 para rodar o LumaBot em produção.
//
// O dashboard (dashboard/server.js) é o processo principal: ele sobe o servidor
// web e spawna o bot (index.js) como processo filho. Rodar sob PM2 permite que
// o auto-deploy (/api/deploy) reinicie o próprio dashboard ao receber um push na
// main — assim mudanças no backend E no painel são aplicadas sem tocar no servidor.
//
// Uso:
//   pm2 start ecosystem.config.cjs
//   pm2 save && pm2 startup   (para iniciar no boot da máquina)
//   pm2 logs luma             (acompanhar logs)

module.exports = {
  apps: [
    {
      name: "luma",
      script: "dashboard/server.js",
      cwd: __dirname,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 2000,
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
