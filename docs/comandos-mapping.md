# Mapeamento de Comandos — BulmaBot

> Tabela de-para dos comandos migrados do LumaBot para o BulmaBot.

## Comandos

| Antigo (LumaBot) | Novo (BulmaBot) | Descrição |
|---|---|---|
| `!sticker` / `!s` | `!fig` / `!f` | Criar figurinha (sticker) |
| `!image` / `!i` | `!image` / `!i` | Sticker → Imagem _(inalterado)_ |
| `!gif` / `!g` | `!gif` / `!g` | Sticker animado → GIF _(inalterado)_ |
| `!pdf` | `!pdf` | Imagem → PDF _(inalterado)_ |
| `!help` | `!ajuda` | Lista de comandos |
| `!persona` | `!alma` | Mudar personalidade da Bulma |
| `!luma stats` / `!ls` | `!bulma stats` / `!bs` | Estatísticas da Bulma |
| `!luma clear` / `!lc` | `!bulma clear` / `!bc` | Limpar memória da conversa |
| `!clear` | `!esquecer` | Limpar memória (atalho alternativo) |
| `!meunumero` | `!meuid` | Ver próprio ID/número |
| `!resumo` | `!sumario` | Resumir conversa recente |
| `!nick` | `!apelido` | Definir apelido |
| `!apelido` | `!alcunha` | Atalho alternativo para apelido |
| `!rank` | `!classif` | Ranking de interações |
| `!lembrete` | `!alerta` | Agendar lembrete |
| `!lembrar` | `!aviso` | Agendar lembrete (atalho) |
| `!download` / `!d` | `!baixar` / `!bx` | Baixar vídeo |
| `!audio` / `!a` | `!mp3` / `!m` | Baixar áudio MP3 |
| `@everyone` / `@todos` | `@everyone` / `@todos` | Marcar todos _(inalterado)_ |

## Nome do Bot

| Item | Antes | Depois |
|---|---|---|
| Nome | Luma | Bulma |
| Trigger | `luma`, `ei luma`, `oi luma`, `fala luma` | `bulma`, `ei bulma`, `oi bulma`, `fala bulma` |
| Personalidades | Luma Pensadora, Luma Pistola, etc | Bulma Pensadora, Bulma Pistola, etc |
| System prompt | `"Seu nome é Luma."` | `"Seu nome é Bulma."` |
| Sticker pack | LumaBot Stickers | BulmaBot Stickers |

## Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src/config/lumaConfig.js` | Personalidades, TRIGGERS, PROMPT_TEMPLATE |
| `src/config/constants.js` | COMMANDS, MENUS, MESSAGES, STICKER_METADATA |
| `src/handlers/LumaHandler.js` | Regex de extração `luma → bulma` |
| `src/adapters/BaileysAdapter.js` | Nome de exibição `Luma → Bulma` |
| `src/core/services/CommandRouter.js` | Roteamento de comandos atualizado |
| `src/plugins/resumo/ResumoPlugin.js` | Prompt do resumo |
| `.github/workflows/deploy-ec2.yml` | Workflow sem Terraform, busca EC2 por tag |
