import { Context, Next } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { encode as base64Encode, decode as base64Decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

interface JWTPayload {
  data: {
    userid: number;
  };
  exp: number;
  iat: number;
}

// Manual JWT creation
export async function generateToken(userId: number): Promise<string> {
  if (!userId || typeof userId !== "number") {
    throw new Error("Invalid userId provided");
  }

  const secret = "gouguoa";
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    data: {
      userid: userId,
    },
    exp: now + (60 * 60 * 24 * 7), // 7 days
    iat: now,
  };

  try {
    const headerB64 = base64Encode(JSON.stringify(header)).replace(/=/g, '');
    const payloadB64 = base64Encode(JSON.stringify(payload)).replace(/=/g, '');
    const data = `${headerB64}.${payloadB64}`;
    
    // Create HMAC-SHA256 signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    const signatureB64 = base64Encode(new Uint8Array(signature)).replace(/=/g, '');
    
    return `${data}.${signatureB64}`;
  } catch (error) {
    console.error("JWT creation failed:", error);
    throw new Error(`Failed to generate token: ${error.message}`);
  }
}

// Manual JWT verification
export async function verifyToken(token: string): Promise<JWTPayload> {
  const secret = "gouguoa";
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
  
  // Verify signature
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  
  const signature = base64Decode(signatureB64 + '==');
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    new TextEncoder().encode(data)
  );
  
  if (!isValid) {
    throw new Error("Invalid signature");
  }
  
  const payload = JSON.parse(new TextDecoder().decode(base64Decode(payloadB64 + '==')));
  
  // Check expiration
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }
  
  return payload;
}

export async function authMiddleware(ctx: Context, next: Next) {
  const token = ctx.request.headers.get("Token");
  
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { code: 401, msg: "token不能为空" };
    return;
  }

  try {
    const payload = await verifyToken(token);
    const userId = payload.data.userid;
    ctx.state.JWT_UID = userId;
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { code: 401, msg: "非法请求" };
  }
}
