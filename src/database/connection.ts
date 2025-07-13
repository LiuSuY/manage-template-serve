import mysql from "mysql2/promise";
import { dbConfig } from "../config/database.ts";

let pool: mysql.Pool;

export function createPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function getConnection() {
  const pool = createPool();
  return await pool.getConnection();
}

export async function query(sql: string, params?: any[]) {
  const pool = createPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export { pool };