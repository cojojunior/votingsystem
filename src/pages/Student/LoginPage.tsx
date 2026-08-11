// src/pages/Student/LoginPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { validateUPSAEmail } from "../../utils/validators/emailValidator";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { requestOTP, verifyOTP, isLoading, rateLimit } = useAuth();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateUPSAEmail(email)) {
      setLocalError("Please enter a valid @upsamail.edu address");
      return;
    }

    try {
      await requestOTP(email);
      setShowOTPInput(true);
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

    try {
      await verifyOTP(email, otp);
      // Redirect to voting page
      window.location.href = "/vote";
    } catch (error: any) {
      setLocalError(error.message || "Invalid OTP. Please try again.");
    }
  };

  // Show loading spinner when authenticating
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-upsa-blue to-blue-900 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="text-white mt-4">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-upsa-blue to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            UPSA Voting System
          </h1>
          <p className="text-blue-200">
            University of Professional Studies, Accra
          </p>
        </div>

        <Card>
          {!showOTPInput ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="label text-gray-700">Student Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="StudentID@upsamail.edu"
                  className="input-field"
                  disabled={isLoading}
                  autoFocus
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use your official UPSA student email
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
                disabled={!email || rateLimit.isBlocked}>
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
                  OTP sent to {email}
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
                Back to Email
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center mt-6">
          <p className="text-blue-200 text-sm">
            ⚡ Secure voting system • One vote per student
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
