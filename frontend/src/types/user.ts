/** User entity returned from the API. */
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
  department: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload for login. */
export interface UserLogin {
  email: string;
  password: string;
}

/** Payload for registration. */
export interface UserRegister {
  email: string;
  password: string;
  full_name?: string;
}

/** Payload for admin registration. */
export interface AdminUserRegister extends UserRegister {
  admin_secret: string;
}

/** JWT token response from the API. */
export interface AuthToken {
  access_token: string;
  token_type: string;
}
