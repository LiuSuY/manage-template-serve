import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "姓名至少2个字符").max(50, "姓名不能超过50个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  age: z.number().int().min(18, "年龄必须大于等于18").max(100, "年龄不能超过100").optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码").optional()
});

export const updateUserSchema = createUserSchema.partial();

export const getUserQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  search: z.string().optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUserQuery = z.infer<typeof getUserQuerySchema>;