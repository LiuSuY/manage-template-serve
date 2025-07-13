import { Context } from "@oak/oak";
import { ApiResponse } from "../types/common.ts";

export function success<T>(ctx: Context, data?: T, message?: string, status = 200) {
  ctx.response.status = status;
  ctx.response.body = {
    success: true,
    message,
    data
  } as ApiResponse<T>;
}

export function error(ctx: Context, message: string, status = 400) {
  ctx.response.status = status;
  ctx.response.body = {
    success: false,
    error: message
  } as ApiResponse;
}