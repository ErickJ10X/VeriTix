import type { UserProfile } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  lastName: string
  phone: string
}

export interface AuthResponse {
  accessToken: string
  user: UserProfile
}

export interface RegisterResponse {
  message: string
}
