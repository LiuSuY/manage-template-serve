export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  mobile?: string;
  phone?: string;
  age?: number;
  password?: string;
  salt?: string;
  status: number; // 1: 正常, 0: 禁用
  is_lock: number; // 1: 锁定, 0: 未锁定
  login_num: number;
  last_login_time?: Date;
  last_login_ip?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  username?: string;
  email: string;
  mobile?: string;
  password: string;
  phone?: string;
  age?: number;
  status?: number;
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password'>> {
  password?: string;
  salt?: string;
  is_lock?: number;
  login_num?: number;
  last_login_time?: Date;
  last_login_ip?: string;
}

export interface LoginData {
  username: string; // 可以是用户名、邮箱或手机号
  password: string;
}

export interface LockData {
  lock_password: string;
}

export interface RegisterData {
  name: string;
  username?: string;
  email: string;
  mobile?: string;
  password: string;
  phone?: string;
  age?: number;
}

export interface AdminLog {
  id?: number;
  uid: number;
  type: string;
  action: string;
  subject: string;
  param_id: number;
  param: string;
  ip: string;
  create_time?: Date; // 改为可选
}