// src/components/layout/Header.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../common/Button";
import {
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Home,
  Vote,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    navigate("/login");
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMenuClick) onMenuClick();
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: Vote },
    { path: "/results", label: "Results", icon: BarChart3 },
  ];

  // Admin nav items (only visible to admins)
  const adminNavItems = [
    { path: "/admin/dashboard", label: "Admin Dashboard", icon: Shield },
  ];

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-upsa-blue" />
              <span className="text-xl font-bold text-upsa-blue hidden sm:block">
                UPSA Voting
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="text-gray-600 hover:text-upsa-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      <span className="flex items-center gap-1">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="text-upsa-blue hover:text-upsa-blue/80 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-upsa-blue/10">
                    <span className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Admin
                    </span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications (optional) */}
            {isAuthenticated && (
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-upsa-blue transition-colors">
                  <div className="w-8 h-8 bg-upsa-blue/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-upsa-blue" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.email?.split("@")[0] || "User"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role || "Student"}
                      </p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}>
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}>
                      <Vote className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Login
                  </Button>
                </Link>
                {user?.role === "admin" || user?.role === "super_admin" ? (
                  <Link to="/admin/dashboard">
                    <Button variant="secondary" size="sm">
                      Admin
                    </Button>
                  </Link>
                ) : null}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated && (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-upsa-blue hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-upsa-blue bg-upsa-blue/10 hover:bg-upsa-blue/20"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    <Shield className="h-5 w-5" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-upsa-blue bg-upsa-blue/10"
                onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
