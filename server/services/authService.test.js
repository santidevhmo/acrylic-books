import argon2 from "argon2";
import { beforeEach, describe, expect, it } from "vitest";
import { initTables } from "../db/initTables.js";
import { createUserRepository } from "../repositories/userRepository.js";
import { openMemoryDB } from "../test/openMemoryDB.js";
import { createAuthService } from "./authService.js";

describe("authService", () => {
  let db;
  let userRepository;
  let authService;

  beforeEach(async () => {
    db = await openMemoryDB();
    await initTables(db);
    userRepository = createUserRepository(db);
    authService = createAuthService({ userRepository });
  });

  it("hashes passwords and stores the created session user id on signup", async () => {
    const session = {};

    const user = await authService.signup({
      email: "Reader@example.com ",
      password: "password123",
      session,
    });

    const storedUser = await userRepository.findUserByEmail("reader@example.com");
    expect(user).toEqual({ id: 1, email: "reader@example.com" });
    expect(session.userId).toBe(1);
    expect(storedUser.password_hash).not.toBe("password123");
    await expect(argon2.verify(storedUser.password_hash, "password123")).resolves.toBe(true);
  });

  it("rejects invalid email and short password on signup", async () => {
    await expect(
      authService.signup({
        email: "not-an-email",
        password: "password123",
        session: {},
      })
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      authService.signup({
        email: "reader@example.com",
        password: "short",
        session: {},
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it("rejects duplicate signup email", async () => {
    await authService.signup({
      email: "reader@example.com",
      password: "password123",
      session: {},
    });

    await expect(
      authService.signup({
        email: "reader@example.com",
        password: "password456",
        session: {},
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("logs in a known user and rejects bad credentials", async () => {
    await authService.signup({
      email: "reader@example.com",
      password: "password123",
      session: {},
    });

    const session = {};
    await expect(
      authService.login({
        email: "reader@example.com",
        password: "password123",
        session,
      })
    ).resolves.toEqual({
      id: 1,
      email: "reader@example.com",
    });
    expect(session.userId).toBe(1);

    await expect(
      authService.login({
        email: "reader@example.com",
        password: "wrong-pass",
        session: {},
      })
    ).rejects.toMatchObject({ status: 401 });
  });

  it("returns the current user from the session", async () => {
    const createdUser = await authService.signup({
      email: "reader@example.com",
      password: "password123",
      session: {},
    });

    await expect(
      authService.getCurrentUser({
        session: { userId: createdUser.id },
      })
    ).resolves.toEqual(createdUser);

    await expect(
      authService.getCurrentUser({
        session: {},
      })
    ).resolves.toBeNull();
  });
});
