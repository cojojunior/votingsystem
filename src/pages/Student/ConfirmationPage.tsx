// src/pages/Student/ConfirmationPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import {
  CheckCircle,
  Mail,
  Calendar,
  Clock,
  FileCheck,
  Shield,
} from "lucide-react";

export const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      navigate("/dashboard");
    }
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="text-center">
          {/* Success Animation */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vote Submitted Successfully! 🎉
          </h1>
          <p className="text-gray-600 mb-8">
            Your vote has been recorded and counted. Thank you for participating
            in the UPSA Student Elections.
          </p>

          {/* Confirmation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="h-4 w-4 text-upsa-blue" />
                <span className="text-sm font-medium text-gray-700">
                  Vote ID
                </span>
              </div>
              <p className="text-sm text-gray-600">
                #VOT-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-upsa-blue" />
                <span className="text-sm font-medium text-gray-700">Date</span>
              </div>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-upsa-blue" />
                <span className="text-sm font-medium text-gray-700">Time</span>
              </div>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleTimeString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-upsa-blue" />
                <span className="text-sm font-medium text-gray-700">
                  Status
                </span>
              </div>
              <p className="text-sm text-green-600 font-medium">Verified</p>
            </div>
          </div>

          {/* Email Notification */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800">
                  Confirmation Email Sent
                </p>
                <p className="text-xs text-blue-600">
                  A confirmation email has been sent to your UPSA email address.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate("/results")}>
              View Results
            </Button>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            Redirecting to dashboard in {countdown} seconds...
          </p>
        </Card>
      </div>
    </div>
  );
};
