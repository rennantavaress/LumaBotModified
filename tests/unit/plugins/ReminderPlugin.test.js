import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSchedule = vi.fn();

vi.mock("../../../src/core/services/ReminderService.js", () => ({
  ReminderService: { schedule: (...a) => mockSchedule(...a) },
}));

vi.mock("../../../src/utils/Logger.js", () => ({
  Logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const { ReminderPlugin, parseBrDateTime } = await import(
  "../../../src/plugins/reminder/ReminderPlugin.js"
);

describe("parseBrDateTime", () => {
  it("parseia DD/MM/AAAA HH:mm como horário de Brasília", () => {
    const t = parseBrDateTime("02/06/2026 16:00", 2026);
    expect(t).toBe(Date.parse("2026-06-02T16:00:00-03:00"));
  });

  it("usa o ano corrente quando o ano é omitido", () => {
    const t = parseBrDateTime("02/06 16:00", 2026);
    expect(t).toBe(Date.parse("2026-06-02T16:00:00-03:00"));
  });

  it("retorna null para formato inválido", () => {
    expect(parseBrDateTime("amanhã às 4", 2026)).toBeNull();
    expect(parseBrDateTime("sem hora", 2026)).toBeNull();
  });
});

function makeBot({ body, jid = "g@g.us", isGroup = true, senderJid = "u@s", mentions = [] } = {}) {
  return {
    body, jid, isGroup, senderJid,
    replied: null,
    async reply(t) { this.replied = t; },
    async getMentionedJids() { return mentions; },
  };
}

describe("ReminderPlugin.onCommand", () => {
  beforeEach(() => mockSchedule.mockReset());

  it("mostra uso quando falta o separador |", async () => {
    const bot = makeBot({ body: "!lembrete amanhã reunião" });
    await new ReminderPlugin().onCommand("!lembrete", bot);
    expect(bot.replied).toContain("Uso:");
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("agenda com data válida e usa o autor quando não há menção", async () => {
    const bot = makeBot({ body: "!lembrete 02/06/2026 16:00 | reunião" });
    await new ReminderPlugin().onCommand("!lembrete", bot);
    expect(mockSchedule).toHaveBeenCalledOnce();
    const arg = mockSchedule.mock.calls[0][0];
    expect(arg.text).toBe("reunião");
    expect(arg.mentionJids).toEqual(["u@s"]);
    expect(bot.replied).toContain("agendado");
  });

  it("usa as pessoas mencionadas quando existem", async () => {
    const bot = makeBot({ body: "!lembrete 02/06/2026 16:00 | call", mentions: ["a@s", "b@s"] });
    await new ReminderPlugin().onCommand("!lembrete", bot);
    expect(mockSchedule.mock.calls[0][0].mentionJids).toEqual(["a@s", "b@s"]);
  });

  it("avisa quando a data é inválida", async () => {
    const bot = makeBot({ body: "!lembrete qualquer coisa | texto" });
    await new ReminderPlugin().onCommand("!lembrete", bot);
    expect(bot.replied).toMatch(/inválida/i);
    expect(mockSchedule).not.toHaveBeenCalled();
  });
});
