import { Router } from "express";
import { registerController, loginController, refreshController } from "./auth.controller";
import { authLimiter } from "../../middleware/rateLimit.middleware";
import { validate } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema, refreshSchema } from "./auth.validation";

const router = Router();

router.post("/register",authLimiter,validate(registerSchema),registerController);

router.post("/login",authLimiter,validate(loginSchema),loginController);
router.post(
  "/refresh",
  validate(refreshSchema),
  refreshController
);
export default router;