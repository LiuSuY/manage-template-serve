import { Context, Next } from "@oak/oak";
import { z, ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (ctx: Context, next: Next) => {
    try {
      // 检查是否有请求体
      if (!ctx.request.hasBody) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "请求体不能为空",
          details: [{ message: "Request body is required" }]
        };
        return;
      }

      const body = await ctx.request.body.json();
      
      const validatedData = schema.parse(body);
      ctx.state.validatedBody = validatedData;
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "参数校验失败",
          details: error.errors
        };
        return;
      }
      throw error;
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  // 如果没有传入则不检查
  if (!schema) {
    return async (ctx: Context, next: Next) => {
      await next();
    };
  }
  return async (ctx: Context, next: Next) => {
    try {
      const query = Object.fromEntries(ctx.request.url.searchParams);
      const validatedData = schema.parse(query);
      ctx.state.validatedQuery = validatedData;
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "查询参数校验失败",
          details: error.errors
        };
        return;
      }
      throw error;
    }
  };
}