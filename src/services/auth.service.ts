// src/services/auth.service.ts
import { supabase } from "../api/client";
import {
  StudentAuth,
  LoginCredentials,
  OTPResponse,
} from "../types/auth.types";

export class AuthService {
  private static instance: AuthService;
  private rateLimitAttempts: Map<string, { count: number; timestamp: number }> =
    new Map();

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private checkRateLimit(
    key: string,
    limit: number,
    windowMs: number,
  ): boolean {
    const now = Date.now();
    const record = this.rateLimitAttempts.get(key);

    if (!record) {
      this.rateLimitAttempts.set(key, { count: 1, timestamp: now });
      return true;
    }

    if (now - record.timestamp > windowMs) {
      this.rateLimitAttempts.set(key, { count: 1, timestamp: now });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    this.rateLimitAttempts.set(key, record);
    return true;
  }

  async requestOTP(email: string): Promise<OTPResponse> {
    // Rate limiting: 5 attempts per 15 minutes
    if (!this.checkRateLimit(email, 5, 15 * 60 * 1000)) {
      throw new Error(
        "Rate limit exceeded. Please wait 15 minutes before trying again.",
      );
    }

    if (!this.validateUPSAEmail(email)) {
      throw new Error(
        "Invalid email. Please use your @upsamail.edu.gh address.",
      );
    }

    try {
      // Check if student exists
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id, email, student_id, is_eligible, has_voted")
        .eq("email", email)
        .single();

      if (studentError || !student) {
        throw new Error("Student not found. Please check your Student ID.");
      }

      if (student.has_voted) {
        throw new Error("You have already voted.");
      }

      if (!student.is_eligible) {
        throw new Error("You are not eligible to vote in this election.");
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Save OTP
      const { error: insertError } = await supabase
        .from("otp_requests")
        .insert({
          email: email,
          otp: otp,
          expires_at: expiresAt.toISOString(),
          student_id: student.id,
        });

      if (insertError) {
        console.error("OTP insert error:", insertError);
        throw new Error("Failed to save OTP. Please try again.");
      }

      // In production, send OTP via email
      console.log(`OTP for ${email}: ${otp}`);

      return {
        success: true,
        message: "OTP sent successfully to your email.",
        expiresIn: 600,
      };
    } catch (error: any) {
      console.error("OTP request error:", error);
      throw error;
    }
  }

  async verifyOTP(email: string, otp: string): Promise<any> {
    // Rate limiting: 10 attempts per 10 minutes
    if (!this.checkRateLimit(`${email}-verify`, 10, 10 * 60 * 1000)) {
      throw new Error(
        "Too many attempts. Please wait 10 minutes before trying again.",
      );
    }

    try {
      // Find valid OTP
      const { data, error } = await supabase
        .from("otp_requests")
        .select("*")
        .eq("email", email)
        .eq("otp", otp)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        throw new Error("Invalid or expired OTP.");
      }

      // Mark OTP as used
      await supabase
        .from("otp_requests")
        .update({ used: true })
        .eq("id", data.id);

      // Get student information
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, student_id, email, has_voted, is_admin")
        .eq("id", data.student_id)
        .single();

      if (studentError || !studentData) {
        throw new Error("Student not found.");
      }

      // Get session if exists
      let session = null;
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .contains("student_ids", [data.student_id])
        .eq("status", "active")
        .maybeSingle();

      if (!sessionError && sessionData) {
        session = sessionData;
      }

      return {
        success: true,
        session: session,
        student: {
          id: studentData.id,
          studentId: studentData.student_id,
          email: studentData.email,
          hasVoted: studentData.has_voted,
          isAdmin: studentData.is_admin,
        },
      };
    } catch (error: any) {
      console.error("OTP verification error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  private validateUPSAEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@upsamail\.edu\.gh$/;
    return regex.test(email) && !email.includes(" ");
  }
}

export default AuthService.getInstance();
