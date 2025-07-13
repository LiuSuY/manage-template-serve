export const dbConfig = {
  host: Deno.env.get("DB_HOST") || "localhost",
  port: parseInt(Deno.env.get("DB_PORT") || "3306"),
  user: Deno.env.get("DB_USER") || "root",
  password: Deno.env.get("DB_PASSWORD") || "root",
  database: Deno.env.get("DB_NAME") || "oa",
  connectionLimit: 10
};