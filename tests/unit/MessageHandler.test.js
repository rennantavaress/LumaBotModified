import { describe, it, expect, vi } from 'vitest';

/**
 * Testes de caracterização do MessageHandler.
 *
 * As funções puras detectCommand, extractUrl e getMessageType foram
 * movidas respectivamente para:
 *   - CommandRouter.detect  → tests/unit/core/services/CommandRouter.test.js
 *   - MessageUtils.extractUrl    → tests/unit/utils/MessageUtils.test.js
 *   - MessageUtils.getMessageType → tests/unit/utils/MessageUtils.test.js
 *
 * Este arquivo mantém os testes usando os novos locais para evitar regressão.
 */

vi.mock('../../src/adapters/ai/GeminiAdapter.js', () => ({
  GeminiAdapter: vi.fn().mockImplementation(() => ({
    generateContent: vi.fn(),
    getStats: vi.fn().mockReturnValue([]),
  })),
}));

vi.mock('../../src/services/Database.js', () => ({
  DatabaseService: {
    incrementMetric: vi.fn(),
    getMetrics: vi.fn().mockReturnValue({}),
  },
}));

vi.mock('../../src/managers/PersonalityManager.js', () => ({
  PersonalityManager: {
    getPersonaConfig: vi.fn().mockReturnValue({ context: '', style: '', traits: [] }),
    getActiveName: vi.fn().mockReturnValue('Luma Pensadora'),
    getList: vi.fn().mockReturnValue([]),
    setPersonality: vi.fn().mockReturnValue(true),
  },
}));

vi.mock('../../src/handlers/MediaProcessor.js', () => ({
  MediaProcessor: { downloadMedia: vi.fn() },
}));

vi.mock('../../src/services/VideoDownloader.js', () => ({
  VideoDownloader: { download: vi.fn() },
}));

vi.mock('../../src/processors/VideoConverter.js', () => ({
  VideoConverter: { remuxForMobile: vi.fn() },
}));

vi.mock('../../src/handlers/SpontaneousHandler.js', () => ({
  SpontaneousHandler: { handle: vi.fn(), trackActivity: vi.fn() },
}));

import { COMMANDS } from '../../src/config/constants.js';
import { CommandRouter } from '../../src/core/services/CommandRouter.js';
import { getMessageType, extractUrl } from '../../src/utils/MessageUtils.js';

describe('CommandRouter.detect — detecção de comandos (via MessageHandler.test)', () => {
  it('detecta !fig', () => {
    expect(CommandRouter.detect('!fig')).toBe(COMMANDS.STICKER);
  });

  it('detecta !f (alias do fig)', () => {
    expect(CommandRouter.detect('!f')).toBe(COMMANDS.STICKER);
  });

  it('detecta !image', () => {
    expect(CommandRouter.detect('!image')).toBe(COMMANDS.IMAGE);
  });

  it('detecta !i (alias do image)', () => {
    expect(CommandRouter.detect('!i')).toBe(COMMANDS.IMAGE);
  });

  it('detecta !gif', () => {
    expect(CommandRouter.detect('!gif')).toBe(COMMANDS.GIF);
  });

  it('detecta !g (alias do gif)', () => {
    expect(CommandRouter.detect('!g')).toBe(COMMANDS.GIF);
  });

  it('detecta !ajuda', () => {
    expect(CommandRouter.detect('!ajuda')).toBe(COMMANDS.HELP);
  });

  it('detecta !menu como alias do ajuda', () => {
    expect(CommandRouter.detect('!menu')).toBe(COMMANDS.HELP);
  });

  it('detecta !alma', () => {
    expect(CommandRouter.detect('!alma')).toBe(COMMANDS.PERSONA);
  });

  it('detecta !baixar com URL', () => {
    expect(CommandRouter.detect('!baixar https://x.com/algo')).toBe(COMMANDS.DOWNLOAD);
  });

  it('detecta !bx (alias do baixar)', () => {
    expect(CommandRouter.detect('!bx https://x.com/algo')).toBe(COMMANDS.DOWNLOAD);
  });

  it('detecta @everyone', () => {
    expect(CommandRouter.detect('@everyone')).toBe(COMMANDS.EVERYONE);
  });

  it('detecta @todos (alias do everyone)', () => {
    expect(CommandRouter.detect('@todos')).toBe(COMMANDS.EVERYONE);
  });

  it('detecta !bulma stats', () => {
    expect(CommandRouter.detect('!bulma stats')).toBe(COMMANDS.LUMA_STATS);
  });

  it('detecta !bs (alias do bulma stats)', () => {
    expect(CommandRouter.detect('!bs')).toBe(COMMANDS.LUMA_STATS);
  });

  it('detecta !bulma clear', () => {
    expect(CommandRouter.detect('!bulma clear')).toBe(COMMANDS.LUMA_CLEAR);
  });

  it('detecta !bc (alias do bulma clear)', () => {
    expect(CommandRouter.detect('!bc')).toBe(COMMANDS.LUMA_CLEAR);
  });

  it('detecta !esquecer (alias alternativo do bulma clear)', () => {
    expect(CommandRouter.detect('!esquecer')).toBe(COMMANDS.LUMA_CLEAR_ALT);
  });

  it('detecta !meuid', () => {
    expect(CommandRouter.detect('!meuid')).toBe(COMMANDS.MY_NUMBER);
  });

  it('é case insensitive — !FIG detecta como fig', () => {
    expect(CommandRouter.detect('!FIG')).toBe(COMMANDS.STICKER);
  });

  it('retorna null para texto sem comando', () => {
    expect(CommandRouter.detect('oi tudo bem?')).toBeNull();
  });

  it('retorna null para string vazia', () => {
    expect(CommandRouter.detect('')).toBeNull();
  });

  it('retorna null para mensagem da Bulma sem prefixo de comando', () => {
    expect(CommandRouter.detect('bulma me explica isso')).toBeNull();
  });
});

describe('extractUrl — extração de URLs', () => {
  it('extrai URL https de texto simples', () => {
    expect(extractUrl('!baixar https://x.com/user/status/123')).toBe('https://x.com/user/status/123');
  });

  it('extrai URL http também', () => {
    expect(extractUrl('veja em http://exemplo.com/pagina')).toBe('http://exemplo.com/pagina');
  });

  it('extrai a primeira URL quando há múltiplas', () => {
    expect(extractUrl('veja https://primeiro.com e https://segundo.com')).toBe('https://primeiro.com');
  });

  it('retorna null para texto sem URL', () => {
    expect(extractUrl('texto sem link nenhum')).toBeNull();
  });

  it('retorna null para null', () => {
    expect(extractUrl(null)).toBeNull();
  });

  it('retorna null para string vazia', () => {
    expect(extractUrl('')).toBeNull();
  });

  it('extrai URL do Instagram corretamente', () => {
    expect(extractUrl('!bx https://instagram.com/reel/abc123/')).toBe('https://instagram.com/reel/abc123/');
  });
});

describe('getMessageType — detecção de tipo de mídia', () => {
  it('retorna "image" para imageMessage sem gif', () => {
    const msg = { message: { imageMessage: { mimetype: 'image/jpeg' } } };
    expect(getMessageType(msg)).toBe('image');
  });

  it('retorna "gif" para imageMessage com mimetype gif', () => {
    const msg = { message: { imageMessage: { mimetype: 'image/gif' } } };
    expect(getMessageType(msg)).toBe('gif');
  });

  it('retorna "video" para videoMessage sem gifPlayback', () => {
    const msg = { message: { videoMessage: { gifPlayback: false } } };
    expect(getMessageType(msg)).toBe('video');
  });

  it('retorna "gif" para videoMessage com gifPlayback true', () => {
    const msg = { message: { videoMessage: { gifPlayback: true } } };
    expect(getMessageType(msg)).toBe('gif');
  });

  it('retorna "image" como fallback para tipos desconhecidos', () => {
    const msg = { message: { stickerMessage: {} } };
    expect(getMessageType(msg)).toBe('image');
  });
});
