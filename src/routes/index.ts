import { Router } from "@oak/oak";
import userRoutes from "./user.ts";
import authRoutes from "./auth.ts";
import noteRoutes from "./note.ts";
import crudRoutes from "./crud.ts";

const router = new Router();
// 健康检查
router.get("/", (ctx) => {
  ctx.response.body = {
    success: true,
    message: "OA API 服务运行正常",
    timestamp: new Date().toISOString()
  };
});

// 认证路由（无需认证）
router.use(authRoutes.routes(), authRoutes.allowedMethods());

// 其他路由（可能需要认证）
router.use(userRoutes.routes(), userRoutes.allowedMethods());
router.use(noteRoutes.routes(), noteRoutes.allowedMethods());
router.use(crudRoutes.routes(), crudRoutes.allowedMethods());

export default router;