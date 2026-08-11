// src/types/auth.types.ts
export interface StudentAuth {
  studentId: string;
  email: string;
  sessionId: string;
  votingStatus: "not_started" | "in_progress" | "completed";
  role: "student" | "admin" | "super_admin";
}

export interface LoginCredentials {
  email: string;
  otp?: string;
}

export interface AuthState {
  user: StudentAuth | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}
