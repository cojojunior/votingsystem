// src/pages/Student/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  validateStudentId,
  buildStudentEmail,
  formatStudentId,
} from "../../utils/validators/emailValidator";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { requestOTP, verifyOTP, isLoading, rateLimit, user } = useAuth();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const formattedId = formatStudentId(studentId);

    if (!validateStudentId(formattedId)) {
      setLocalError("Please enter a valid numeric Student ID (e.g., 10309003)");
      return;
    }

    const fullEmail = buildStudentEmail(formattedId);

    try {
      await requestOTP(fullEmail);
      setShowOTPInput(true);
      setLocalError(null);
    } catch (error: any) {
      setLocalError(error.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (otp.length !== 6) {
      setLocalError("Please enter a valid 6-digit OTP");
      return;
    }

    const formattedId = formatStudentId(studentId);
    const fullEmail = buildStudentEmail(formattedId);

    try {
      const result = await verifyOTP(fullEmail, otp);
      if (result.success) {
        // Redirect to voting dashboard
        navigate("/dashboard");
      } else {
        setLocalError("OTP verification failed. Please try again.");
      }
    } catch (error: any) {
      setLocalError(error.message || "Invalid OTP. Please try again.");
    }
  };

  // Show loading spinner when authenticating
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{
          backgroundImage: `url('/images/bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="text-white mt-4">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/images/bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}>
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            UPSA Voting System
          </h1>
          <p className="text-blue-200 drop-shadow-lg">
            University of Professional Studies, Accra
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95">
          {!showOTPInput ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="label text-gray-700">Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setStudentId(value);
                  }}
                  placeholder="Enter your Student ID"
                  className="input-field"
                  disabled={isLoading}
                  autoFocus
                  inputMode="numeric"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter your numeric Student ID (e.g., 10309003)
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  📧 OTP will be sent to{" "}
                  {studentId
                    ? `${studentId}@upsamail.edu.gh`
                    : "your@upsamail.edu.gh"}
                </p>
              </div>

              {localError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {localError}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={!studentId || rateLimit.isBlocked}>
                {rateLimit.isBlocked
                  ? `Wait ${rateLimit.resetTime}s`
                  : "Send OTP"}
              </Button>

              {rateLimit.attempts > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  {rateLimit.remainingAttempts} attempts remaining
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="label text-gray-700">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="input-field text-center text-2xl tracking-widest"
                  disabled={isLoading}
                  autoFocus
                />
                <p className="mt-1 text-sm text-gray-500">
                  OTP sent to {buildStudentEmail(formatStudentId(studentId))}
                </p>
              </div>

              {localError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {localError}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={otp.length !== 6}>
                Verify OTP
              </Button>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowOTPInput(false);
                  setOtp("");
                  setLocalError(null);
                }}>
                Back to Student ID
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center mt-6">
          <p className="text-blue-200 text-sm drop-shadow-lg">
            ⚡ Secure voting system • One vote per student
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
