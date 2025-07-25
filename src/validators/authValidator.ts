import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空")
});

export const registerSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  username: z.string().min(1, "用户名不能为空").optional(),
  email: z.string().email("请输入有效的邮箱地址"),
  mobile: z.string().optional(),
  password: z.string().min(6, "密码至少6位"),
  phone: z.string().optional(),
  age: z.number().int().positive().optional()
});

export const lockSchema = z.object({
  lock_password: z.string().min(1, "请输入登录密码解锁")
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LockInput = z.infer<typeof lockSchema>;