/**
 * Cache de IDs de mensagens enviadas pelo bot.
 *
 * Quando o Baileys retorna a própria mensagem com fromMe=false em grupos,
 * usamos esse cache para identificá-la e descartar no MessageRouter.
 *
 * Rastreia pelo message ID (retornado pelo sock.sendMessage) em vez de
 * fingerprint de texto — mais confiável pois não depende de normalização
 * de whitespace/emoji.
 *
 * Módulo separado para evitar importação circular entre
 * BaileysAdapter ↔ MessageRouter.
 */

const sentMessageIds = new Set();
const MAX_IDS = 500;

/**
 * Registra o ID de uma mensagem enviada pelo bot.
 * Chamado pelo BaileysAdapter após sock.sendMessage retornar.
 *
 * @param {string} messageId - O key.id retornado pelo sock.sendMessage
 */
export function trackSentMessage(messageId) {
  if (!messageId) return;
  sentMessageIds.add(messageId);
  if (sentMessageIds.size > MAX_IDS) {
    sentMessageIds.delete(sentMessageIds.values().next().value);
  }
}

/**
 * Retorna true se esta mensagem recebida é um eco de mensagem enviada
 * pelo bot que voltou com fromMe=false.
 *
 * @param {string} messageId - O key.id da mensagem recebida
 */
export function isSentByBot(messageId) {
  if (!messageId) return false;
  const found = sentMessageIds.has(messageId);
  if (found) sentMessageIds.delete(messageId); // consome após detectar
  return found;
}