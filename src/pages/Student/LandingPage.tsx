// src/pages/Student/LandingPage.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import {
  Shield,
  Users,
  Award,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: Shield,
      title: "Secure Voting",
      description:
        "Protected by OTP authentication and rate limiting for maximum security",
    },
    {
      icon: Users,
      title: "Student-Only Access",
      description:
        "Exclusively for UPSA students with valid @upsamail.edu addresses",
    },
    {
      icon: Clock,
      title: "Session-Based Voting",
      description:
        "Organized voting sessions to ensure smooth system performance",
    },
    {
      icon: CheckCircle,
      title: "One Vote Per Student",
      description:
        "Each student can vote only once to maintain election integrity",
    },
    {
      icon: Award,
      title: "Multiple Positions",
      description: "Vote for candidates across various leadership positions",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Updates",
      description: "Live voting statistics and progress tracking for admins",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url('/image.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}>
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Decorative pattern overlay */}
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center text-white">
            <div className="mb-6">
              {/* Logo */}
              <img
                src="/logo.svg"
                alt="UPSA Logo"
                className="h-24 w-24 mx-auto mb-4 drop-shadow-lg"
              />
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-shadow">
                UPSA Voting System
              </h1>
              <p className="text-xl md:text-2xl text-blue-200 max-w-3xl mx-auto text-shadow">
                University of Professional Studies, Accra
              </p>
            </div>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8 text-shadow">
              Secure, transparent, and efficient student elections. Cast your
              vote with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-upsa-blue hover:bg-blue-50 shadow-lg"
                onClick={() => navigate("/login")}>
                Get Started
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 shadow-lg"
                onClick={() => {
                  const featuresSection = document.getElementById("features");
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Voting System
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technology to ensure fair and secure
              elections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} hover>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-upsa-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-upsa-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-upsa-blue/5 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-upsa-blue">6,000+</div>
              <p className="text-gray-600 text-sm">Eligible Voters</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-upsa-blue">3</div>
              <p className="text-gray-600 text-sm">Voting Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-upsa-blue">99.9%</div>
              <p className="text-gray-600 text-sm">System Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-upsa-blue">30+</div>
              <p className="text-gray-600 text-sm">Leadership Positions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-upsa-blue text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm">
            {"\u00A9"} {new Date().getFullYear()} University of Professional
            Studies, Accra. All rights reserved.
          </p>
          <p className="text-blue-300 text-xs mt-2">
            Secure Voting System v2.0 | Powered by React {"&"} Supabase
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; // <-- Changed from named export to default export
