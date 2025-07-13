export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone?: string;
  age?: number;
}

export interface UpdateUserData extends Partial<CreateUserData> {}