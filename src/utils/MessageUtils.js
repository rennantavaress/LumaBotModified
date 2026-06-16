/**
 * Utilitários puros para análise de mensagens do WhatsApp.
 * Sem dependências de handlers — pode ser importado por qualquer módulo.
 */

/**
 * Determina o tipo de mídia de uma mensagem Baileys.
 * @param {object} message - Objeto de mensagem raw do Baileys
 * @returns {'image'|'gif'|'video'|'audio'|'sticker'|null} Tipo da mídia
 */
export function getMessageType(message) {
  if (!message?.message) return null;
  
  const msg = message.message;
  
  // Imagem (incluindo GIF)
  if (msg.imageMessage) {
    return msg.imageMessage.mimetype?.includes("gif") ? "gif" : "image";
  }
  
  // Vídeo
  if (msg.videoMessage) {
    return msg.videoMessage.gifPlayback ? "gif" : "video";
  }
  
  // Áudio
  if (msg.audioMessage) {
    return "audio";
  }
  
  // Sticker
  if (msg.stickerMessage) {
    return "sticker";
  }
  
  // Documento
  if (msg.documentMessage) {
    return "document";
  }
  
  return null;
}

/**
 * Extrai a primeira URL encontrada num texto.
 * Suporta URLs com parâmetros, fragmentos e caracteres especiais.
 * @param {string|null} text - Texto para extrair URL
 * @returns {string|null} URL encontrada ou null
 */
export function extractUrl(text) {
  if (!text || typeof text !== 'string') return null;
  
  // Padrão melhorado para capturar URLs mais complexas
  const patterns = [
    // URLs comuns (http/https)
    /(https?:\/\/[^\s<>"']+)/gi,
    // URLs sem protocolo (ex: youtube.com/watch?v=123)
    /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s<>"']*)?/gi,
    // URLs com caracteres especiais (ex: youtu.be/abc123?t=10)
    /(?:https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s<>"']*)?/gi
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Limpar a URL encontrada
      let url = match[0];
      
      // Remover pontuação no final (., ,, !, ?, etc)
      url = url.replace(/[.,!?'"):;]+$/, '');
      
      // Garantir que tem protocolo
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      return url;
    }
  }
  
  return null;
}

/**
 * Extrai todas as URLs encontradas num texto.
 * @param {string|null} text - Texto para extrair URLs
 * @returns {string[]} Array com todas as URLs encontradas
 */
export function extractAllUrls(text) {
  if (!text || typeof text !== 'string') return [];
  
  const pattern = /(https?:\/\/[^\s<>"']+)/gi;
  const matches = text.match(pattern) || [];
  
  return matches.map(url => url.replace(/[.,!?'"):;]+$/, ''));
}

/**
 * Verifica se um texto contém uma URL.
 * @param {string|null} text - Texto para verificar
 * @returns {boolean} True se contiver URL
 */
export function hasUrl(text) {
  return extractUrl(text) !== null;
}

/**
 * Extrai o texto de uma mensagem Baileys.
 * @param {object} message - Objeto de mensagem raw do Baileys
 * @returns {string|null} Texto da mensagem ou null
 */
export function getMessageText(message) {
  if (!message?.message) return null;
  
  const msg = message.message;
  
  // Conversa normal
  if (msg.conversation) {
    return msg.conversation;
  }
  
  // Texto estendido
  if (msg.extendedTextMessage?.text) {
    return msg.extendedTextMessage.text;
  }
  
  // Imagem com legenda
  if (msg.imageMessage?.caption) {
    return msg.imageMessage.caption;
  }
  
  // Vídeo com legenda
  if (msg.videoMessage?.caption) {
    return msg.videoMessage.caption;
  }
  
  // Áudio com legenda
  if (msg.audioMessage?.caption) {
    return msg.audioMessage.caption;
  }
  
  // Documento com legenda
  if (msg.documentMessage?.caption) {
    return msg.documentMessage.caption;
  }
  
  // Mensagem citada
  if (msg.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
    return msg.extendedTextMessage.contextInfo.quotedMessage.conversation;
  }
  
  return null;
}

/**
 * Detecta se a mensagem é uma resposta a outra mensagem.
 * @param {object} message - Objeto de mensagem raw do Baileys
 * @returns {boolean} True se for uma resposta
 */
export function isReply(message) {
  return !!message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
}

/**
 * Obtém o JID do remetente da mensagem citada.
 * @param {object} message - Objeto de mensagem raw do Baileys
 * @returns {string|null} JID do remetente citado ou null
 */
export function getQuotedSender(message) {
  return message?.message?.extendedTextMessage?.contextInfo?.participant || null;
}

/**
 * Detecta se a mensagem contém menção a alguém.
 * @param {object} message - Objeto de mensagem raw do Baileys
 * @returns {string[]} Array com JIDs mencionados
 */
export function getMentions(message) {
  const mentions = [];
  
  // Menções no texto estendido
  const extended = message?.message?.extendedTextMessage;
  if (extended?.contextInfo?.mentionedJid) {
    mentions.push(...extended.contextInfo.mentionedJid);
  }
  
  // Menções em mensagem normal
  const text = getMessageText(message);
  if (text) {
    const mentionPattern = /@(\d+)/g;
    let match;
    while ((match = mentionPattern.exec(text)) !== null) {
      mentions.push(match[1] + '@s.whatsapp.net');
    }
  }
  
  return mentions;
}

/**
 * Sanitiza um texto para evitar caracteres problemáticos.
 * @param {string} text - Texto para sanitizar
 * @param {Object} options - Opções de sanitização
 * @returns {string} Texto sanitizado
 */
export function sanitizeText(text, options = {}) {
  if (!text) return '';
  
  const {
    maxLength = 1000,
    removeEmojis = false,
    removeSpecialChars = false,
    trim = true
  } = options;
  
  let sanitized = text;
  
  // Remover emojis
  if (removeEmojis) {
    sanitized = sanitized.replace(/[\u{1F600}-\u{1F9FF}]/gu, '');
  }
  
  // Remover caracteres especiais
  if (removeSpecialChars) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9\sáéíóúãõâêîôûàèìòùç]/g, '');
  }
  
  // Limitar tamanho
  if (maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }
  
  // Trim
  if (trim) {
    sanitized = sanitized.trim();
  }
  
  return sanitized;
}

/**
 * Detecta se o texto parece ser um comando do bot.
 * @param {string} text - Texto para verificar
 * @returns {boolean} True se parecer um comando
 */
export function isCommand(text) {
  if (!text) return false;
  return /^![a-zA-Z]/.test(text.trim());
}

/**
 * Extrai o comando e argumentos de um texto.
 * @param {string} text - Texto do comando
 * @returns {Object} { command, args, raw }
 */
export function parseCommand(text) {
  if (!text) return null;
  
  const trimmed = text.trim();
  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  
  return {
    command: command.toLowerCase(),
    args: args,
    raw: trimmed,
    hasArgs: args.length > 0
  };
}

/**
 * Detecta se uma URL é de uma plataforma de vídeo suportada.
 * @param {string} url - URL para verificar
 * @returns {boolean} True se for suportada
 */
export function isVideoUrl(url) {
  if (!url) return false;
  
  const patterns = [
    /youtube\.com\/watch\?v=/i,
    /youtu\.be\//i,
    /twitter\.com\/.+\/status\//i,
    /x\.com\/.+\/status\//i,
    /instagram\.com\/(p|reel|reels|tv|stories)\//i,
    /soundcloud\.com\//i,
    /vimeo\.com\//i,
    /tiktok\.com\/@.+\/video\//i,
    /facebook\.com\/.+\/videos\//i,
    /fb\.watch\//i
  ];
  
  return patterns.some(pattern => pattern.test(url));
}
