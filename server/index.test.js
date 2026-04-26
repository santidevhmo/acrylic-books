import { describe, expect, it } from "vitest";
import { PORT } from "./index.js";

describe("server index", () => {
  it("uses port 800", () => {
    expect(PORT).toBe(800);
  });
});
