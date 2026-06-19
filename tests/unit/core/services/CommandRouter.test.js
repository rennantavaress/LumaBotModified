import { describe, it, expect } from 'vitest';
import { CommandRouter } from '../../../../src/core/services/CommandRouter.js';

/**
 * Testes de CommandRouter.detect — parsing de texto → constante COMMANDS.
 * O dispatch é responsabilidade do PluginManager (testado em PluginManager.test.js).
 */
describe('CommandRouter.detect — comandos', () => {
  it.each([
    ['!sticker',      '!sticker'],
    ['!s',            '!sticker'],
    ['!image',        '!image'],
    ['!i',            '!image'],
    ['!pdf',          '!pdf'],
    ['!mergepdf',     '!mergepdf'],
    ['!joinpdf',      '!mergepdf'],
    ['!gif',          '!gif'],
    ['!g',            '!gif'],
    ['!help',         '!help'],
    ['!menu',         '!help'],
    ['!persona',      '!persona'],
    ['!download url', '!download'],
    ['!d url',        '!download'],
    ['!luma clear',   '!luma clear'],
    ['!lc',           '!luma clear'],
    ['!clear',        '!clear'],
    ['!luma stats',   '!luma stats'],
    ['!ls',           '!luma stats'],
    ['!meunumero',    '!meunumero'],
    ['@everyone',     '@everyone'],
    ['@todos',        '@everyone'],
  ])('detecta "%s" como "%s"', (input, expected) => {
    expect(CommandRouter.detect(input)).toBe(expected);
  });

  it('retorna null para texto sem comando', () => {
    expect(CommandRouter.detect('oi luma tudo bem?')).toBeNull();
  });

  it('retorna null para null', () => {
    expect(CommandRouter.detect(null)).toBeNull();
  });

  it('retorna null para string vazia', () => {
    expect(CommandRouter.detect('')).toBeNull();
  });

  it('é case-insensitive', () => {
    expect(CommandRouter.detect('!STICKER')).toBe('!sticker');
    expect(CommandRouter.detect('!Help')).toBe('!help');
  });

  it.each([
    'faz uma figurinha disso',
    'Luma transforma isso em sticker',
    'poderia criar uma figurinha pra mim?',
    'me faz uma figurinha',
    'consegue criar um sticker?',
    'tem como fazer figurinha disso?',
    'figurinha',
  ])('detecta pedido contextual de sticker: "%s"', (input) => {
    expect(CommandRouter.detect(input, { hasStickerSource: true })).toBe('!sticker');
  });

  it('nao detecta pedido contextual sem uma fonte para o sticker', () => {
    expect(CommandRouter.detect('faz uma figurinha disso')).toBeNull();
  });

  it.each([
    'como fazer uma figurinha?',
    'essa figurinha ficou boa',
    'me explica como criar sticker',
  ])('nao confunde conversa sobre sticker com comando: "%s"', (input) => {
    expect(CommandRouter.detect(input, { hasStickerSource: true })).toBeNull();
  });

  it.each([
    'luma faça um resumo da conversa',
    'faça um resumo da conversa',
    'resume o que rolou',
    'me manda um resumo das ultimas 30 mensagens',
    'resumo',
  ])('detecta pedido contextual de resumo: "%s"', (input) => {
    expect(CommandRouter.detect(input)).toBe('!resumo');
  });

  it.each([
    'o resumo do rank é confuso',
    'esse resumo ficou bom',
    'como fazer um resumo melhor?',
  ])('nao confunde conversa sobre resumo com comando: "%s"', (input) => {
    expect(CommandRouter.detect(input)).toBeNull();
  });
});
