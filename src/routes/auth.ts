import { Router } from "@oak/oak";
import { validateBody } from "../middleware/validation.ts";
import { loginSchema, registerSchema, lockSchema } from "../validators/authValidator.ts";
import { authMiddleware } from "../middleware/auth.ts";
import * as authController from "../controllers/authController.ts";

const router = new Router({ prefix: "/api/auth" });

// 登录
router.post("/login", 
  validateBody(loginSchema),
  authController.login
);

// 注册
router.post("/register",
  validateBody(registerSchema),
  authController.register
);

// 退出登录
router.post("/logout",
  authController.logout
);

// 获取当前用户信息（需要认证）
router.get("/me",
  authMiddleware,
  authController.getCurrentUser
);

// 锁屏（需要认证）
router.get("/lock",
  authMiddleware,
  authController.lock
);

// 解锁（需要认证）
router.post("/lock",
  authMiddleware,
  validateBody(lockSchema),
  authController.lock
);

export default router;