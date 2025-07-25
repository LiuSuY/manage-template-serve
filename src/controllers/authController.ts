import { Context } from "@oak/oak";
import { UserService } from "../services/userService.ts";
import { generateToken } from "../middleware/auth.ts";
import { LoginData, RegisterData, LockData } from "../types/user.ts";
import { verifyPassword, generateSalt, setPassword } from "../utils/password.ts";

// 获取客户端IP
function getClientIP(ctx: Context): string {
  return ctx.request.headers.get("x-forwarded-for") || 
         ctx.request.headers.get("x-real-ip") || 
         ctx.request.ip || 
         "unknown";
}

export async function login(ctx: Context) {
  try {
    const { username, password }: LoginData = ctx.state.validatedBody;
    const clientIP = getClientIP(ctx);
    
    // 查找用户（支持用户名、邮箱、手机号）
    const user = await UserService.getUserByUsernameOrEmail(username);
    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "用户名或手机号码错误"
      };
      return;
    }
    
    // 验证密码
    const isValidPassword = await verifyPassword(password, user.pwd, user.salt!);
    if (!isValidPassword) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "用户或密码错误"
      };
      return;
    }
    
    // 检查用户状态
    if (user.status !== 1) {
      ctx.response.status = 403;
      ctx.response.body = {
        success: false,
        message: "该用户禁止登录,请与管理者联系"
      };
      return;
    }
    // 生成token
    const token = await generateToken(user.id);
    console.log(token)
    // 记录登录日志
    await UserService.createAdminLog({
      uid: user.id,
      type: 'login',
      action: '登录',
      subject: '系统',
      param_id: user.id,
      param: '[]',
      ip: clientIP,
      create_time: new Date()
    });
    
    // 返回用户信息（不包含密码和盐值）
    const { password: _, salt: __, ...userWithoutPassword } = user;
    
    ctx.response.body = {
      success: true,
      message: "登录成功",
      data: {
        uid: user.id,
        user: userWithoutPassword,
        token
      }
    };
  } catch (error) {
    throw error;
  }
}

export async function register(ctx: Context) {
  try {
    const userData: RegisterData = ctx.state.validatedBody;
    
    // 检查邮箱是否已存在
    const existingUser = await UserService.getUserByEmail(userData.email);
    if (existingUser) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "邮箱已被注册"
      };
      return;
    }
    
    // 创建用户
    const user = await UserService.createUser(userData);
    
    // 生成token
    const token = await generateToken(user.id);
    
    // 返回用户信息（不包含密码和盐值）
    const { password: _, salt: __, ...userWithoutPassword } = user;
    
    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      message: "注册成功",
      data: {
        user: userWithoutPassword,
        token
      }
    };
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser(ctx: Context) {
  try {
    const userId = ctx.state.JWT_UID;
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "用户不存在"
      };
      return;
    }
    
    // 返回用户信息（不包含密码和盐值）
    const { password: _, salt: __, ...userWithoutPassword } = user;
    
    ctx.response.body = {
      success: true,
      data: userWithoutPassword
    };
  } catch (error) {
    throw error;
  }
}

// 锁屏功能
export async function lock(ctx: Context) {
  try {
    const userId = ctx.state.JWT_UID;
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "用户不存在"
      };
      return;
    }
    
    // 如果是POST请求，处理解锁
    if (ctx.request.method === "POST") {
      const { lock_password }: LockData = ctx.state.validatedBody;
      
      if (!lock_password) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "请输入登录密码解锁"
        };
        return;
      }
      
      // 验证密码
      const isValidPassword = await verifyPassword(lock_password, user.password!, user.salt!);
      if (!isValidPassword) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "密码错误"
        };
        return;
      }
      
      // 解锁用户
      await UserService.updateLockStatus(user.id, 0);
      
      ctx.response.body = {
        success: true,
        message: "解锁成功",
        data: { uid: user.id }
      };
    } else {
      // GET请求，锁定用户
      await UserService.updateLockStatus(user.id, 1);
      
      ctx.response.body = {
        success: true,
        message: "已锁定"
      };
    }
  } catch (error) {
    throw error;
  }
}

// 退出登录
export async function logout(ctx: Context) {
  try {
    // 这里可以添加token黑名单逻辑
    // 目前只返回成功消息
    ctx.response.body = {
      success: true,
      message: "退出成功"
    };
  } catch (error) {
    throw error;
  }
}