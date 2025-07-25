import { Context } from "@oak/oak";
import { NoteService } from "../services/noteService.ts";
import { CreateNote, UpdateNote } from "../validators/noteValidator.ts";

export async function createNote(ctx: Context) {
  try {
    const data: CreateNote = ctx.state.validatedBody;
    const result = await NoteService.createNote(data);
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      msg: "创建成功",
      code: 0,
      data: result
    };
  } catch (error) {
    throw error;
  }
}

export async function getNoteList(ctx: Context) {
  try {
    // 从请求体中获取参数，而不是从URL查询参数
    const requestBody = ctx.state.validatedBody || {};
    const queryParams = requestBody.params || {};
    
    // 构建查询参数对象
    const params: any = {
      page: Number(queryParams.page) || Number(queryParams.current) || 1,
      limit: Number(queryParams.limit) || Number(queryParams.pageSize) || 10,
      search: queryParams.search || undefined
    };
    
    // 添加所有其他查询参数
    Object.entries(queryParams).forEach(([key, value]) => {
      if (!['page', 'limit', 'current', 'pageSize', 'search'].includes(key) && value) {
        params[key] = value;
      }
    });
    
    const result = await NoteService.getNoteList(params);
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      code: 0,
      data: result
    };
  } catch (error) {
    throw error;
  }
}

export async function getNoteById(ctx: Context) {
  try {
    const id = Number(ctx.params.id);
    const result = await NoteService.getNoteById(id);
    
    if (!result) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        code: -1,
        data: "",
        msg: "记录不存在"
      };
      return;
    }
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      code: 0,
      data: result
    };
  } catch (error) {
    throw error;
  }
}

export async function updateNote(ctx: Context) {
  try {
    const data: UpdateNote = ctx.state.validatedBody;
    const result = await NoteService.updateNote(data.id, data);
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      msg: "修改成功",
      code: 0,
      data: result
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteNote(ctx: Context) {
  try {
    const id = Number(ctx.params.id);
    const result = await NoteService.deleteNote(id);
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      code: 0,
      data: result,
      msg: "删除成功"
    };
  } catch (error) {
    throw error;
  }
}