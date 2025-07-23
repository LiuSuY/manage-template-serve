import { query } from "../database/connection.ts";
import { Note, CreateNoteData, UpdateNoteData } from "../types/note.ts";
import { PaginationQuery } from "../types/common.ts";

export class NoteService {
  static async createNote(userData: CreateNoteData): Promise<Note> {
    const sql = `
      INSERT INTO oa_note (cate_id, title, content, src, status, file_ids, role_type, role_dids, role_uids, start_time, end_time, admin_id, delete_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      userData.delete_time
    ]) as any;
    
    return this.getNoteById(result.insertId);
  }
  
  static async getNoteById(id: number): Promise<Note | null> {
    const sql = "SELECT id, cate_id, title, content, src, status, file_ids, role_type, role_dids, role_uids, start_time, end_time, admin_id, delete_time FROM oa_note WHERE id = ?";
    const rows = await query(sql, [id]) as Note[];
    return rows[0] || null;
  }
  
  static async getNoteList(queryParams: PaginationQuery) {
    const { page = 1, limit = 10, search } = queryParams;
    const offset = (page - 1) * limit;
    
    let sql = "SELECT id, cate_id, title, content, src, status, file_ids, role_type, role_dids, role_uids, start_time, end_time, admin_id, delete_time FROM oa_note";
    let countSql = "SELECT COUNT(*) as total FROM oa_note";
    const params: any[] = [];
    
    if (search) {
      // 这里可以根据实际需要添加搜索条件
      sql += " WHERE name LIKE ?";
      countSql += " WHERE name LIKE ?";
      params.push(`%search%`);
    }
    
    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    
    const [data, countResult] = await Promise.all([
      query(sql, params) as Promise<Note[]>,
      query(countSql, search ? [`%search%`] : []) as Promise<any[]>
    ]);
    
    const total = countResult[0].total;
    
    return {
      data:{
        list: data,
        total: total || 0,
      },
    };
  }
  
  static async updateNote(id: number, userData: UpdateNoteData): Promise<Note | null> {
    const fields = Object.keys(userData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(userData);
    
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