import { Context, Next } from "@oak/oak";

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
    
    // 如果没有设置响应体且状态码为404，说明路由未找到
    if (ctx.response.status === 404 && !ctx.response.body) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        error: "请求的资源不存在",
        message: "未找到对应的API端点",
        path: ctx.request.url.pathname,
        method: ctx.request.method,
        timestamp: new Date().toISOString(),
        // 可以添加重定向建议
        suggestions: [
          "检查API路径是否正确",
          "确认HTTP方法是否支持",
          "查看API文档获取正确的端点信息"
        ]
      };
    }
  } catch (error) {
    console.error("Error:", error);
    
    // 处理405方法不允许错误
    if (error.status === 405) {
      ctx.response.status = 405;
      ctx.response.body = {
        success: false,
        error: "HTTP方法不被允许",
        message: `${ctx.request.method} 方法不支持此端点`,
        path: ctx.request.url.pathname,
        method: ctx.request.method,
        allowedMethods: error.allowedMethods || [],
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    ctx.response.status = error.status || 500;
    ctx.response.body = {
      success: false,
      error: error.message || "服务器内部错误",
      path: ctx.request.url.pathname,
      method: ctx.request.method,
      timestamp: new Date().toISOString(),
      ...(Deno.env.get("NODE_ENV") === "development" && { stack: error.stack })
    };
  }
}