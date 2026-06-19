import { COMMANDS } from '../../config/constants.js';
import { Logger } from '../../utils/Logger.js';
import { cleanResponseText } from '../../utils/ResponseFormatter.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const BUFFER_SIZE = 200;

const RESUMO_PROMPT = (conversationText) =>
  `Você é a Luma. Abaixo está um trecho recente da conversa deste chat.\n\n` +
  `Faça um resumo natural e descontraído do que foi discutido, como se estivesse contando pra alguém o que rolou no papo. ` +
  `Seja breve (máximo 5 linhas), use seu jeito de falar e não quebre o personagem.\n\n` +
  `Conversa:\n${conversationText}`;

/**
 * Plugin de resumo da conversa geral do chat.
 *
 * Acumula todas as mensagens via onMessage e gera um resumo sob demanda.
 * Comandos: !resumo, !resumo <N> (N = número de mensagens, máx 200)
 */
export class ResumoPlugin {
  static commands = [COMMANDS.RESUMO];

  /** @type {Map<string, Array<{name: string, text: string}>>} */
  #buffers = new Map();

  /**
   * @param {object} deps
   * @param {import('../../handlers/LumaHandler.js').LumaHandler} deps.lumaHandler
   * @param {number} [deps.bufferSize]
   */
  constructor({ lumaHandler, bufferSize = BUFFER_SIZE } = {}) {
    this._lumaHandler = lumaHandler;
    this._bufferSize  = bufferSize;
  }

  async onMessage(bot) {
    if (!bot.body) return;
    const buf = this.#buffers.get(bot.jid) ?? [];
    buf.push({ name: bot.senderName ?? 'Alguém', text: bot.body });
    if (buf.length > this._bufferSize) buf.shift();
    this.#buffers.set(bot.jid, buf);
  }

  async onCommand(_command, bot) {
    await this.showSummary(bot);
  }

  async showSummary(bot, { limit = null } = {}) {
    if (!this._lumaHandler?.isConfigured) {
      await bot.reply('❌ IA não configurada para gerar resumo.');
      return;
    }

    const parsedLimit = this._normalizeLimit(limit) ?? this._parseLimit(bot.body);
    const buf   = this.#buffers.get(bot.jid) ?? [];
    const slice = buf.slice(-parsedLimit);

    if (!slice.length) {
      await bot.reply('📭 Não tem conversa recente salva aqui ainda.');
      return;
    }

    await bot.sendPresence('composing');

    const conversationText = slice.map(m => `${m.name}: ${m.text}`).join('\n');

    try {
      const response = await this._lumaHandler.aiService.generateContent([
        { role: 'user', parts: [{ text: RESUMO_PROMPT(conversationText) }] },
      ]);
      const text = cleanResponseText(response.text);
      if (!text) {
        await bot.reply('❌ Não consegui gerar o resumo agora.');
        return;
      }
      await bot.reply(`📋 *Resumo da conversa:*\n\n${text}`);
    } catch (error) {
      Logger.error('❌ Erro no ResumoPlugin:', error);
      await bot.reply('❌ Não consegui gerar o resumo agora.');
    }
  }

  /** @private */
  _parseLimit(body) {
    const match =
      body?.match(new RegExp(`${COMMANDS.RESUMO}\\s+(\\d+)`, 'i')) ||
      body?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .match(/\b(?:ultimas?|ultimos?|resumo|resume|resuma|resumir)\s+(\d{1,3})\b/);
    if (!match) return DEFAULT_LIMIT;
    return this._normalizeLimit(match[1]) ?? DEFAULT_LIMIT;
  }

  /** @private */
  _normalizeLimit(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed)) return null;
    return Math.min(Math.max(parsed, 1), MAX_LIMIT);
  }
}
