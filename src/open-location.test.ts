import { describe, expect, it } from "vitest";
import { resolveLeafOpenTarget } from "./open-location";

describe("note open location", () => {
  it("maps every setting to an Obsidian leaf target", () => {
    expect(resolveLeafOpenTarget("current")).toBe(false);
    expect(resolveLeafOpenTarget("tab")).toBe("tab");
    expect(resolveLeafOpenTarget("split")).toBe("split");
  });

  it("lets Ctrl or Command click override the setting with a new tab", () => {
    expect(resolveLeafOpenTarget("current", true)).toBe("tab");
    expect(resolveLeafOpenTarget("split", true)).toBe("tab");
  });
});
