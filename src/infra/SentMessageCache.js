/**
 * Cache de fingerprints de mensagens enviadas pelo bot.
 *
 * Quando o Baileys retorna a própria mensagem com fromMe=false em grupos,
 * usamos esse cache para identificá-la e descartar no MessageRouter.
 *
 * Módulo separado para evitar importação circular entre
 * BaileysAdapter ↔ MessageRouter.
 */

const sentFingerprints = new Set();
const MAX_FINGERPRINTS = 200;

/**
 * Gera o fingerprint de uma mensagem: "jid::primeiros100chars".
 */
function fingerprint(jid, text) {
  return `${jid}::${text.trim().substring(0, 100)}`;
}

/**
 * Registra uma mensagem que o bot acabou de enviar.
 * Chamado pelo BaileysAdapter antes de despachar via sock.sendMessage.
 */
export function trackSentMessage(jid, text) {
  if (!jid || !text) return;
  const fp = fingerprint(jid, text);
  sentFingerprints.add(fp);
  if (sentFingerprints.size > MAX_FINGERPRINTS) {
    sentFingerprints.delete(sentFingerprints.values().next().value);
  }
}

/**
 * Retorna true se esta mensagem recebida é um eco da própria mensagem
 * do bot que voltou com fromMe=false.
 */
export function isSentByBot(jid, text) {
  if (!jid || !text) return false;
  return sentFingerprints.has(fingerprint(jid, text));
}