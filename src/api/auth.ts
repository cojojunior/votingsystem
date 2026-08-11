// src/api/auth.ts
import { supabase, rateLimiter } from "./client";
import { LoginCredentials, OTPResponse } from "../types/auth.types";
import { validateUPSAEmail } from "../utils/validators/emailValidator";

export const authAPI = {
  requestOTP: async (email: string): Promise<OTPResponse> => {
    if (!rateLimiter.check(5)) {
      throw new Error("Rate limit exceeded. Please wait before trying again.");
    }

    if (!validateUPSAEmail(email)) {
      throw new Error("Invalid email. Please use your @upsamail.edu address.");
    }

    // Check if student is eligible
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, email, is_eligible, has_voted")
      .eq("email", email)
      .single();

    if (studentError || !student) {
      throw new Error("Student not found or not eligible to vote.");
    }

    if (student.has_voted) {
      throw new Error("You have already voted.");
    }

    if (!student.is_eligible) {
      throw new Error("You are not eligible to vote in this election.");
    }

    // Generate and store OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await supabase.from("otp_requests").insert({
      email,
      otp,
      expires_at: expiresAt,
      student_id: student.id,
    });

    // In production, send OTP via email
    console.log(`OTP for ${email}: ${otp}`);

    return {
      success: true,
      message: "OTP sent successfully",
      expiresIn: 600,
    };
  },

  verifyOTP: async (email: string, otp: string) => {
    if (!rateLimiter.check(10)) {
      throw new Error("Too many attempts. Please wait.");
    }

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

    // Get student session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .contains("student_ids", [data.student_id])
      .eq("status", "active")
      .single();

    if (sessionError || !session) {
      throw new Error("No active voting session found for your account.");
    }

    return {
      success: true,
      session,
      student: {
        id: data.student_id,
        email: data.email,
      },
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },
};
