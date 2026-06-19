import { describe, it, expect } from "vitest";
import { LUMA_CONFIG } from "../../../src/config/lumaConfig.js";

function getTool(name) {
  return LUMA_CONFIG.TOOLS
    .flatMap((group) => group.functionDeclarations ?? [])
    .find((tool) => tool.name === name);
}

describe("LUMA_CONFIG — ferramentas sociais contextuais", () => {
  it("declara show_rank com escopo obrigatório e alvo opcional", () => {
    const tool = getTool("show_rank");

    expect(tool).toBeDefined();
    expect(tool.parameters.required).toEqual(["scope"]);
    expect(tool.parameters.properties.scope.enum).toEqual(["group", "global"]);
    expect(tool.description).toContain("SOMENTE");
  });

  it("declara set_nickname com alvo restrito e orientação contra falsos positivos", () => {
    const tool = getTool("set_nickname");

    expect(tool).toBeDefined();
    expect(tool.parameters.required).toEqual(["nickname", "target"]);
    expect(tool.parameters.properties.target.enum).toEqual(["self", "mentioned_user"]);
    expect(tool.description).toContain("Nunca use apenas");
  });
  it("declara show_summary com limite opcional", () => {
    const tool = getTool("show_summary");

    expect(tool).toBeDefined();
    expect(tool.parameters.properties.limit.type).toBe("NUMBER");
    expect(tool.description).toContain("SOMENTE");
  });
});
