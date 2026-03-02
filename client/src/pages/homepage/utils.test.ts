import { describe, expect, it } from "vitest";
import {
  buildShareText,
  formatQuizDate,
  getShareContext,
  getUserScopeFromToken,
  normalizeGuess,
} from "./utils";

describe("homepage utils", () => {
  it("normalizes guesses by trimming and lowercasing", () => {
    expect(normalizeGuess("  NaRUtO  ")).toBe("naruto");
  });

  it("formats quiz date as DD/MM/YYYY", () => {
    expect(formatQuizDate("2026-03-02")).toBe("02/03/2026");
    expect(formatQuizDate("invalid")).toBe("invalid");
  });

  it("builds share text for win and loss", () => {
    expect(buildShareText("2026-03-02", "won", 3)).toContain("en 3 essais");
    expect(buildShareText("2026-03-02", "lost", null)).toContain("❌");
  });

  it("extracts stable user scope from JWT payload", () => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    const payload = btoa(JSON.stringify({ username: "morgan" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    const token = `${header}.${payload}.signature`;

    expect(getUserScopeFromToken(token)).toBe("auth-morgan");
    expect(getUserScopeFromToken(null)).toBe("guest");
  });

  it("returns share context only for completed/won/lost states", () => {
    expect(getShareContext("2026-03-02", "idle", null, 0, 5)).toBeNull();

    const context = getShareContext(
      "2026-03-02",
      "completed",
      { status: "won", hintsUsed: 2 },
      0,
      5
    );

    expect(context?.shareStatus).toBe("won");
    expect(context?.shareTries).toBe(2);
  });
});
