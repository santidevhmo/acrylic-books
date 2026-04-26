import { Router } from "express";

export function createAuthRouter({ authController }) {
  const router = Router();

  router.post("/signup", authController.signup);
  router.post("/login", authController.login);
  router.post("/logout", authController.logout);
  router.get("/me", authController.me);

  return router;
}
