import { describe, it, expect, vi, beforeEach } from "vitest";

const mockShowRanking = vi.fn();
const mockSetNickname = vi.fn();

vi.mock("../../src/plugins/luma/RankPlugin.js", () => ({
  RankPlugin: {
    showRanking: (...args) => mockShowRanking(...args),
  },
}));

vi.mock("../../src/plugins/user/UserPlugin.js", () => ({
  UserPlugin: {
    setNickname: (...args) => mockSetNickname(...args),
  },
}));

vi.mock("../../src/services/Database.js", () => ({
  DatabaseService: { incrementMetric: vi.fn() },
}));

vi.mock("../../src/utils/Logger.js", () => ({
  Logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("../../src/managers/GroupManager.js", () => ({
  GroupManager: { mentionEveryone: vi.fn() },
}));

vi.mock("../../src/handlers/MediaProcessor.js", () => ({
  MediaProcessor: {},
}));

vi.mock("../../src/managers/PersonalityManager.js", () => ({
  PersonalityManager: {},
}));

vi.mock("../../src/core/services/ReminderService.js", () => ({
  ReminderService: {},
}));

const { ToolDispatcher } = await import("../../src/handlers/ToolDispatcher.js");

function makeBot({
  mentions = [],
  senderJid = "111@s.whatsapp.net",
  isGroup = true,
  body = "Luma, manda o rank",
} = {}) {
  return {
    senderJid,
    isGroup,
    body,
    socket: {
      authState: {
        creds: {
          me: {
            id: "999@s.whatsapp.net",
            lid: "888@lid",
          },
        },
      },
    },
    repliedText: null,
    async getMentionedJids() {
      return mentions;
    },
    async reply(text) {
      this.repliedText = text;
    },
  };
}

describe("ToolDispatcher — ferramentas sociais", () => {
  beforeEach(() => {
    mockShowRanking.mockReset();
    mockSetNickname.mockReset();
  });

  it("show_rank genérico em grupo ignora escopo global escolhido pela IA", async () => {
    const bot = makeBot({ mentions: ["999@s.whatsapp.net"] });

    await ToolDispatcher.handleShowRank(bot, { scope: "global" });

    expect(mockShowRanking).toHaveBeenCalledWith(bot, {
      scope: "group",
      targetJid: null,
      targetName: null,
    });
  });

  it.each([
    "Luma, manda o ranking global",
    "Luma, mostra o rank geral",
    "Luma, envia o ranking de todos os chats",
    "mas e o geral? luma",
    "mas e no geral? luma",
    "e o global?",
    "e na global?",
    "e no ranking geral?",
    "Luma, mostra o geral",
    "Luma, mostra no geral",
  ])("show_rank usa global em grupo quando o pedido é explícito: %s", async (body) => {
    const bot = makeBot({ body });

    await ToolDispatcher.handleShowRank(bot, { scope: "group" });

    expect(mockShowRanking).toHaveBeenCalledWith(bot, {
      scope: "global",
      targetJid: null,
      targetName: null,
    });
  });

  it.each([
    "Luma, manda o rank",
    "Luma, não quero o geral, manda o do grupo",
    "Luma, mostra o ranking deste grupo",
    "Luma, qual é a ideia geral disso?",
    "Luma, no geral eu prefiro o ranking do grupo",
  ])("show_rank mantém grupo quando 'geral' não é pedido global inequívoco: %s", async (body) => {
    const bot = makeBot({ body });

    await ToolDispatcher.handleShowRank(bot, { scope: "global" });

    expect(mockShowRanking).toHaveBeenCalledWith(bot, {
      scope: "group",
      targetJid: null,
      targetName: null,
    });
  });

  it("show_rank no PV sempre usa global", async () => {
    const bot = makeBot({ isGroup: false, body: "Luma, manda o rank" });

    await ToolDispatcher.handleShowRank(bot, { scope: "group" });

    expect(mockShowRanking).toHaveBeenCalledWith(bot, {
      scope: "global",
      targetJid: null,
      targetName: null,
    });
  });

  it("show_rank consulta a posição de quem pediu", async () => {
    const bot = makeBot();

    await ToolDispatcher.handleShowRank(bot, { scope: "group", target: "self" });

    expect(mockShowRanking).toHaveBeenCalledWith(bot, {
      scope: "group",
      targetJid: "111@s.whatsapp.net",
      targetName: null,
    });
  });

  it("show_rank usa a pessoa mencionada e exclui a menção da Luma", async () => {
    const bot = makeBot({
      mentions: ["999@s.whatsapp.net", "222@s.whatsapp.net"],
    });

    await ToolDispatcher.handleShowRank(bot, {
      scope: "group",
      target: "@João",
    });

    expect(mockShowRanking).toHaveBeenCalledWith(bot, {
      scope: "group",
      targetJid: "222@s.whatsapp.net",
      targetName: "@João",
    });
  });

  it("set_nickname exige menção real para alterar outra pessoa", async () => {
    const bot = makeBot({ mentions: ["999@s.whatsapp.net"] });

    await ToolDispatcher.handleSetNickname(bot, {
      target: "mentioned_user",
      nickname: "Mestre",
    });

    expect(mockSetNickname).not.toHaveBeenCalled();
    expect(bot.repliedText).toContain("Marca a pessoa");
  });

  it("handleToolCalls encaminha set_nickname para a pessoa mencionada", async () => {
    const bot = makeBot({
      mentions: ["999@s.whatsapp.net", "222@s.whatsapp.net"],
    });

    await ToolDispatcher.handleToolCalls(bot, [{
      name: "set_nickname",
      args: { target: "mentioned_user", nickname: "Mestre" },
    }], null);

    expect(mockSetNickname).toHaveBeenCalledWith(bot, {
      nickname: "Mestre",
      targetJid: "222@s.whatsapp.net",
    });
  });
});
