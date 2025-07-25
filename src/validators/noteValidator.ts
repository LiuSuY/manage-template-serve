import { z } from "zod";

export const createNoteSchema = z.object({
  id: z.coerce.number().int().min(1, "id必须大于0"),
  cate_id: z.coerce.number().int().min(1, "公告分类ID必须大于0"),
  title: z.string().max(225, "标题长度不能超过225个字符").optional(),
  content: z.string().min(1, "公告内容不能为空").max(65535, "公告内容长度不能超过65535个字符"),
  src: z.string().max(100, "关联链接长度不能超过100个字符").optional(),
  status: z.coerce.number().int().min(1, "状态: 1可用,0禁用必须大于0"),
  file_ids: z.string().min(1, "相关附件不能为空").max(500, "相关附件长度不能超过500个字符"),
  role_type: z.coerce.number().int().refine(val => [0, 1, 2].includes(val), { message: "请选择有效的查看权限: 0所有人,1部门,2人员" }),
  role_dids: z.string().min(1, "可查看部门不能为空").max(500, "可查看部门长度不能超过500个字符"),
  role_uids: z.string().min(1, "可查看用户不能为空").max(500, "可查看用户长度不能超过500个字符"),
  start_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)"),
  end_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)"),
  admin_id: z.coerce.number().int().min(1, "发布人id必须大于0"),
  create_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)"),
  update_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)"),
  delete_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)")
});

export const updateNoteSchema = z.object({
  id: z.coerce.number().int().min(1, "id必须大于0"),
  cate_id: z.coerce.number().int().optional(),
  title: z.string().max(225, "标题长度不能超过225个字符").optional(),
  content: z.string().max(65535, "公告内容长度不能超过65535个字符").optional(),
  src: z.string().max(100, "关联链接长度不能超过100个字符").optional(),
  status: z.coerce.number().int().optional(),
  file_ids: z.string().max(500, "相关附件长度不能超过500个字符").optional(),
  role_type: z.coerce.number().int().refine(val => [0, 1, 2].includes(val), { message: "请选择有效的查看权限: 0所有人,1部门,2人员" }).optional(),
  role_dids: z.string().max(500, "可查看部门长度不能超过500个字符").optional(),
  role_uids: z.string().max(500, "可查看用户长度不能超过500个字符").optional(),
  start_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)").optional(),
  end_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)").optional(),
  admin_id: z.coerce.number().int().optional(),
  create_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)").optional(),
  update_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)").optional(),
  delete_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "请输入有效的时间格式(YYYY-MM-DD HH:mm:ss)").optional()
});

export const deleteNoteSchema = z.object({
  id: z.number().int().min(1, "ID必须大于0")
});

export const listNoteSchema = z.object({
  params: z.object({
    current: z.number().int().min(1).optional().default(1),
    pageSize: z.number().int().min(1).max(100).optional().default(10)
  }).passthrough()
});

export type CreateNote = z.infer<typeof createNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;
export type DeleteNote = z.infer<typeof deleteNoteSchema>;
export type ListNote = z.infer<typeof listNoteSchema>;