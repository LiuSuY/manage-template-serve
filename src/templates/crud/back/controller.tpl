import { Context } from "@oak/oak";
import { ${capitalizedModule}Service } from "../services/${module}Service.ts";
import { Create${capitalizedModule}, Update${capitalizedModule} } from "../validators/${module}Validator.ts";

export async function create${capitalizedModule}(ctx: Context) {
  try {
    const data: Create${capitalizedModule} = ctx.state.validatedBody;
    const result = await ${capitalizedModule}Service.create${capitalizedModule}(data);
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "创建成功",
      code: 0,
      data: result
    };
  } catch (error) {
    throw error;
  }
}

export async function get${capitalizedModule}List(ctx: Context) {
  try {
    const queryParams = ctx.request.url.searchParams;
    const result = await ${capitalizedModule}Service.get${capitalizedModule}List({
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

export async function get${capitalizedModule}ById(ctx: Context) {
  try {
    const id = Number(ctx.params.id);
    const result = await ${capitalizedModule}Service.get${capitalizedModule}ById(id);
    
    if (!result) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        code: -1,
        data: "",
        message: "记录不存在"
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

export async function update${capitalizedModule}(ctx: Context) {
  try {
    const id = Number(ctx.params.id);
    const data: Update${capitalizedModule} = ctx.state.validatedBody;
    const result = await ${capitalizedModule}Service.update${capitalizedModule}(id, data);
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "更新成功",
      code: 0,
      data: result
    };
  } catch (error) {
    throw error;
  }
}

export async function delete${capitalizedModule}(ctx: Context) {
  try {
    const id = Number(ctx.params.id);
    const result = await ${capitalizedModule}Service.delete${capitalizedModule}(id);
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      code: 0,
      message: "删除成功"
    };
  } catch (error) {
    throw error;
  }
}