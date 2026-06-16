import { ConfigStore } from "./ConfigStore.js";

export const CONFIG = ConfigStore.apply("CONFIG", {
  TEMP_DIR: "./temp",
  AUTH_DIR: "./auth_info",

  MAX_RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 5000,
  MIN_CLEAN_INTERVAL: 60000,
  STICKER_SIZE: 512,
  STICKER_QUALITY: 90,
  VIDEO_DURATION: 20,
  GIF_DURATION: 15,
  GIF_FPS: 15,
  VIDEO_FPS: 15,
  MAX_FILE_SIZE: 800,
  VIDEO_DOWNLOAD_MAX_SIZE_MB: 100,
  VIDEO_DOWNLOAD_TIMEOUT_MS: 240000,
  VIDEO_DOWNLOAD_FORMAT:
    "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best/best",
  AUDIO_DOWNLOAD_FORMAT: "bestaudio/best",
  WEBP_QUALITY: 75,
  MAX_GIF_FRAMES: 50,
  TIMEOUT_MS: 60000,
  KEEPALIVE_MS: 30000,
  IGNORE_SELF: true,
});

export const STICKER_METADATA = ConfigStore.apply("STICKER_METADATA", {
  PACK_NAME: "LumaBot  Stickers",
  AUTHOR: "Criado com ❤️ por LumaBot",
});

export const COMMANDS = ConfigStore.apply("COMMANDS", {
  // 🎨 Mídia
  STICKER: "!sticker",
  STICKER_SHORT: "!s",
  IMAGE: "!image",
  IMAGE_SHORT: "!i",
  PDF: "!pdf",
  PDF_MERGE: "!mergepdf",
  PDF_MERGE_ALT: "!joinpdf",
  GIF: "!gif",
  GIF_SHORT: "!g",
  
  // 🎵 Áudio/Música (NOVO - mais intuitivo)
  MUSIC: "!musica",              // 🇧🇷 Português natural
  MUSIC_EN: "!music",            // 🇺🇸 Internacional
  SONG: "!song",                 // 🎶 Música em inglês
  TRACK: "!track",               // 🎧 Faixa/trilha (seu pedido)
  AUDIO_DOWNLOAD: "!audio",      // 🔄 Mantido por compatibilidade
  AUDIO_DOWNLOAD_SHORT: "!a",    // 🔄 Mantido por compatibilidade
  DOWNLOAD_SHORT: "!d",
  DOWNLOAD: "!download",
  
  // 🧠 IA e Personalidade
  HELP: "!help",
  PERSONA: "!persona",
  LUMA_STATS: "!luma stats",
  LUMA_STATS_SHORT: "!ls",
  LUMA_CLEAR: "!luma clear",
  LUMA_CLEAR_SHORT: "!lc",
  LUMA_CLEAR_ALT: "!clear",
  
  // 👥 Social
  EVERYONE: "@everyone",
  EVERYONE_ALT: "@todos",
  NICK: "!nick",
  NICK_ALT: "!apelido",
  RANK: "!rank",
  REMINDER: "!lembrete",
  REMINDER_SHORT: "!lembrar",
  
  // 📊 Utilitários
  MY_NUMBER: "!meunumero",
  RESUMO: "!resumo",
});

export const MENUS = ConfigStore.apply("MENUS", {
  HELP_TEXT:
    "🤖 *LISTA DE COMANDOS* 🤖\n\n" +
    "🎨 *MÍDIA*\n" +
    "• *!sticker* (!s) - Imagem/Vídeo/Link -> Sticker\n" +
    "• *!gif* (!g) - Sticker Animado -> GIF\n" +
    "• *!image* (!i) - Sticker -> Imagem\n" +
    "• *!pdf* - Imagem -> PDF\n" +
    "• *!mergepdf* - Adiciona PDFs; finalize com !mergepdf done nome\n\n" +
    "🎵 *ÁUDIO E MÚSICA* (NOVO!)\n" +
    "• *!musica* - Baixa música de qualquer link (recomendado)\n" +
    "• *!music* - Mesmo que !musica (versão em inglês)\n" +
    "• *!song* - Baixa música (em inglês)\n" +
    "• *!track* - Baixa faixa de áudio\n" +
    "• *!audio* (!a) - Baixa áudio (compatibilidade)\n" +
    "• *!download* (!d) - Baixa vídeo do Twitter/X ou Instagram\n\n" +
    "🧠 *INTELIGÊNCIA ARTIFICIAL*\n" +
    "• *Luma* - Fale qualquer coisa (ex: 'Luma, bom dia')\n" +
    "• *!persona* - Abre o menu para mudar a Luma\n" +
    "• *!luma clear* (!lc ou !clear) - Limpa memória da conversa\n" +
    "• *!luma stats* (!ls) - Mostra estatísticas da Luma\n\n" +
    "🏆 *SOCIAL*\n" +
    "• *!rank* - Ranking de quem mais interage com a Luma no grupo\n" +
    "• *!rank global* - Ranking geral (todos os chats)\n" +
    "• *!nick SeuNome* - Define como você aparece nos rankings\n" +
    "• *!nick @pessoa Nome* - Define o apelido de alguém\n" +
    "• *!lembrete* (ou peça à Luma) - Agenda um lembrete com menção\n\n" +
    "📊 *UTILITÁRIOS*\n" +
    "• *!meunumero* - Vê seu ID/Número\n" +
    "• *!resumo* (ex: !resumo 30) - Resume as últimas mensagens da conversa\n" +
    "• *!help* - Mostra essa lista\n" +
    "• *@everyone* ou *@todos* - Marca todos os membros do grupo\n\n" +
    "💡 *DICA:* Use !musica para baixar músicas rapidamente!\n\n" +
    "👮 *AUTOR*\n" +
    "• Feito por Murilo Castelhano\n" +
    "• Repositório: https://github.com/murillous/LumaBot",

  PERSONALITY: {
    HEADER: "🎭 *CONFIGURAÇÃO DA LUMA*\n_Responda com o código (ex: p1):_\n",
    FOOTER: "\n_A mudança é aplicada imediatamente neste chat._",
  },

  MSGS: {
    INVALID_OPT: "❌ Opção inválida. Tente p1, p2, etc.",
    PERSONA_CHANGED: "✅ Personalidade alterada para: ",
  },
});

export const MESSAGES = ConfigStore.apply("MESSAGES", {
  // 🔄 Mensagens existentes (mantidas)
  INITIALIZING: "🤖 WhatsApp Sticker Bot - Conversor Completo",
  STICKER_COMMAND: "🔄 !sticker - Converte imagem/vídeo para sticker",
  IMAGE_COMMAND: "🖼️ !image - Converte sticker para imagem",
  GIF_COMMAND: "🎬 !gif - Converte sticker animado para GIF",
  WAITING_QR: "📱 Aguarde o QR Code...",
  CONNECTING: "🔄 Iniciando conexão com WhatsApp...",
  CONNECTED: "✅ Conectado com sucesso!",
  BOT_READY: "🎯 Bot pronto para uso",
  DISCONNECTED: "❌ Conexão fechada:",
  SEND_MEDIA_STICKER: "ℹ️ Envie uma mídia com !sticker",
  REPLY_MEDIA_STICKER: "ℹ️ Responda a uma imagem/vídeo com !sticker",
  SEND_STICKER_IMAGE: "ℹ️ Envie um sticker com !image",
  REPLY_STICKER_IMAGE: "ℹ️ Responda a um sticker com !image",
  SEND_STICKER_GIF: "ℹ️ Envie um sticker animado com !gif",
  REPLY_STICKER_GIF: "ℹ️ Responda a um sticker animado com !gif",
  STATIC_STICKER: "ℹ️ Este é um sticker estático. Use !image para converter",
  CONVERTED_IMAGE: "🖼️ Convertido!",
  EVERYONE_COMMAND: "📢 @everyone - Marca todos os integrantes do grupo",
  CONVERTED_GIF: "🎬 Convertido!",
  DOWNLOAD_ERROR: "❌ Erro ao baixar",
  CONVERSION_ERROR: "❌ Erro na conversão",
  GENERAL_ERROR: "❌ Erro",
  UNSUPPORTED_FORMAT: "❌ Formato não suportado ou arquivo corrompido.",
  
  // 📹 Vídeo
  VIDEO_DOWNLOADING: "⏳ Baixando vídeo...",
  VIDEO_SENT: "🎬 Pronto!",
  VIDEO_TOO_LARGE: "❌ Vídeo muito grande para enviar (máx. ~50MB).",
  VIDEO_DOWNLOAD_ERROR:
    "❌ Não consegui baixar esse vídeo. O conteúdo pode ser privado ou a URL inválida.",
  VIDEO_NO_URL:
    "ℹ️ Cole o link do vídeo junto com o comando.\nEx: `!download https://x.com/...`",
  
  // 🎵 ÁUDIO/MÚSICA (NOVO - mensagens mais detalhadas)
  AUDIO_DOWNLOADING: "🎵 Baixando áudio... Isso pode levar alguns segundos.",
  AUDIO_SENT: "🎵 Áudio baixado com sucesso!",
  AUDIO_NO_URL:
    "🎵 **Nenhum link encontrado!**\n\n" +
    "**Uso:** `!musica [link]`\n" +
    "**Aliases:** !music, !song, !track, !audio, !a\n\n" +
    "**Exemplos:**\n" +
    "`!musica https://youtube.com/watch?v=abc123`\n" +
    "`!song https://youtu.be/abc123`\n" +
    "`!track https://soundcloud.com/track`\n\n" +
    "💡 Responda a uma mensagem com link ou cole direto.",
  AUDIO_DOWNLOAD_ERROR:
    "❌ **Erro ao baixar áudio**\n\n" +
    "🔄 Tente novamente ou use outro link.\n" +
    "💡 Dica: Use links do YouTube, Vimeo, SoundCloud.\n\n" +
    "**Comandos disponíveis:**\n" +
    "• `!musica` (recomendado em PT-BR)\n" +
    "• `!music` (internacional)\n" +
    "• `!song` (música em inglês)\n" +
    "• `!track` (faixa de áudio)\n" +
    "• `!audio` (compatibilidade)",
  YTDLP_NOT_FOUND:
    "⚠️ **yt-dlp não encontrado**\n\n" +
    "📌 Para instalar, use um dos comandos:\n" +
    "• `npm install -g yt-dlp`\n" +
    "• `pip install yt-dlp`\n" +
    "• `sudo apt install yt-dlp` (Ubuntu/Debian)\n\n" +
    "🔄 Após instalar, reinicie o bot.",
  AUDIO_FILE_TOO_LARGE:
    "📦 **Áudio muito grande!**\n\n" +
    "O arquivo excede o limite de 16MB do WhatsApp.\n" +
    "💡 Tente um vídeo mais curto ou com menor qualidade.",
  AUDIO_DURATION_TOO_LONG:
    "⏱️ **Vídeo muito longo!**\n\n" +
    "Vídeos com mais de 30 minutos não são suportados.\n" +
    "💡 Tente um vídeo mais curto (recomendado: < 10 minutos).",
  AUDIO_NO_RESULTS:
    "🔍 **Nenhum áudio encontrado**\n\n" +
    "O vídeo pode ser muito recente ou estar indisponível.\n" +
    "💡 Tente outro link ou aguarde alguns minutos.",
  
  // 📝 PDF
  REPLY_IMAGE_PDF:
    "ℹ️ Envie uma imagem com !pdf ou responda a uma imagem com !pdf nome do arquivo",
  PDF_MERGE_USAGE:
    "ℹ️ Envie/responda PDFs com !mergepdf para adicionar. Finalize com !mergepdf done nome do arquivo. Use !mergepdf clear para cancelar.",
  PDF_MERGE_NEED_MORE: "ℹ️ Adicione pelo menos 2 PDFs antes de finalizar.",
  PDF_MERGE_ADDED: "📎 PDF adicionado",
  PDF_MERGE_CLEARED: "🗑️ Lista de PDFs limpa.",
  PDF_MERGE_ERROR: "❌ Não consegui juntar esses PDFs.",
  
  // 📊 Utilitários
  MY_NUMBER_INFO:
    "📱 **Seu ID/Número**\n\n" +
    "• **JID:** {jid}\n" +
    "• **Número:** {number}\n" +
    "• **Apelido:** {nick}\n\n" +
    "💡 Use `!nick` para definir um apelido personalizado.",
  RESUMO_USAGE:
    "📝 **Como usar !resumo**\n\n" +
    "• `!resumo` - Resume as últimas 15 mensagens\n" +
    "• `!resumo 30` - Resume as últimas 30 mensagens\n\n" +
    "💡 O resumo será gerado pela IA da Luma.",
});

// 🆕 NOVO: Mapeamento de aliases para facilitar
export const COMMAND_ALIASES = ConfigStore.apply("COMMAND_ALIASES", {
  // Mapeia comandos para suas versões principais
  "!musica": "!audio",
  "!music": "!audio",
  "!song": "!audio",
  "!track": "!audio",
  "!audio": "!audio",
  "!a": "!audio",
  "!baixar": "!audio",
  "!download": "!download",
  "!d": "!download",
});

// 🆕 NOVO: Emojis por comando
export const COMMAND_EMOJIS = ConfigStore.apply("COMMAND_EMOJIS", {
  "!musica": "🎵",
  "!music": "🎵",
  "!song": "🎶",
  "!track": "🎧",
  "!audio": "🎙️",
  "!a": "🎙️",
  "!download": "📥",
  "!d": "📥",
});

// 🆕 NOVO: Descrições para help dinâmico
export const COMMAND_DESCRIPTIONS = ConfigStore.apply("COMMAND_DESCRIPTIONS", {
  "!musica": "Baixa música de qualquer link (recomendado)",
  "!music": "Baixa música (versão em inglês)",
  "!song": "Baixa música (em inglês)",
  "!track": "Baixa faixa de áudio",
  "!audio": "Baixa áudio (compatibilidade)",
  "!a": "Baixa áudio (atalho)",
});
