import { COMMANDS } from "../../config/constants.js";
import { ReminderService } from "../../core/services/ReminderService.js";
import { Logger } from "../../utils/Logger.js";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Converte "DD/MM[/AAAA] HH:mm" (horário de Brasília) em epoch ms.
 * Retorna null se o formato não bater.
 */
export function parseBrDateTime(input, currentYear) {
  const match = String(input)
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\s+(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const [, dd, mm, yyyy, hh, min] = match;
  const year = yyyy || currentYear;
  const iso = `${year}-${pad(mm)}-${pad(dd)}T${pad(hh)}:${pad(min)}:00-03:00`;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/**
 * Plugin de lembretes via comando manual.
 *
 * Uso: !lembrete DD/MM/AAAA HH:mm | texto   (também !lembrar)
 * Pessoas marcadas na mensagem são mencionadas no disparo; sem menção, lembra
 * quem criou. O agendamento por linguagem natural fica a cargo da Luma (tool
 * schedule_reminder); este comando é a via direta e determinística.
 */
export class ReminderPlugin {
  static commands = [COMMANDS.REMINDER];

  async onCommand(command, bot) {
    const raw = (bot.body || "").replace(/^!lembr(ete|ar)\s*/i, "").trim();

    if (!raw.includes("|")) {
      await bot.reply(
        "ℹ️ Uso: *!lembrete DD/MM/AAAA HH:mm | texto*\nEx: !lembrete 02/06/2026 16:00 | reunião com o time"
      );
      return;
    }

    const [whenPart, ...rest] = raw.split("|");
    const text = rest.join("|").trim();
    const fireAt = parseBrDateTime(whenPart.trim(), new Date().getFullYear());

    if (!fireAt) {
      await bot.reply("⚠️ Data/hora inválida. Use o formato *DD/MM/AAAA HH:mm*.");
      return;
    }

    const mentioned = await bot.getMentionedJids();
    const mentionJids = mentioned.length > 0 ? mentioned : [bot.senderJid];

    try {
      ReminderService.schedule({
        chatJid: bot.jid,
        isGroup: bot.isGroup,
        creatorJid: bot.senderJid,
        mentionJids,
        text,
        datetime: fireAt,
      });
      await bot.reply("⏰ Lembrete agendado!");
    } catch (error) {
      Logger.error("Erro ao agendar lembrete manual:", error);
      await bot.reply(`⚠️ ${error.message}`);
    }
  }
}
