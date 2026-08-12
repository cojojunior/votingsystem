// src/routes/AppRoutes.tsx
import React, { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAuthStore } from "../store/authStore";

// Student Pages
const LandingPage = lazy(() => import("../pages/Student/LandingPage"));
const LoginPage = lazy(() => import("../pages/Student/LoginPage"));
const Dashboard = lazy(() => import("../pages/Student/Dashboard"));
const VotingPage = lazy(() => import("../pages/Student/VotingPage"));
const ConfirmationPage = lazy(
  () => import("../pages/Student/ConfirmationPage"),
);
const ResultsPage = lazy(() => import("../pages/Student/ResultsPage"));

// Admin Pages
const AdminLogin = lazy(() => import("../pages/Admin/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const CandidateManagement = lazy(
  () => import("../pages/Admin/CandidateManagement"),
);
const VoterManagement = lazy(() => import("../pages/Admin/VoterManagement"));
const SessionManagement = lazy(
  () => import("../pages/Admin/SessionManagement"),
);
const Reports = lazy(() => import("../pages/Admin/Reports"));
const AuditLog = lazy(() => import("../pages/Admin/AuditLog"));

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin && !["admin", "super_admin"].includes(user?.role || "")) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSuperAdmin && user?.role !== "super_admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

// Component to handle redirect based on auth status
const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense
        fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
        <Routes>
          {/* Public Routes - Redirect if already logged in */}
          <Route
            path="/"
            element={
              <AuthRedirect>
                <LandingPage />
              </AuthRedirect>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            }
          />
          <Route path="/results" element={<ResultsPage />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vote"
            element={
              <ProtectedRoute>
                <VotingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation"
            element={
              <ProtectedRoute>
                <ConfirmationPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <ProtectedRoute requireAdmin>
                <CandidateManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/voters"
            element={
              <ProtectedRoute requireAdmin>
                <VoterManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <ProtectedRoute requireAdmin>
                <SessionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requireAdmin>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute requireSuperAdmin>
                <AuditLog />
              </ProtectedRoute>
            }
          />

          {/* Fallback - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};


