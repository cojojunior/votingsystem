// src/routes/AppRoutes.tsx
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAuthStore } from "../store/authStore";
import  Layout  from "../components/layout/Layout";

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
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !["admin", "super_admin"].includes(user?.role || "")) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSuperAdmin && user?.role !== "super_admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Suspense
        fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <Layout showSidebar={false}>
                <LandingPage />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout showSidebar={false}>
                <LoginPage />
              </Layout>
            }
          />
          <Route
            path="/results"
            element={
              <Layout>
                <ResultsPage />
              </Layout>
            }
          />

          {/* Admin Auth */}
          <Route
            path="/admin/login"
            element={
              <Layout showSidebar={false}>
                <AdminLogin />
              </Layout>
            }
          />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vote"
            element={
              <ProtectedRoute>
                <Layout>
                  <VotingPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation"
            element={
              <ProtectedRoute>
                <Layout>
                  <ConfirmationPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <Layout showSidebar={false}>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <ProtectedRoute requireAdmin>
                <Layout showSidebar={false}>
                  <CandidateManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/voters"
            element={
              <ProtectedRoute requireAdmin>
                <Layout showSidebar={false}>
                  <VoterManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <ProtectedRoute requireAdmin>
                <Layout showSidebar={false}>
                  <SessionManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requireAdmin>
                <Layout showSidebar={false}>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute requireSuperAdmin>
                <Layout showSidebar={false}>
                  <AuditLog />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
