export const config = {
  port: parseInt(Deno.env.get("PORT") || "8000"),
  env: Deno.env.get("NODE_ENV") || "development",
  cors: {
    origin: Deno.env.get("CORS_ORIGIN") || "*",
    credentials: true
  }
};

export async function getSystemConfig(key: string): Promise<any> {
  // 这里需要根据实际情况实现配置获取逻辑
  // 可能从环境变量、配置文件或数据库中获取
  const config = {
    token: {
      secrect: Deno.env.get("JWT_SECRET") || "your-secret-key"
    }
  };
  return config[key];
}