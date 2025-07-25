import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

// 生成随机盐值
export function generateSalt(num: number = 10): string {
  const str = 'qwertyuiopasdfghjklzxcvbnm1234567890';
  const shuffled = str.split('').sort(() => Math.random() - 0.5).join('');
  return shuffled.substr(10, num);
}

// MD5加密函数
async function md5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 设置密码
export async function setPassword(pwd: string, salt: string): Promise<string> {
  const firstMd5 = await md5(pwd + salt);
  const finalMd5 = await md5(firstMd5 + salt);
  return finalMd5;
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string, salt: string): Promise<boolean> {
  const computedHash = await setPassword(password, salt);
  return computedHash === hashedPassword;
}