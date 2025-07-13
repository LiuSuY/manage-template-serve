import { z } from "zod";

export const createCrudSchema = z.object({
  name: z.string({
    required_error: "中文菜单名称是必需的",
    invalid_type_error: "中文菜单名称必须是字符串"
  }).min(1, "请输入中文菜单名称"),
  
  module: z.string({
    required_error: "模块名称是必需的",
    invalid_type_error: "模块名称必须是字符串"
  }).min(1, "请输入模块名称"),
  
  table: z.string({
    required_error: "表名是必需的",
    invalid_type_error: "表名必须是字符串"
  }).min(1, "请输入表名"),
  
  controller: z.string({
    required_error: "控制器名称是必需的",
    invalid_type_error: "控制器名称必须是字符串"
  }).min(1, "请输入控制器名称"),
  
  type: z.number({
    required_error: "类型字段是必需的",
    invalid_type_error: "类型必须是数字"
  }).int("类型必须是整数").min(0, "类型不能为负数")
});

export type CreateCrud = z.infer<typeof createCrudSchema>;