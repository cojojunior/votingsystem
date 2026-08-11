// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { authAPI } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useRateLimit } from "./useRateLimit";

export const useAuth = () => {
  const { user, setUser, clearUser, isLoading, setIsLoading, setError } =
    useAuthStore();
  const [isOTPSent, setIsOTPSent] = useState(false);
  const rateLimit = useRateLimit("login");

  const requestOTP = async (email: string) => {
    if (rateLimit.isBlocked) {
      throw new Error(`Too many attempts. Please wait ${rateLimit.resetTime}s`);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.requestOTP(email);
      setIsOTPSent(true);
      rateLimit.recordAttempt();
      return response;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.verifyOTP(email, otp);
      if (response.success) {
        setUser({
          studentId: response.student.id,
          email: response.student.email,
          sessionId: response.session.id,
          votingStatus: "in_progress",
          role: "student",
        });
        return response;
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authAPI.logout();
    clearUser();
  };

  const checkAuth = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      if (user) {
        // Fetch student data
        const { data } = await supabase
          .from("students")
          .select("*")
          .eq("email", user.email)
          .single();

        if (data) {
          setUser({
            studentId: data.id,
            email: data.email,
            sessionId: data.session_id,
            votingStatus: data.has_voted ? "completed" : "not_started",
            role: data.is_admin ? "admin" : "student",
          });
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    isLoading,
    isOTPSent,
    requestOTP,
    verifyOTP,
    logout,
    checkAuth,
    rateLimit,
  };
};
