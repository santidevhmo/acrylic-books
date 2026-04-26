import express from "express";
import { getDBConnection } from "./db/db.js";
import { initTables } from "./db/initTables.js";
import { createSessionMiddleware } from "./config/session.js";
import { createUserRepository } from "./repositories/userRepository.js";
import { createAuthService } from "./services/authService.js";
import { createAuthController } from "./controllers/authController.js";
import { createAuthRouter } from "./routes/auth.js";

export async function createApp({ db } = {}) {
  
  const activeDB = db ?? (await getDBConnection());
  await initTables(activeDB);

  const userRepository = createUserRepository(activeDB);
  const authService = createAuthService({ userRepository });
  const authController = createAuthController({ authService });

  const app = express();
  app.use(express.json());
  app.use(createSessionMiddleware());
  app.use("/api/auth", createAuthRouter({ authController }));

  return app;
}
