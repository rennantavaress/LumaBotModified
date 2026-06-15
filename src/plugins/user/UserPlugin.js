import { COMMANDS } from "../../config/constants.js";
import { UserResolver } from "../../core/services/UserResolver.js";

/**
 * Plugin de identidade de usuário: apelidos manuais.
 *
 * - !nick <nome>             → define o apelido de quem enviou
 * - !nick @fulano <nome>     → define o apelido da pessoa mencionada
 * - set_nickname             → executa os mesmos fluxos via linguagem natural
 *
 * O apelido tem prioridade máxima na exibição (rankings, lembretes, logs),
 * resolvendo casos de JID @lid, pushName ausente ou nome desatualizado.
 */
export class UserPlugin {
  static commands = [COMMANDS.NICK, COMMANDS.NICK_ALT];

  static normalizeNickname(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60);
  }

  static async setNickname(bot, { nickname, targetJid = bot.senderJid } = {}) {
    const cleanNickname = this.normalizeNickname(nickname);
    if (!cleanNickname) {
      await bot.reply("ℹ️ Me diz qual apelido você quer definir.");
      return false;
    }

    UserResolver.setNickname(targetJid, cleanNickname);

    if (targetJid === bot.senderJid) {
      await bot.reply(`✅ Apelido definido: *${cleanNickname}*`);
      return true;
    }

    await bot.reply(`✅ Apelido de @${targetJid.split("@")[0]} definido: *${cleanNickname}*`, {
      mentions: [targetJid],
    });
    return true;
  }

  async onCommand(command, bot) {
    const body = bot.body || "";
    const mentioned = await bot.getMentionedJids();
    const targetJid = mentioned[0] ?? bot.senderJid;

    // Remove o comando e eventuais tokens de menção, restando só o apelido.
    const nick = body
      .slice(command.length)
      .replace(/@\d+/g, "")
      .trim();

    if (!nick) {
      await bot.reply("ℹ️ Uso: *!nick SeuNome* ou *!nick @pessoa Nome*");
      return;
    }

    await UserPlugin.setNickname(bot, { nickname: nick, targetJid });
  }
}
