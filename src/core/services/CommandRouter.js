import { COMMANDS } from "../../config/constants.js";

/**
 * Detecta qual comando está presente em uma string de texto.
 *
 * Responsabilidade única:
 * converter uma mensagem em um comando da Luma.
 * O processamento é realizado pelo PluginManager.
 */
export class CommandRouter {

  /**
   * Detecta comandos explícitos e contextuais.
   *
   * @param {string|null} text
   * @param {{ hasStickerSource?: boolean }} context
   * @returns {string|null}
   */
  static detect(text, context = {}) {
    if (!text) return null;

    const lower = text.toLowerCase();

    // ============================
    // COMANDOS EXPLÍCITOS (!)
    // ============================

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

    if (lower.includes(COMMANDS.EVERYONE.toLowerCase()) || lower === "@todos") {
      return COMMANDS.EVERYONE;
    }

    if (lower.includes(COMMANDS.HELP) || lower === "!menu") {
      return COMMANDS.HELP;
    }

    if (lower.startsWith(COMMANDS.PERSONA)) {
      return COMMANDS.PERSONA;
    }

    if (lower.startsWith(COMMANDS.AUDIO_DOWNLOAD)) {
      return COMMANDS.AUDIO_DOWNLOAD;
    }

    if (
      lower === COMMANDS.AUDIO_DOWNLOAD_SHORT ||
      lower.startsWith(COMMANDS.AUDIO_DOWNLOAD_SHORT + " ")
    ) {
      return COMMANDS.AUDIO_DOWNLOAD;
    }

    if (lower.startsWith(COMMANDS.DOWNLOAD)) {
      return COMMANDS.DOWNLOAD;
    }

    if (
      lower === COMMANDS.DOWNLOAD_SHORT ||
      lower.startsWith(COMMANDS.DOWNLOAD_SHORT + " ")
    ) {
      return COMMANDS.DOWNLOAD;
    }

    if (lower.startsWith(COMMANDS.RESUMO)) {
      return COMMANDS.RESUMO;
    }

    if (lower.startsWith(COMMANDS.NICK_ALT)) {
      return COMMANDS.NICK_ALT;
    }

    if (lower.startsWith(COMMANDS.NICK)) {
      return COMMANDS.NICK;
    }

    if (lower.startsWith(COMMANDS.RANK)) {
      return COMMANDS.RANK;
    }

    if (lower.startsWith(COMMANDS.REMINDER_SHORT)) {
      return COMMANDS.REMINDER;
    }

    if (lower.startsWith(COMMANDS.REMINDER)) {
      return COMMANDS.REMINDER;
    }


    // ============================
    // COMANDOS CONTEXTUAIS
    // ============================

    // Apenas se houver imagem/vídeo/link associado
    if (context.hasStickerSource && this.isContextualStickerRequest(text)) {
      return COMMANDS.STICKER;
    }

    // Linguagem natural para limpar memória
    if (this.isContextualSummaryRequest(text)) {
      return COMMANDS.RESUMO;
    }

    if (this.isContextualClearRequest(text)) {
      return COMMANDS.LUMA_CLEAR;
    }

    // Linguagem natural para estatísticas
    if (this.isContextualStatsRequest(text)) {
      return COMMANDS.LUMA_STATS;
    }

    // Linguagem natural para mudança de personalidade
    if (this.isContextualPersonaRequest(text)) {
      return COMMANDS.PERSONA;
    }

    return null;
  }


  /**
   * Detecta pedidos de criação de figurinha.
   */
  static isContextualSummaryRequest(text) {
    if (!text) return false;

    const normalized = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[!?.,:;]+/g, " ")
      .replace(/\s+/g, " ");

    const hasSummaryVerb =
      /\b(resumo|resumir|resume|resuma|sintese|sintetiza|sintetizar)\b/.test(normalized);

    if (!hasSummaryVerb) return false;

    const asksConversationSummary =
      /\b(conversa|chat|grupo|mensagens?|papo)\b/.test(normalized) ||
      /\b(o que rolou|que rolou|ultimas?|ultimos?|recentes?)\b/.test(normalized);

    const conciseSummaryRequest =
      /^(?:luma\s+)?(?:(?:me\s+)?(?:faz|faca|fazer|manda|mande|mandar|mostra|mostre|mostrar|da|dai|quero|pode|poderia)\s+(?:um\s+)?)?(?:resumo|sintese)(?:\s+(?:pra mim|por favor|pfv))?$/.test(normalized);

    return asksConversationSummary || conciseSummaryRequest;
  }


  static isContextualStickerRequest(text) {
    if (!text) return false;

    const normalized = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[!?.,:;]+/g, " ")
      .replace(/\s+/g, " ");

    const hasStickerTarget =
      /\b(figurinha|sticker)\b/.test(normalized);

    if (!hasStickerTarget) return false;


    // Evita perguntas informativas
    if (
      /^como\b/.test(normalized) ||
      /\b(tutorial|explica|explique|ensina|ensine)\b/.test(normalized) ||
      /\b(saber|aprender)\s+como\b/.test(normalized)
    ) {
      return false;
    }


    // "uma figurinha disso"
    const conciseRequest =
      /^(?:uma?\s+)?(?:figurinha|sticker)(?:\s+(?:disso|dessa|desse|disto|por favor|pfv|pra mim))*$/;

    if (conciseRequest.test(normalized)) {
      return true;
    }


    // "Luma, faz uma figurinha disso"
    const requestStart =
      /^(?:(?:ei|oi|fala)\s+)?(?:luma\s+)?(?:me\s+)?(?:faz|faca|fazer|cria|crie|criar|gera|gere|gerar|transforma|transforme|transformar|converte|converta|converter|vira|vire|virar|manda|mande|mandar|quero|pode|poderia|consegue|conseguiria|tem como)\b/;

    return requestStart.test(normalized);
  }


  /**
 * Detecta pedidos para alterar a personalidade da Luma.
 */
static isContextualPersonaRequest(text) {
  if (!text) return false;

  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return /\b(muda|mude|mudar|troca|troque|trocar|altera|altere|alterar)\b.*\b(personalidade|persona|jeito|estilo)\b/
    .test(normalized);
}


  /**
 * Detecta pedidos para limpar a memória da conversa.
 */
static isContextualClearRequest(text) {
  if (!text) return false;

  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return /\b(esqueca|apaga|apague|limpa|limpe|limpar|zera|zere|zerar)\b.*\b(conversa|memoria|historico)\b/
    .test(normalized);
}


  /**
 * Detecta pedidos para mostrar estatísticas da Luma.
 */
static isContextualStatsRequest(text) {
  if (!text) return false;

  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return /\b(mostra|mostre|mostrar|ver|veja|quais sao)\b.*\b(estatisticas|dados|metricas|desempenho)\b/
    .test(normalized);
  }
}
