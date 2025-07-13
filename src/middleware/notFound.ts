import { Context, Next } from "@oak/oak";

/**
 * 404 Not Found 处理中间件
 * 这个中间件应该放在所有路由之后
 */
export async function notFoundHandler(ctx: Context, next: Next) {
  await next();
  
  // 如果响应状态是404且没有响应体，说明没有路由匹配
  if (ctx.response.status === 404 && !ctx.response.body) {
    ctx.response.status = 404;
    ctx.response.body = {
      success: false,
      error: "页面未找到",
      message: "请求的API端点不存在",
      details: {
        path: ctx.request.url.pathname,
        method: ctx.request.method,
        timestamp: new Date().toISOString(),
        userAgent: ctx.request.headers.get("user-agent") || "Unknown"
      },
      suggestions: [
        "检查API路径拼写是否正确",
        "确认使用的HTTP方法是否正确",
        "查看API文档获取可用的端点列表",
        "联系开发团队获取帮助"
      ],
    };
  }
}