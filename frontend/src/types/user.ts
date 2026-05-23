/** User entity returned from the API. */
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
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
