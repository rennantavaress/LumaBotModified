import { COMMANDS } from "../../config/constants.js";

/**
 * Detecta qual comando está presente em uma string de texto.
 *
 * Responsabilidade única: parsing de texto → constante COMMANDS.
 * O despacho para handlers é feito pelo PluginManager.
 *
 * @param {string|null} text
 * @returns {string|null} Uma das constantes COMMANDS ou null
 */
export class CommandRouter {
  /**
   * @param {string|null} text
   * @param {{ hasStickerSource?: boolean }} context
   */
  static detect(text, context = {}) {
    if (!text) return null;
    const lower = text.toLowerCase();

    if (lower === COMMANDS.MY_NUMBER)              return COMMANDS.MY_NUMBER;
    if (lower === COMMANDS.LUMA_CLEAR_SHORT)       return COMMANDS.LUMA_CLEAR;
    if (lower.includes(COMMANDS.LUMA_CLEAR))       return COMMANDS.LUMA_CLEAR;
    if (lower.includes(COMMANDS.LUMA_CLEAR_ALT))   return COMMANDS.LUMA_CLEAR_ALT;
    if (lower.includes(COMMANDS.LUMA_STATS))       return COMMANDS.LUMA_STATS;
    if (lower.includes(COMMANDS.LUMA_STATS_SHORT)) return COMMANDS.LUMA_STATS;
    if (lower.includes(COMMANDS.STICKER))          return COMMANDS.STICKER;
    if (lower.includes(COMMANDS.STICKER_SHORT))    return COMMANDS.STICKER;
    if (lower.includes(COMMANDS.IMAGE))            return COMMANDS.IMAGE;
    if (lower.includes(COMMANDS.IMAGE_SHORT))      return COMMANDS.IMAGE;
    if (lower.startsWith(COMMANDS.PDF))            return COMMANDS.PDF;
    if (lower.startsWith(COMMANDS.PDF_MERGE))      return COMMANDS.PDF_MERGE;
    if (lower.startsWith(COMMANDS.PDF_MERGE_ALT))  return COMMANDS.PDF_MERGE;
    if (lower.includes(COMMANDS.GIF))              return COMMANDS.GIF;
    if (lower.includes(COMMANDS.GIF_SHORT))        return COMMANDS.GIF;
    if (lower.includes(COMMANDS.EVERYONE.toLowerCase()) || lower === "@todos") return COMMANDS.EVERYONE;
    if (lower.includes(COMMANDS.HELP) || lower === "!menu") return COMMANDS.HELP;
    if (lower.startsWith(COMMANDS.PERSONA))        return COMMANDS.PERSONA;
    if (lower.startsWith(COMMANDS.AUDIO_DOWNLOAD))       return COMMANDS.AUDIO_DOWNLOAD;
    if (lower === COMMANDS.AUDIO_DOWNLOAD_SHORT || lower.startsWith(COMMANDS.AUDIO_DOWNLOAD_SHORT + " ")) return COMMANDS.AUDIO_DOWNLOAD;
    if (lower.startsWith(COMMANDS.DOWNLOAD))        return COMMANDS.DOWNLOAD;
    if (lower === COMMANDS.DOWNLOAD_SHORT || lower.startsWith(COMMANDS.DOWNLOAD_SHORT + " "))  return COMMANDS.DOWNLOAD;
    if (lower.startsWith(COMMANDS.RESUMO))         return COMMANDS.RESUMO;
    if (lower.startsWith(COMMANDS.NICK_ALT))       return COMMANDS.NICK_ALT;
    if (lower.startsWith(COMMANDS.NICK))           return COMMANDS.NICK;
    if (lower.startsWith(COMMANDS.RANK))           return COMMANDS.RANK;
    if (lower.startsWith(COMMANDS.REMINDER_SHORT)) return COMMANDS.REMINDER;
    if (lower.startsWith(COMMANDS.REMINDER))       return COMMANDS.REMINDER;

    if (context.hasStickerSource && this.isContextualStickerRequest(text)) {
      return COMMANDS.STICKER;
    }

    return null;
  }

  /**
   * Detecta pedidos naturais e inequívocos de criação de figurinha.
   * A execução só é habilitada por detect() quando existe mídia visual ou URL
   * no contexto, evitando interpretar perguntas sobre figurinhas como comandos.
   */
  static isContextualStickerRequest(text) {
    if (!text) return false;

    const normalized = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[!?.,:;]+/g, " ")
      .replace(/\s+/g, " ");

    const hasStickerTarget = /\b(figurinha|sticker)\b/.test(normalized);
    if (!hasStickerTarget) return false;

    if (
      /^como\b/.test(normalized) ||
      /\b(tutorial|explica|explique|ensina|ensine)\b/.test(normalized) ||
      /\b(saber|aprender)\s+como\b/.test(normalized)
    ) {
      return false;
    }

    const conciseRequest =
      /^(?:uma?\s+)?(?:figurinha|sticker)(?:\s+(?:disso|dessa|desse|disto|por favor|pfv|pra mim))*$/;
    if (conciseRequest.test(normalized)) return true;

    const requestStart =
      /^(?:(?:ei|oi|fala)\s+)?(?:luma\s+)?(?:me\s+)?(?:faz|faca|fazer|cria|crie|criar|gera|gere|gerar|transforma|transforme|transformar|converte|converta|converter|vira|vire|virar|manda|mande|mandar|quero|pode|poderia|consegue|conseguiria|tem como)\b/;

    return requestStart.test(normalized);
  }
}
