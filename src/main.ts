import { Application } from "@oak/oak";
import { oakCors } from "cors";
import { config } from "./config/app.ts";
import { createPool } from "./database/connection.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { notFoundHandler } from "./middleware/notFound.ts";
import routes from "./routes/index.ts";

const app = new Application();

// CORS 中间件
app.use(oakCors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// 全局错误处理中间件（必须在最前面）
app.use(errorHandler);

// 路由
app.use(routes.routes());
app.use(routes.allowedMethods());

// 404处理中间件（必须在所有路由之后）
app.use(notFoundHandler);

// 初始化数据库连接
try {
  createPool();
  console.log("✅ 数据库已连接");
} catch (error) {
  console.error("❌ 数据库连接失败:", error);
}

console.log(`🚀 服务器运行在 http://localhost:${config.port}`);
console.log(`📝 环境: ${config.env}`);

await app.listen({ port: config.port });
