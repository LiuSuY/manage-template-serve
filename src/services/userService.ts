import { query } from "../database/connection.ts";
import { User, CreateUserData, AdminLog } from "../types/user.ts";
import { generateSalt, setPassword } from "../utils/password.ts";

export class UserService {
  // 创建用户（注册功能）
  static async createUser(userData: CreateUserData): Promise<User> {
    const salt = generateSalt();
    const hashedPassword = await setPassword(userData.password, salt);
    
    const sql = `
      INSERT INTO oa_admin (name, username, email, mobile, password, salt, phone, age, status, is_lock, login_num, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await query(sql, [
      userData.name,
      userData.username || null,
      userData.email,
      userData.mobile || null,
      hashedPassword,
      salt,
      userData.phone || null,
      userData.age || null,
      userData.status || 1,
      0, // is_lock
      0  // login_num
    ]) as any;
    
    return this.getUserById(result.insertId);
  }
  
  // 根据ID获取用户
  static async getUserById(id: number): Promise<User | null> {
    const sql = "SELECT * FROM oa_admin WHERE id = ?";
    const rows = await query(sql, [id]) as User[];
    return rows[0] || null;
  }

  // 根据用户名、邮箱或手机号查找用户（登录功能）
  static async getUserByUsernameOrEmail(username: string): Promise<User | null> {
    // 首先尝试用户名
    let sql = "SELECT * FROM oa_admin WHERE username = ?";
    let rows = await query(sql, [username]) as User[];
    
    if (rows.length > 0) {
      return rows[0];
    }
    
    // 然后尝试邮箱
    sql = "SELECT * FROM oa_admin WHERE email = ?";
    rows = await query(sql, [username]) as User[];
    
    if (rows.length > 0) {
      return rows[0];
    }
    
    // 最后尝试手机号
    sql = "SELECT * FROM oa_admin WHERE mobile = ?";
    rows = await query(sql, [username]) as User[];
    
    return rows[0] || null;
  }

  // 更新登录信息
  static async updateLoginInfo(userId: number, ip: string): Promise<void> {
    const sql = `
      UPDATE oa_admin 
      SET is_lock = 0, last_login_time = NOW(), last_login_ip = ?, login_num = login_num + 1, updated_at = NOW()
      WHERE id = ?
    `;
    await query(sql, [ip, userId]);
  }

  // 锁定/解锁用户
  static async updateLockStatus(userId: number, isLock: number): Promise<void> {
    const sql = "UPDATE oa_admin SET is_lock = ?, updated_at = NOW() WHERE id = ?";
    await query(sql, [isLock, userId]);
  }

  // 记录管理员日志
  static async createAdminLog(logData: AdminLog): Promise<void> {
    const sql = `
      INSERT INTO oa_admin_log (uid, type, action, subject, param_id, param, ip, create_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await query(sql, [
      logData.uid,
      logData.type,
      logData.action,
      logData.subject,
      logData.param_id,
      logData.param,
      logData.ip,
      new Date() // 或者 logData.create_time
    ]);
  }
}
