import { query } from "../database/connection.ts";
import { User, CreateUserData, UpdateUserData } from "../types/user.ts";
import { PaginationQuery } from "../types/common.ts";

export class UserService {
  static async createUser(userData: CreateUserData): Promise<User> {
    const sql = `
      INSERT INTO users (name, email, phone, age, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await query(sql, [
      userData.name,
      userData.email,
      userData.phone,
      userData.age
    ]) as any;
    
    return this.getUserById(result.insertId);
  }
  
  static async getUserById(id: number): Promise<User | null> {
    const sql = "SELECT * FROM users WHERE id = ?";
    const rows = await query(sql, [id]) as User[];
    return rows[0] || null;
  }
  
  static async getUsers(queryParams: PaginationQuery) {
    const { page = 1, limit = 10, search } = queryParams;
    const offset = (page - 1) * limit;
    
    let sql = "SELECT * FROM oa_step";
    let countSql = "SELECT COUNT(*) as total FROM oa_step";
    const params: any[] = [];
    
    if (search) {
      sql += " WHERE name LIKE ? OR email LIKE ?";
      countSql += " WHERE name LIKE ? OR email LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    
    const [users, countResult] = await Promise.all([
      query(sql, params) as Promise<User[]>,
      query(countSql, search ? [`%${search}%`, `%${search}%`] : []) as Promise<any[]>
    ]);
    
    const total = countResult[0].total;
    
    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  static async updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
    const fields = Object.keys(userData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(userData);
    
    const sql = `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`;
    await query(sql, [...values, id]);
    
    return this.getUserById(id);
  }
  
  static async deleteUser(id: number): Promise<boolean> {
    const sql = "DELETE FROM users WHERE id = ?";
    const result = await query(sql, [id]) as any;
    return result.affectedRows > 0;
  }
}