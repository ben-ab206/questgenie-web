export interface User {
  id: string
  email: string
  name: string
  phone_number?: string
  is_active: boolean
}

export interface AuthState {
  user: User | null
  loading: boolean
}

export interface LoginData {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  name: string
}