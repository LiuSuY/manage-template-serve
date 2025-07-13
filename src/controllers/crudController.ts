import { Context } from "@oak/oak";
import { CrudService } from "../services/crudService.ts";
import { CreateCrud } from "../validators/crudValidator.ts";

export async function createCrud(ctx: Context) {
  try {
    const crudData: CreateCrud = ctx.state.validatedBody;
    const result = await CrudService.createCrud(crudData);
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "新模块创建成功",
      data: result // 返回实际结果
    };  } catch (error) {
    throw error;
  }
}

