export interface User {
  username: string;
  email: string;
  password?: string;
  roles?: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  roles: any[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}