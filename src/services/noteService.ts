import { query } from "../database/connection.ts";
import { Note, CreateNoteData, UpdateNoteData } from "../types/note.ts";
import { PaginationQuery } from "../types/common.ts";
import dayjs from "https://esm.sh/dayjs@1.11.10";

export class NoteService {
  static async createNote(userData: CreateNoteData): Promise<Note> {
    // 转换时间字段格式
    const convertedData = this.convertTimeFields(userData);
    
    const sql = `
      INSERT INTO oa_note (cate_id, title, content, src, status, file_ids, role_type, role_dids, role_uids, start_time, end_time, admin_id, create_time, update_time, delete_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      convertedData.cate_id,
      convertedData.title,
      convertedData.content,
      convertedData.src,
      convertedData.status,
      convertedData.file_ids,
      convertedData.role_type,
      convertedData.role_dids,
      convertedData.role_uids,
      convertedData.start_time,
      convertedData.end_time,
      convertedData.admin_id,
      convertedData.create_time,
      convertedData.update_time,
      convertedData.delete_time
    ]) as any;
    
    return this.getNoteById(result.insertId);
  }
  
  // 添加时间格式化函数（输出时使用）
  private static formatTimeFields(data: any): any {
    if (!data) return data;
    
    const timeFields = ['created_at', 'updated_at', 'delete_time', 'create_time', 'update_time', 'start_time', 'end_time'];
    const formatted = { ...data };
    
    timeFields.forEach(field => {
      if (formatted[field] && typeof formatted[field] === 'number') {
        formatted[field] = dayjs(formatted[field] * 1000).format('YYYY-MM-DD HH:mm:ss');
      }
    });
    
    return formatted;
  }
  
  // 添加时间字段转换函数（输入时使用）
  private static convertTimeFields(data: any): any {
    if (!data) return data;
    
    const timeFields = ['created_at', 'updated_at', 'delete_time', 'create_time', 'update_time', 'start_time', 'end_time'];
    const converted = { ...data };
    
    timeFields.forEach(field => {
      if (converted[field] && typeof converted[field] === 'string') {
        // 将 yyyy-mm-dd hh:mm:ss 格式字符串转换为时间戳（秒）
        const timestamp = dayjs(converted[field]).unix();
        converted[field] = timestamp;
      }
    });
    
    return converted;
  }
  
  // 修改 getNoteById 方法
  static async getNoteById(id: number): Promise<Note | null> {
    const sql = "SELECT id, cate_id, title, content, src, status, file_ids, role_type, role_dids, role_uids, start_time, end_time, admin_id, create_time, update_time, delete_time FROM oa_note WHERE id = ?";
    const rows = await query(sql, [id]) as Note[];
    const result = rows[0] || null;
    return result ? this.formatTimeFields(result) : null;
  }
  
  // 修改 getNoteList 方法 - 支持通用查询
  static async getNoteList(queryParams: any) {
    const { page = 1, limit = 10, search, sortBy = 'id', sortOrder = 'DESC', ...filters } = queryParams;
    const offset = (page - 1) * limit;
    
    let sql = "SELECT id, cate_id, title, content, src, status, file_ids, role_type, role_dids, role_uids, start_time, end_time, admin_id, create_time, update_time, delete_time FROM oa_note";
    let countSql = "SELECT COUNT(*) as total FROM oa_note";
    const params: any[] = [];
    const conditions: string[] = [];
    
    // 处理搜索条件（模糊查询）
    if (search) {
      conditions.push("(title LIKE ? OR content LIKE ? OR src LIKE ? OR file_ids LIKE ? OR role_dids LIKE ? OR role_uids LIKE ?)");
      const searchValue = `%search%`;
      Array(6).fill(0).forEach(() => params.push(searchValue));
    }
    
    // 处理所有其他查询条件（通用查询）
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // 支持的查询字段白名单
        const allowedFields = ['id', 'cate_id', 'title', 'content', 'src', 'status', 'file_ids', 'role_type', 'role_dids', 'role_uids', 'start_time', 'end_time', 'admin_id', 'create_time', 'update_time', 'delete_time'];
        
        if (allowedFields.includes(key)) {
          // 对于时间字段，支持范围查询
          if (key.includes('_time') && typeof value === 'object') {
            if (value.start) {
              conditions.push(`${key} >= ?`);
              params.push(dayjs(value.start).unix());
            }
            if (value.end) {
              conditions.push(`${key} <= ?`);
              params.push(dayjs(value.end).unix());
            }
          } else if (['title', 'content', 'src', 'file_ids', 'role_dids', 'role_uids'].includes(key)) {
            // 对于文本字段，支持模糊查询
            conditions.push(`${key} LIKE ?`);
            params.push(`%${value}%`);
          } else {
            // 其他字段精确匹配
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        }
      }
    });
    
    // 添加WHERE子句
    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      sql += whereClause;
      countSql += whereClause;
    }
    
    // 添加排序
    sql += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const [data, countResult] = await Promise.all([
      query(sql, params) as Promise<Note[]>,
      query(countSql, params.slice(0, -2)) as Promise<any[]>
    ]);
    
    const total = countResult[0].total;
    
    return {
      data: {
        list: data.map(item => this.formatTimeFields(item)),
        total: total || 0,
        page,
        limit,
        totalPages: Math.ceil((total || 0) / limit)
      },
    };
  }
  
  static async updateNote(id: number, userData: UpdateNoteData): Promise<Note | null> {
    // 转换时间字段格式
    const convertedData = this.convertTimeFields(userData);
    
    // 过滤掉 undefined 值
    const filteredData = Object.fromEntries(
      Object.entries(convertedData).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredData).length === 0) {
      return this.getNoteById(id);
    }
    
    const fields = Object.keys(filteredData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(filteredData);
    
    const sql = `UPDATE oa_note SET ${fields} WHERE id = ?`;
    await query(sql, [...values, id]);
    
    return this.getNoteById(id);
  }
  
  static async deleteNote(id: number): Promise<boolean> {
    const sql = "DELETE FROM oa_note WHERE id = ?";
    const result = await query(sql, [id]) as any;
    return result.affectedRows > 0;
  }
}