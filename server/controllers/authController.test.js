import { beforeEach, describe, expect, it } from "vitest";
import { sessionCookieName } from "../config/session.js";
import { initTables } from "../db/initTables.js";
import { createUserRepository } from "../repositories/userRepository.js";
import { createAuthService } from "../services/authService.js";
import { openMemoryDB } from "../test/openMemoryDB.js";
import { createAuthController } from "./authController.js";

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    clearedCookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    clearCookie(name, options) {
      this.clearedCookies.push({ name, options });
      return this;
    },
  };
}

describe("authController", () => {
  let db;
  let authController;

  beforeEach(async () => {
    db = await openMemoryDB();
    await initTables(db);

    const userRepository = createUserRepository(db);
    const authService = createAuthService({ userRepository });
    authController = createAuthController({ authService });
  });

  it("signs up, reads the current user, and logs out", async () => {
    const signupSession = {
      destroy(callback) {
        delete this.userId;
        callback(null);
      },
    };
    const signupResponse = createMockResponse();

    await authController.signup(
      {
        body: { email: "reader@example.com", password: "password123" },
        session: signupSession,
      },
      signupResponse
    );

    expect(signupResponse.statusCode).toBe(201);
    expect(signupResponse.body.user.email).toBe("reader@example.com");
    expect(signupSession.userId).toBe(1);

    const meResponse = createMockResponse();
    await authController.me(
      {
        session: { userId: signupSession.userId },
      },
      meResponse
    );

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.body.user).toEqual({
      id: 1,
      email: "reader@example.com",
    });

    const logoutResponse = createMockResponse();
    await authController.logout(
      {
        session: signupSession,
      },
      logoutResponse
    );

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.body).toEqual({ success: true });
    expect(logoutResponse.clearedCookies).toEqual([
      {
        name: sessionCookieName,
        options: { path: "/" },
      },
    ]);

    const meAfterLogoutResponse = createMockResponse();
    await authController.me(
      {
        session: {},
      },
      meAfterLogoutResponse
    );

    expect(meAfterLogoutResponse.statusCode).toBe(200);
    expect(meAfterLogoutResponse.body.user).toBeNull();
  });

  it("returns the expected auth status codes", async () => {
    const invalidEmailResponse = createMockResponse();
    await authController.signup(
      {
        body: { email: "reader@example", password: "password123" },
        session: {},
      },
      invalidEmailResponse
    );
    expect(invalidEmailResponse.statusCode).toBe(400);

    const shortPasswordResponse = createMockResponse();
    await authController.signup(
      {
        body: { email: "reader@example.com", password: "short" },
        session: {},
      },
      shortPasswordResponse
    );
    expect(shortPasswordResponse.statusCode).toBe(400);

    await authController.signup(
      {
        body: { email: "reader@example.com", password: "password123" },
        session: {},
      },
      createMockResponse()
    );

    const duplicateEmailResponse = createMockResponse();
    await authController.signup(
      {
        body: { email: "reader@example.com", password: "password999" },
        session: {},
      },
      duplicateEmailResponse
    );
    expect(duplicateEmailResponse.statusCode).toBe(409);

    const invalidPasswordLoginResponse = createMockResponse();
    await authController.login(
      {
        body: { email: "reader@example.com", password: "" },
        session: {},
      },
      invalidPasswordLoginResponse
    );
    expect(invalidPasswordLoginResponse.statusCode).toBe(400);

    const wrongPasswordLoginResponse = createMockResponse();
    await authController.login(
      {
        body: { email: "reader@example.com", password: "wrongpass" },
        session: {},
      },
      wrongPasswordLoginResponse
    );
    expect(wrongPasswordLoginResponse.statusCode).toBe(401);
  });
});
