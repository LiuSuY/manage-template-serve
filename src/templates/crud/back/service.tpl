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
  
  static async get${capitalizedModule}List(queryParams: any) {
    const { page = 1, limit = 10, search, filters = {}, sortBy = 'id', sortOrder = 'DESC' } = queryParams;
    const offset = (page - 1) * limit;
    
    let sql = "SELECT ${fieldNames} FROM ${table}";
    let countSql = "SELECT COUNT(*) as total FROM ${table}";
    const params: any[] = [];
    const conditions: string[] = [];
    
    // 处理搜索条件
    if (search) {
      conditions.push("(${searchFields})");
      const searchValue = `%${search}%`;
      // 为每个搜索字段添加参数
      Array(${searchFieldsCount}).fill(0).forEach(() => params.push(searchValue));
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
      query(sql, params) as Promise<${capitalizedModule}[]>,
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
  
  static async update${capitalizedModule}(id: number, userData: Update${capitalizedModule}Data): Promise<${capitalizedModule} | null> {
    // 过滤掉 undefined 值
    const filteredData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredData).length === 0) {
      return this.get${capitalizedModule}ById(id);
    }
    
    const fields = Object.keys(filteredData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(filteredData);
    
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