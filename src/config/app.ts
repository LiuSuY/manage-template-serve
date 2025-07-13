export const config = {
  port: parseInt(Deno.env.get("PORT") || "8000"),
  env: Deno.env.get("NODE_ENV") || "development",
  cors: {
    origin: Deno.env.get("CORS_ORIGIN") || "*",
    credentials: true
  }
};