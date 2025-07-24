import { query } from "../database/connection.ts";
import { Note, CreateNoteData, UpdateNoteData } from "../types/note.ts";
import { PaginationQuery } from "../types/common.ts";

export class NoteService {
  static async createNote(userData: CreateNoteData): Promise<Note> {
    const sql = `
      INSERT INTO oa_note (cate_id, title, content, src, status, file_ids, role_type, role_dids, role_uids, start_time, end_time, admin_id, create_time, update_time, delete_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      userData.cate_id,
      userData.title,
      userData.content,
      userData.src,
      userData.status,
      userData.file_ids,
      userData.role_type,
      userData.role_dids,
      userData.role_uids,
      userData.start_time,
      userData.end_time,
      userData.admin_id,
      userData.create_time,
      userData.update_time,
      userData.delete_time
    ]) as any;
    
    return this.getNoteById(result.insertId);
  }
  
  static async getNoteById(id: number): Promise<Note | null> {
    const sql = "SELECT id, cate_id, title, content, src, status, file_ids, role_type, role_dids, role_uids, start_time, end_time, admin_id, create_time, update_time, delete_time FROM oa_note WHERE id = ?";
    const rows = await query(sql, [id]) as Note[];
    return rows[0] || null;
  }
  
  static async getNoteList(queryParams: any) {
    const { page = 1, limit = 10, search, filters = {}, sortBy = 'id', sortOrder = 'DESC' } = queryParams;
    const offset = (page - 1) * limit;
    
    let sql = "SELECT id, cate_id, title, content, src, status, file_ids, role_type, role_dids, role_uids, start_time, end_time, admin_id, create_time, update_time, delete_time FROM oa_note";
    let countSql = "SELECT COUNT(*) as total FROM oa_note";
    const params: any[] = [];
    const conditions: string[] = [];
    
    // 处理搜索条件
    if (search) {
      conditions.push("(title LIKE ? OR content LIKE ? OR src LIKE ? OR file_ids LIKE ? OR role_dids LIKE ? OR role_uids LIKE ?)");
      const searchValue = `%search%`;
      // 为每个搜索字段添加参数
      Array(6).fill(0).forEach(() => params.push(searchValue));
    }
    
    // 处理过滤条件
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        conditions.push(`${key} = ?`);
        params.push(value);
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
        list: data,
        total: total || 0,
        page,
        limit,
        totalPages: Math.ceil((total || 0) / limit)
      },
    };
  }
  
  static async updateNote(id: number, userData: UpdateNoteData): Promise<Note | null> {
    // 过滤掉 undefined 值
    const filteredData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
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