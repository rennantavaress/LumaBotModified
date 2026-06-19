import { DisconnectReason } from '@whiskeysockets/baileys';

/**
 * Encapsula a lógica de decisão sobre o que fazer após uma desconexão.
 * Toma decisões — não executa ações. O ConnectionManager executa.
 */
export class ReconnectionPolicy {
  /**
   * @param {object} config - CONFIG de constants.js
   */
  constructor(config) {
    this._config           = config;
    this.reconnectAttempts = 0;
    this.qrRetries         = 0;
    this.maxQrRetries      = 3; // 🔧 REDUZIDO: 3 tentativas de QR (antes era 5)
    this.lastCleanTime     = 0;
    this.connectionTimeout = null; // 🆕 Para gerenciar timeouts
  }

  /**
   * Dado um statusCode e errorMessage, retorna a ação a tomar.
   *
   * @param {number|undefined} statusCode
   * @param {string} errorMessage
   * @returns {'reconnect'|'clean_and_restart'|'qr_max_reached'|'regenerate_qr'|'retry_connection'|'stop'}
   */
  decide(statusCode, errorMessage) {
    // ⚠️ NÃO regenerar QR - causa loop infinito
    if (statusCode === 408 || statusCode === 440 || errorMessage.includes('timed out')) {
      // Se já tentou regenerar muitas vezes, para tudo
      if (this.qrRetries >= this.maxQrRetries) {
        console.log('🔴 Máximo de tentativas de QR atingido. Reinicie manualmente.');
        return 'stop'; // 🆕 NOVA AÇÃO: para o bot
      }
      this.qrRetries++;
      console.log(`📱 Gerando novo QR Code... (${this.qrRetries}/${this.maxQrRetries})`);
      return 'regenerate_qr';
    }

    // Erros de autenticação - limpar sessão
    if (this.isAuthenticationError(statusCode) || statusCode === DisconnectReason.loggedOut) {
      return 'clean_and_restart';
    }

    // Erros de servidor
    if (statusCode === 503 || statusCode === 500 || errorMessage.includes('Connection Failure')) {
      return 'retry_connection';
    }

    // Qualquer outro erro - reconectar com backoff
    return 'reconnect';
  }

  /**
   * Calcula o delay de backoff e incrementa o contador de reconexões.
   * @returns {{ delayMs: number, hasReachedLimit: boolean }}
   */
  nextReconnectDelay() {
    if (this.reconnectAttempts >= this._config.MAX_RECONNECT_ATTEMPTS) {
      console.log(`🔴 Máximo de reconexões (${this.reconnectAttempts}) atingido.`);
      return { delayMs: 0, hasReachedLimit: true };
    }

    this.reconnectAttempts++;
    // 🔧 MELHORADO: backoff exponencial (1.5x)
    const delayMs = Math.min(
      this._config.RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts - 1),
      30000, // 🔧 AUMENTADO: máximo 30 segundos (antes era 15s)
    );
    console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa (${this.reconnectAttempts}/${this._config.MAX_RECONNECT_ATTEMPTS})`);
    return { delayMs, hasReachedLimit: false };
  }

  /** Reseta contadores após conexão bem-sucedida. */
  resetAttempts() {
    console.log('🔄 Resetando contadores de reconexão');
    this.reconnectAttempts = 0;
    this.qrRetries         = 0;
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  /** Registra o momento da última limpeza de sessão. */
  markCleanTime() {
    this.lastCleanTime = Date.now();
    console.log(`🧹 Sessão limpa em ${new Date(this.lastCleanTime).toISOString()}`);
  }

  /** @param {number|undefined} statusCode */
  isAuthenticationError(statusCode) {
    return [405, 401, 403, 400].includes(statusCode); // 🔧 ADICIONADO: 400
  }

  /** Verifica erro de autenticação via string de mensagem. */
  isAuthError(message) {
    return ['405', 'auth', '401', 'Connection Failure', 'API key not valid'].some(err => message.includes(err));
  }

  /**
   * 🆕 Verifica se deve parar completamente
   */
  shouldStop() {
    return this.qrRetries >= this.maxQrRetries || 
           this.reconnectAttempts >= this._config.MAX_RECONNECT_ATTEMPTS;
  }
}
