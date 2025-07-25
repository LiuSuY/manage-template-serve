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
      msg: "创建成功",
      code: 0,
      data: result
    };
  } catch (error) {
    throw error;
  }
}

export async function get${capitalizedModule}List(ctx: Context) {
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
    
    const result = await ${capitalizedModule}Service.get${capitalizedModule}List(params);
    
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

export async function update${capitalizedModule}(ctx: Context) {
  try {
    const data: Update${capitalizedModule} = ctx.state.validatedBody;
    const result = await ${capitalizedModule}Service.update${capitalizedModule}(data.id, data);
    
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

export async function delete${capitalizedModule}(ctx: Context) {
  try {
    const id = Number(ctx.params.id);
    const result = await ${capitalizedModule}Service.delete${capitalizedModule}(id);
    
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