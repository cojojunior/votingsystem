// src/hooks/useRateLimit.ts
import { useState, useEffect } from "react";

export const useRateLimit = (action: "login" | "otp" | "vote") => {
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [resetTime, setResetTime] = useState(0);

  const getLimits = () => {
    switch (action) {
      case "login":
        return { max: 5, window: 15 };
      case "otp":
        return { max: 3, window: 10 };
      case "vote":
        return { max: 1, window: 0 };
      default:
        return { max: 10, window: 5 };
    }
  };

  const { max: maxAttempts, window: timeWindow } = getLimits();

  const recordAttempt = () => {
    if (isBlocked) return false;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts && timeWindow > 0) {
      setIsBlocked(true);
      setResetTime(timeWindow * 60);
    }

    return true;
  };

  const reset = () => {
    setAttempts(0);
    setIsBlocked(false);
    setResetTime(0);
  };

  useEffect(() => {
    if (isBlocked && resetTime > 0) {
      const interval = setInterval(() => {
        setResetTime((prev) => {
          if (prev <= 1) {
            reset();
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBlocked]);

  return {
    attempts,
    maxAttempts,
    isBlocked,
    resetTime,
    recordAttempt,
    reset,
    remainingAttempts: maxAttempts - attempts,
  };
};
