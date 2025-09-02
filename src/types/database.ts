// src/types/database.ts

export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar?: string;
  created_at: Date;
}

export interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  image: string;
  email_id: string;
  created_at: Date;
  updated_at: Date;
}