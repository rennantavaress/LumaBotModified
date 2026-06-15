import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSetNickname = vi.fn();

vi.mock("../../../src/core/services/UserResolver.js", () => ({
  UserResolver: {
    setNickname: (...args) => mockSetNickname(...args),
  },
}));

const { UserPlugin } = await import("../../../src/plugins/user/UserPlugin.js");

function makeBot({ body = "!nick Rennan", mentions = [], senderJid = "me@s" } = {}) {
  return {
    body,
    senderJid,
    repliedText: null,
    replyOptions: null,
    async getMentionedJids() {
      return mentions;
    },
    async reply(text, options) {
      this.repliedText = text;
      this.replyOptions = options;
    },
  };
}

describe("UserPlugin", () => {
  beforeEach(() => {
    mockSetNickname.mockReset();
  });

  it("!nick define o apelido de quem enviou", async () => {
    const bot = makeBot();

    await new UserPlugin().onCommand("!nick", bot);

    expect(mockSetNickname).toHaveBeenCalledWith("me@s", "Rennan");
    expect(bot.repliedText).toContain("Apelido definido");
  });

  it("!nick @pessoa Nome define o apelido da pessoa mencionada", async () => {
    const bot = makeBot({
      body: "!nick @5511999999999 Mestre",
      mentions: ["other@s"],
    });

    await new UserPlugin().onCommand("!nick", bot);

    expect(mockSetNickname).toHaveBeenCalledWith("other@s", "Mestre");
    expect(bot.replyOptions).toEqual({ mentions: ["other@s"] });
  });

  it("normaliza espaços e limita o apelido a 60 caracteres", async () => {
    const bot = makeBot();
    const longNickname = `  ${"a".repeat(70)}   sobrenome `;

    await UserPlugin.setNickname(bot, { nickname: longNickname });

    const savedNickname = mockSetNickname.mock.calls[0][1];
    expect(savedNickname).toHaveLength(60);
    expect(savedNickname).not.toContain("  ");
  });

  it("não altera apelido quando nenhum nome foi informado", async () => {
    const bot = makeBot({ body: "!nick" });

    await new UserPlugin().onCommand("!nick", bot);

    expect(mockSetNickname).not.toHaveBeenCalled();
    expect(bot.repliedText).toContain("Uso");
  });
});
