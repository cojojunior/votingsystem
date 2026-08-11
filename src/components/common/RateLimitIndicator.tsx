// src/components/common/RateLimitIndicator.tsx
import { useState, useEffect } from "react";

interface RateLimitIndicatorProps {
  attempts: number;
  maxAttempts: number;
  resetTime: number; // seconds
}

export const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({
  attempts,
  maxAttempts,
  resetTime,
}) => {
  const [timeLeft, setTimeLeft] = useState(resetTime);

  useEffect(() => {
    if (attempts >= maxAttempts) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [attempts, maxAttempts]);

  return (
    <div className="text-sm text-gray-600">
      {attempts >= maxAttempts ? (
        <span className="text-red-600">
          Too many attempts. Try again in {timeLeft}s
        </span>
      ) : (
        <span>{maxAttempts - attempts} attempts remaining</span>
      )}
    </div>
  );
};
