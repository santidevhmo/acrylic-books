import { beforeEach, describe, expect, it } from "vitest";
import { initTables } from "../db/initTables.js";
import { createUserRepository } from "./userRepository.js";
import { openMemoryDB } from "../test/openMemoryDB.js";

describe("userRepository", () => {
  let db;
  let userRepository;

  beforeEach(async () => {
    db = await openMemoryDB();
    await initTables(db);
    userRepository = createUserRepository(db);
  });

  it("creates a user with the stored hash", async () => {
    const user = await userRepository.createUser({
      email: "reader@example.com",
      passwordHash: "hashed-password",
    });

    expect(user.id).toBe(1);
    expect(user.email).toBe("reader@example.com");
    expect(user.password_hash).toBe("hashed-password");
  });

  it("finds users by email and id", async () => {
    const createdUser = await userRepository.createUser({
      email: "reader@example.com",
      passwordHash: "hashed-password",
    });

    await expect(userRepository.findUserByEmail("reader@example.com")).resolves.toMatchObject({
      id: createdUser.id,
      email: "reader@example.com",
    });
    await expect(userRepository.findUserById(createdUser.id)).resolves.toMatchObject({
      id: createdUser.id,
      email: "reader@example.com",
    });
  });

  it("rejects duplicate emails", async () => {
    await userRepository.createUser({
      email: "reader@example.com",
      passwordHash: "hashed-password",
    });

    await expect(
      userRepository.createUser({
        email: "reader@example.com",
        passwordHash: "second-hash",
      })
    ).rejects.toThrow();
  });
});
