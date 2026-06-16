import { COMMANDS, MESSAGES} from "../../config/constants.js";
import { VideoDownloader } from "../../services/VideoDownloader.js";
import { DatabaseService } from "../../services/Database.js";
import { extractUrl, isVideoUrl, getMessageText } from "../../utils/MessageUtils.js";
import { Logger } from "../../utils/Logger.js";
import fs from "fs/promises";
import path from "path";

// Emojis locais
const EMOJIS = {
  "!musica": "🎵",
  "!music": "🎵",
  "!song": "🎶",
  "!track": "🎧",
  "!audio": "🎙️",
  "!a": "🎙️",
};

export class AudioDownloadPlugin {
  static commands = [
    COMMANDS.MUSIC,
    COMMANDS.MUSIC_EN,
    COMMANDS.SONG,
    COMMANDS.TRACK,
    COMMANDS.AUDIO_DOWNLOAD,
    COMMANDS.AUDIO_DOWNLOAD_SHORT,
  ];

  async onCommand(command, bot) {
    try {
      const url = this.#extractUrlFromContext(bot);
      
      if (!url) {
        await this.#showHelp(bot, command);
        return;
      }

      if (!this.#isValidUrl(url)) {
        await bot.reply('🔗 URL inválida. Envie um link de vídeo (YouTube, Twitter, Instagram, etc.)');
        return;
      }

      if (!isVideoUrl(url)) {
        await bot.reply('❌ Esta URL não é de uma plataforma de vídeo suportada.\n\n' +
                       '📌 Plataformas suportadas:\n' +
                       '• YouTube, Twitter/X, Instagram\n' +
                       '• SoundCloud, Vimeo, TikTok, Facebook');
        return;
      }

      const canDownload = await this.#checkDailyLimit(bot);
      if (!canDownload) {
        return;
      }

      await this.#downloadAndSendAudio(bot, url, command);
      
    } catch (error) {
      Logger.error('❌ Erro no AudioDownloadPlugin:', error);
      await this.#handleError(bot, error);
    }
  }

  #extractUrlFromContext(bot) {
    const sources = [
      bot.body,
      bot.quotedText,
      getMessageText(bot.message),
      bot.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation,
      bot.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text
    ];

    for (const source of sources) {
      if (source) {
        const url = extractUrl(source);
        if (url) return url;
      }
    }
    return null;
  }

  #isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  async #checkDailyLimit(bot) {
    const userId = bot.sender;
    const today = new Date().toISOString().split('T')[0];
    const key = `audio_downloads:${userId}:${today}`;
    
    const count = DatabaseService.getTempMetric(key) || 0;
    const dailyLimit = 10;
    
    if (count >= dailyLimit) {
      await bot.reply(`⏰ **Limite diário atingido!**\n\n` +
                      `Você já baixou ${count} áudios hoje.\n` +
                      `O limite é de ${dailyLimit} áudios por dia.\n` +
                      `💡 Tente novamente amanhã.`);
      return false;
    }
    
    return true;
  }

  async #downloadAndSendAudio(bot, url, command) {
    let filePath = null;

    try {
      // ✅ CORRIGIDO: usa EMOJIS local
      const emoji = EMOJIS[command] || '🎵';
      await bot.react("⏳");
      await bot.reply(`${emoji} Baixando áudio... Isso pode levar alguns segundos.`);

      Logger.info(`🎵 Iniciando download de áudio: ${url}`);

      const videoInfo = await VideoDownloader.getVideoInfo(url);
      
      if (videoInfo && videoInfo.duration > 0) {
        const minutes = Math.floor(videoInfo.duration / 60);
        const seconds = Math.floor(videoInfo.duration % 60);
        
        if (minutes > 30) {
          await bot.reply(`⏱️ **Vídeo muito longo!**\n\n` +
                         `Duração: ${minutes}m${seconds}s\n` +
                         `💡 Vídeos com mais de 30 minutos não são suportados.`);
          return;
        }
        
        let infoMsg = `📥 **Baixando:** ${videoInfo.title || 'Vídeo'}\n`;
        infoMsg += `⏱️ **Duração:** ${minutes}m${seconds}s\n`;
        if (videoInfo.uploader) {
          infoMsg += `👤 **Autor:** ${videoInfo.uploader}\n`;
        }
        await bot.reply(infoMsg);
      }

      const result = await VideoDownloader.downloadAudio(url, {
        format: 'mp3',
        quality: '0',
        timeout: 60000
      });

      filePath = result.filePath;
      const { title, duration, sizeMB } = result;

      const fileName = this.#sanitizeFileName(title || 'audio');
      const audioBuffer = await fs.readFile(filePath);
      
      // ✅ CORRIGIDO: usa EMOJIS local
      const caption = this.#buildCaption(title, duration, sizeMB, command);

      await bot.sendMessage(bot.jid, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: fileName,
        caption: caption,
        ptt: false
      });

      await this.#updateMetrics(bot, result);
      
      Logger.info(`✅ Áudio enviado com sucesso: ${fileName}`);
      await bot.react("✅");

    } catch (error) {
      Logger.error('❌ Erro no download de áudio:', error);
      throw error;
      
    } finally {
      await this.#cleanupFiles(filePath);
    }
  }

  #sanitizeFileName(title) {
    if (!title) return 'audio.mp3';
    
    const sanitized = title
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
      
    return `${sanitized}.mp3`;
  }

  // ✅ CORRIGIDO: usa EMOJIS local
  #buildCaption(title, duration, sizeMB, command) {
    const emoji = EMOJIS[command] || '🎵';
    let caption = `${emoji} **Áudio baixado com sucesso!**\n\n`;
    
    if (title) {
      caption += `📝 **${title}**\n`;
    }
    
    if (duration && duration > 0) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      caption += `⏱️ ${minutes}m${seconds.toString().padStart(2, '0')}s\n`;
    }
    
    if (sizeMB && sizeMB > 0) {
      caption += `📦 ${sizeMB.toFixed(1)}MB\n`;
    }
    
    caption += `\n💡 **Aliases:** !musica, !music, !song, !track, !audio, !a`;
    
    return caption;
  }

  async #updateMetrics(bot, result) {
    try {
      const userId = bot.sender;
      
      DatabaseService.incrementMetric("audios_downloaded");
      DatabaseService.incrementMetric("total_messages");
      DatabaseService.incrementAudioDownload(userId);
      
      if (result.duration) {
        DatabaseService.updateMetric("total_audio_duration", result.duration);
      }
      if (result.size) {
        DatabaseService.updateMetric("total_audio_size", result.size);
      }
      
      const today = new Date().toISOString().split('T')[0];
      const key = `audio_downloads:${userId}:${today}`;
      const current = DatabaseService.getTempMetric(key) || 0;
      DatabaseService.setTempMetric(key, current + 1);
      
      Logger.debug(`📊 Métricas atualizadas para ${userId}`);
      
    } catch (error) {
      Logger.warn('⚠️ Erro ao atualizar métricas:', error);
    }
  }

  // ✅ CORRIGIDO: usa EMOJIS local
  async #showHelp(bot, command) {
    const emoji = EMOJIS[command] || '🎵';
    
    const helpMessage = `${emoji} **Como baixar áudio/música:**\n\n` +
                       `📌 **Uso:** \`${command} [link]\`\n\n` +
                       `**Aliases disponíveis:**\n` +
                       `• \`!musica\` - Português (recomendado)\n` +
                       `• \`!music\` - Inglês\n` +
                       `• \`!song\` - Música\n` +
                       `• \`!track\` - Faixa/trilha\n` +
                       `• \`!audio\` - Compatibilidade\n` +
                       `• \`!a\` - Atalho\n\n` +
                       `**Exemplos:**\n` +
                       `\`!musica https://youtube.com/watch?v=abc123\`\n` +
                       `\`!song https://youtu.be/abc123\`\n` +
                       `\`!track https://soundcloud.com/track\`\n\n` +
                       `💡 **Dica:** Responda a uma mensagem com link ou cole direto.\n` +
                       `📊 Limite: 10 áudios por dia.`;
    
    await bot.reply(helpMessage);
  }

  async #handleError(bot, error) {
    const errorMessages = {
      'yt-dlp': '⚠️ **yt-dlp não encontrado**\n\n' +
                '📌 Instale com um dos comandos:\n' +
                '• `npm install -g yt-dlp`\n' +
                '• `pip install yt-dlp`\n' +
                '• `sudo apt install yt-dlp` (Ubuntu/Debian)',
      
      'File too large': '📦 **Áudio muito grande!**\n\n' +
                        'O arquivo excede o limite de 16MB do WhatsApp.\n' +
                        '💡 Tente um vídeo mais curto.',
      
      'Network': '🌐 **Erro de rede**\n\n' +
                 'Verifique sua conexão com a internet.\n' +
                 '🔄 Tente novamente em alguns instantes.',
      
      'Unsupported': '📹 **Formato não suportado**\n\n' +
                     'O vídeo pode estar em um formato que não conseguimos processar.\n' +
                     '💡 Tente outro link ou plataforma.',
      
      'duration': '⏱️ **Vídeo muito longo!**\n\n' +
                  'Vídeos com mais de 30 minutos não são suportados.\n' +
                  '💡 Tente um vídeo mais curto (< 10 minutos recomendado).',
      
      '404': '❌ **Vídeo não encontrado**\n\n' +
             'O link pode estar quebrado ou o vídeo foi removido.\n' +
             '💡 Verifique se o link está correto.',
      
      'private': '🔒 **Vídeo privado**\n\n' +
                 'O vídeo está marcado como privado ou não está disponível.\n' +
                 '💡 Tente um vídeo público.',
      
      'timeout': '⏰ **Tempo limite excedido**\n\n' +
                 'O download demorou muito tempo.\n' +
                 '🔄 Tente novamente ou use outro link.'
    };

    let userMessage = '❌ **Erro ao baixar áudio**\n\n' +
                      'Algo deu errado. Tente novamente.\n\n' +
                      '💡 Dicas:\n' +
                      '• Verifique se o link está correto\n' +
                      '• Tente usar !musica + link do YouTube\n' +
                      '• Se o problema persistir, tente outro link';

    for (const [key, msg] of Object.entries(errorMessages)) {
      if (error.message?.toLowerCase().includes(key.toLowerCase())) {
        userMessage = msg;
        break;
      }
    }

    await bot.reply(userMessage);
    await bot.react("❌");
  }

  async #cleanupFiles(filePath) {
    try {
      if (filePath) {
        await fs.unlink(filePath).catch(() => {});
        Logger.debug(`🧹 Arquivo removido: ${path.basename(filePath)}`);
      }
    } catch (error) {
      Logger.warn('⚠️ Erro ao limpar arquivo:', error);
    }
  }
}
