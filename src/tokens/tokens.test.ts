import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { tokenCollections, themeModes } from "./generated/tokens";

describe("token build output", () => {
  it("parses all six source collections", () => {
    expect(Object.keys(tokenCollections)).toHaveLength(6);
  });

  it("emits the expected theme modes", () => {
    expect(themeModes).toEqual(["light", "dark"]);
  });

  it("preserves alias relationships in the semantic theme collection", () => {
    const textPrimary = tokenCollections.Theme["Color/text/primary"];
    const lightMode = textPrimary.valuesByMode.Light;

    expect(lightMode.kind).toBe("alias");
    expect(lightMode.cssVar).toBe("--color-grey-900");
  });

  it("writes the normalized raw token artifact", () => {
    const rawPath = resolve(process.cwd(), "src/tokens/generated/tokens.raw.json");
    const raw = JSON.parse(readFileSync(rawPath, "utf8"));

    expect(raw.collections).toHaveLength(6);
  });
});
