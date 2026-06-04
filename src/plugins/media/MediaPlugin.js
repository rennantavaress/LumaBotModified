import { COMMANDS, MESSAGES } from "../../config/constants.js";
import { MediaProcessor } from "../../handlers/MediaProcessor.js";
import { DatabaseService } from "../../services/Database.js";
import { extractUrl } from "../../utils/MessageUtils.js";

const DEFAULT_PDF_FILENAME = "imagem.pdf";

function getPdfFileName(body) {
  const rawName = body
    ?.replace(new RegExp(`^\\s*${COMMANDS.PDF}\\s*`, "i"), "")
    .trim();

  if (!rawName) return DEFAULT_PDF_FILENAME;

  const slug = rawName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug ? `${slug}.pdf` : DEFAULT_PDF_FILENAME;
}

/**
 * Plugin de mídia: converte imagens/vídeos em stickers, stickers em imagens/GIFs.
 * Comandos: !sticker (!s), !image (!i), !gif (!g)
 */
export class MediaPlugin {
  static commands = [
    COMMANDS.STICKER,
    COMMANDS.STICKER_SHORT,
    COMMANDS.IMAGE,
    COMMANDS.IMAGE_SHORT,
    COMMANDS.PDF,
    COMMANDS.GIF,
    COMMANDS.GIF_SHORT,
  ];

  async onCommand(command, bot) {
    switch (command) {
      case COMMANDS.STICKER:
      case COMMANDS.STICKER_SHORT:
        return this.#handleSticker(bot);
      case COMMANDS.IMAGE:
      case COMMANDS.IMAGE_SHORT:
        return this.#handleImage(bot);
      case COMMANDS.PDF:
        return this.#handlePdf(bot);
      case COMMANDS.GIF:
      case COMMANDS.GIF_SHORT:
        return this.#handleGif(bot);
    }
  }

  async #handleSticker(bot) {
    await bot.react("⏳");
    const url = extractUrl(bot.body);
    if (url) {
      await MediaProcessor.processUrlToSticker(url, bot.socket, bot.raw);
      MediaPlugin.#incrementMedia("stickers_created");
      await bot.react("✅");
      return;
    }
    if (bot.hasMedia) {
      await MediaProcessor.processToSticker(bot.raw, bot.socket);
      MediaPlugin.#incrementMedia("stickers_created");
      await bot.react("✅");
      return;
    }
    const quoted = bot.getQuotedAdapter();
    if (quoted?.hasVisualContent) {
      await MediaProcessor.processToSticker(quoted.raw, bot.socket, bot.jid);
      MediaPlugin.#incrementMedia("stickers_created");
      await bot.react("✅");
    } else {
      await bot.react("❌");
      await bot.reply(MESSAGES.REPLY_MEDIA_STICKER);
    }
  }

  async #handleImage(bot) {
    await bot.react("⏳");
    if (bot.hasSticker) {
      await MediaProcessor.processStickerToImage(bot.raw, bot.socket);
      MediaPlugin.#incrementMedia("images_created");
      await bot.react("✅");
      return;
    }
    const quoted = bot.getQuotedAdapter();
    if (quoted?.hasSticker) {
      await MediaProcessor.processStickerToImage(quoted.raw, bot.socket, bot.jid);
      MediaPlugin.#incrementMedia("images_created");
      await bot.react("✅");
    } else {
      await bot.react("❌");
      await bot.reply(MESSAGES.REPLY_STICKER_IMAGE);
    }
  }

  async #handlePdf(bot) {
    await bot.react("⏳");
    const fileName = getPdfFileName(bot.body);

    if (bot.hasMedia) {
      const ok = await MediaProcessor.processImageToPdf(bot.raw, bot.socket, null, fileName);
      if (ok) MediaPlugin.#incrementMedia("pdfs_created");
      await bot.react(ok ? "✅" : "❌");
      return;
    }
    const quoted = bot.getQuotedAdapter();
    if (quoted?.hasMedia) {
      const ok = await MediaProcessor.processImageToPdf(quoted.raw, bot.socket, bot.jid, fileName);
      if (ok) MediaPlugin.#incrementMedia("pdfs_created");
      await bot.react(ok ? "✅" : "❌");
    } else {
      await bot.react("❌");
      await bot.reply(MESSAGES.REPLY_IMAGE_PDF);
    }
  }

  async #handleGif(bot) {
    await bot.react("⏳");
    if (bot.hasSticker) {
      await MediaProcessor.processStickerToGif(bot.raw, bot.socket);
      MediaPlugin.#incrementMedia("gifs_created");
      await bot.react("✅");
      return;
    }
    const quoted = bot.getQuotedAdapter();
    if (quoted?.hasSticker) {
      await MediaProcessor.processStickerToGif(quoted.raw, bot.socket, bot.jid);
      MediaPlugin.#incrementMedia("gifs_created");
      await bot.react("✅");
    } else {
      await bot.react("❌");
      await bot.reply(MESSAGES.REPLY_STICKER_GIF);
    }
  }

  static #incrementMedia(type) {
    DatabaseService.incrementMetric(type);
    DatabaseService.incrementMetric("total_messages");
  }
}
