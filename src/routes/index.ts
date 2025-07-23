import { Router } from "@oak/oak";
import userRoutes from "./user.ts";
import crudRoutes from './crud.ts';
import noteRoutes from './note.ts';

const router = new Router();

// 健康检查
router.get("/", (ctx) => {
  ctx.response.body = {
    success: true,
    message: "OA API 服务运行正常",
    timestamp: new Date().toISOString()
  };
});

// 注册子路由
router.use(userRoutes.routes());
router.use(userRoutes.allowedMethods());

router.use(crudRoutes.routes());
router.use(crudRoutes.allowedMethods());

router.use(noteRoutes.routes());
router.use(noteRoutes.allowedMethods());

export default router;