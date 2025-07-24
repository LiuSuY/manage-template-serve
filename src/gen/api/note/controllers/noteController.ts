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
    const queryParams = ctx.request.url.searchParams;
    const result = await NoteService.getNoteList({
      page: Number(queryParams.get('page')) || 1,
      limit: Number(queryParams.get('limit')) || 10,
      search: queryParams.get('search') || undefined
    });
    
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
      msg: "更新成功",
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