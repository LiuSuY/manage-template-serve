import { query } from "../database/connection.ts";
import { ${capitalizedModule}, Create${capitalizedModule}Data, Update${capitalizedModule}Data } from "../types/${module}.ts";
import { PaginationQuery } from "../types/common.ts";

export class ${capitalizedModule}Service {
  static async create${capitalizedModule}(userData: Create${capitalizedModule}Data): Promise<${capitalizedModule}> {
    const sql = `
      INSERT INTO ${table} (${insertFields})
      VALUES (${insertPlaceholders})
    `;
    
    const result = await query(sql, [
      ${insertParams}
    ]) as any;
    
    return this.get${capitalizedModule}ById(result.insertId);
  }
  
  static async get${capitalizedModule}ById(id: number): Promise<${capitalizedModule} | null> {
    const sql = "SELECT ${fieldNames} FROM ${table} WHERE id = ?";
    const rows = await query(sql, [id]) as ${capitalizedModule}[];
    return rows[0] || null;
  }
  
  static async get${capitalizedModule}List(queryParams: PaginationQuery) {
    const { page = 1, limit = 10, search } = queryParams;
    const offset = (page - 1) * limit;
    
    let sql = "SELECT ${fieldNames} FROM ${table}";
    let countSql = "SELECT COUNT(*) as total FROM ${table}";
    const params: any[] = [];
    
    if (search) {
      // 这里可以根据实际需要添加搜索条件
      sql += " WHERE name LIKE ?";
      countSql += " WHERE name LIKE ?";
      params.push(`%${search}%`);
    }
    
    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    
    const [data, countResult] = await Promise.all([
      query(sql, params) as Promise<${capitalizedModule}[]>,
      query(countSql, search ? [`%${search}%`] : []) as Promise<any[]>
    ]);
    
    const total = countResult[0].total;
    
    return {
      data:{
        list: data,
        total: total || 0,
      },
    };
  }
  
  static async update${capitalizedModule}(id: number, userData: Update${capitalizedModule}Data): Promise<${capitalizedModule} | null> {
    const fields = Object.keys(userData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(userData);
    
    const sql = `UPDATE ${table} SET ${fields} WHERE id = ?`;
    await query(sql, [...values, id]);
    
    return this.get${capitalizedModule}ById(id);
  }
  
  static async delete${capitalizedModule}(id: number): Promise<boolean> {
    const sql = "DELETE FROM ${table} WHERE id = ?";
    const result = await query(sql, [id]) as any;
    return result.affectedRows > 0;
  }
}