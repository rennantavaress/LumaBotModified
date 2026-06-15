import { COMMANDS } from "../../config/constants.js";
import { DatabaseService } from "../../services/Database.js";
import { UserResolver } from "../../core/services/UserResolver.js";

/**
 * Plugin de ranking: quem mais interage com a Luma.
 *
 * - !rank        → ranking do grupo atual (ou global em PV)
 * - !rank global → ranking agregado de todos os chats
 * - show_rank    → lista ou posição individual via linguagem natural
 *
 * Os nomes são resolvidos pelo UserResolver na hora da exibição — a chave de
 * persistência é sempre o JID, nunca o nome.
 */
export class RankPlugin {
  static commands = [COMMANDS.RANK];

  static #medal(index) {
    return ["🥇", "🥈", "🥉"][index] || `${index + 1}.`;
  }

  static #normalizeName(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^@/, "")
      .trim()
      .toLowerCase();
  }

  /**
   * Exibe o ranking completo ou a posição de uma pessoa específica.
   * targetName só aceita correspondência exata e não ambígua para evitar
   * mostrar a posição da pessoa errada em pedidos por linguagem natural.
   */
  static async showRanking(bot, { scope = "group", targetJid = null, targetName = null } = {}) {
    const isGlobal = scope === "global" || !bot.isGroup;
    const hasTarget = !!(targetJid || targetName);

    const rows = isGlobal
      ? DatabaseService.getGlobalRanking(hasTarget ? -1 : 10)
      : DatabaseService.getGroupRanking(bot.jid, hasTarget ? -1 : 10);

    if (!rows.length) {
      await bot.reply("🤷 Ninguém interagiu comigo ainda por aqui.");
      return;
    }

    if (hasTarget) {
      let targetIndex = targetJid
        ? rows.findIndex((row) => row.sender_jid === targetJid)
        : -1;

      if (targetIndex === -1 && targetName) {
        const normalizedTarget = this.#normalizeName(targetName);
        const matches = rows
          .map((row, index) => ({
            index,
            name: UserResolver.getDisplayName(row.sender_jid),
          }))
          .filter(({ name }) => this.#normalizeName(name) === normalizedTarget);

        if (matches.length > 1) {
          await bot.reply("🤔 Encontrei mais de uma pessoa com esse nome. Marca a pessoa para eu consultar sem confusão.");
          return;
        }
        targetIndex = matches[0]?.index ?? -1;
      }

      if (targetIndex === -1) {
        await bot.reply("🤷 Essa pessoa ainda não aparece nesse ranking.");
        return;
      }

      const row = rows[targetIndex];
      const name = UserResolver.getDisplayName(row.sender_jid);
      const label = isGlobal ? "ranking global" : "ranking do grupo";
      await bot.reply(`🏅 *${name}* está em *${targetIndex + 1}º* no ${label}, com *${row.count}* interações.`);
      return;
    }

    const title = isGlobal
      ? "🏆 *Ranking Global* — quem mais fala comigo"
      : "🏆 *Ranking do Grupo* — quem mais fala comigo";

    const lines = rows.map(
      (row, i) => `${this.#medal(i)} ${UserResolver.getDisplayName(row.sender_jid)} — ${row.count}`
    );

    await bot.sendText(`${title}\n\n${lines.join("\n")}`);
  }

  async onCommand(command, bot) {
    const body = (bot.body || "").toLowerCase();
    const scope = body.includes("global") ? "global" : "group";
    const mentioned = await bot.getMentionedJids?.() ?? [];

    await RankPlugin.showRanking(bot, {
      scope,
      targetJid: mentioned[0] ?? null,
    });
  }
}
