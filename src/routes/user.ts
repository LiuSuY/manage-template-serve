import { Router } from "@oak/oak";
import { validateBody, validateQuery } from "../middleware/validation.ts";
import { createUserSchema, updateUserSchema, getUserQuerySchema } from "../validators/userValidator.ts";
import * as userController from "../controllers/userController.ts";

const router = new Router({ prefix: "/api/users" });

// 创建用户
router.post("/", 
  validateBody(createUserSchema),
  userController.createUser
);

// 获取用户列表
router.get("/",
  validateQuery(getUserQuerySchema),
  userController.getUsers
);

// 获取单个用户
router.get("/:id", userController.getUserById);

// 更新用户
router.put("/:id",
  validateBody(updateUserSchema),
  userController.updateUser
);

// 删除用户
router.delete("/:id", userController.deleteUser);

export default router;