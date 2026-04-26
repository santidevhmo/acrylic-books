import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { openMemoryDB } from "./test/openMemoryDB.js";

describe("app", () => {
  let db;
  let app;

  beforeEach(async () => {
    db = await openMemoryDB();
    app = await createApp({ db });
  });

  it("registers json, session, and auth routing middleware", () => {
    const layerNames = app.router.stack.map((layer) => layer.name);

    expect(layerNames).toContain("jsonParser");
    expect(layerNames).toContain("session");
    expect(layerNames).toContain("router");
  });

  it("mounts the auth router under /api/auth with the expected routes", () => {
    const routerLayer = app.router.stack.find((layer) => layer.name === "router");

    expect(routerLayer.matchers[0]("/api/auth/signup")).toMatchObject({
      path: "/api/auth",
    });
    expect(routerLayer.handle.stack.map((layer) => layer.route?.path)).toEqual([
      "/signup",
      "/login",
      "/logout",
      "/me",
    ]);
  });
});
