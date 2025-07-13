import { Context } from "@oak/oak";
import { UserService } from "../services/userService.ts";
import { CreateUserInput, UpdateUserInput, GetUserQuery } from "../validators/userValidator.ts";

export async function createUser(ctx: Context) {
  try {
    const userData: CreateUserInput = ctx.state.validatedBody;
    const user = await UserService.createUser(userData);
    
    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "用户创建成功",
      data: user
    };
  } catch (error) {
    throw error;
  }
}

export async function getUsers(ctx: Context) {
  try {
    const query: GetUserQuery = ctx.state.validatedQuery || {};
    const result = await UserService.getUsers(query);
    
    ctx.response.body = {
      success: true,
      ...result
    };
  } catch (error) {
    console.log(error)
    throw error;
  }
}

export async function getUserById(ctx: Context) {
  try {
    const id = parseInt(ctx.params.id!);
    const user = await UserService.getUserById(id);
    
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        error: "用户不存在"
      };
      return;
    }
    
    ctx.response.body = {
      success: true,
      data: user
    };
  } catch (error) {
    throw error;
  }
}

export async function updateUser(ctx: Context) {
  try {
    const id = parseInt(ctx.params.id!);
    const userData: UpdateUserInput = ctx.state.validatedBody;
    
    const user = await UserService.updateUser(id, userData);
    
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        error: "用户不存在"
      };
      return;
    }
    
    ctx.response.body = {
      success: true,
      message: "用户更新成功",
      data: user
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(ctx: Context) {
  try {
    const id = parseInt(ctx.params.id!);
    const success = await UserService.deleteUser(id);
    
    if (!success) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        error: "用户不存在"
      };
      return;
    }
    
    ctx.response.body = {
      success: true,
      message: "用户删除成功"
    };
  } catch (error) {
    throw error;
  }
}