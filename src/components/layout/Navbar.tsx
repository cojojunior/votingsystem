// src/components/layout/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Home,
  Vote,
  BarChart3,
  ChevronDown,
  Bell,
  Settings,
  Users,
  Award,
  Clock,
  FileText,
  LayoutDashboard,
} from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAdminDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearUser();
    navigate("/login");
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMenuClick) onMenuClick();
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Navigation items for students
  const studentNavItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/vote", label: "Vote", icon: Vote },
    { path: "/results", label: "Results", icon: BarChart3 },
  ];

  // Admin navigation items
  const adminNavItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/candidates", label: "Candidates", icon: Award },
    { path: "/admin/voters", label: "Voters", icon: Users },
    { path: "/admin/sessions", label: "Sessions", icon: Clock },
    { path: "/admin/reports", label: "Reports", icon: BarChart3 },
  ];

  // Super Admin only items
  const superAdminNavItems = [
    { path: "/admin/audit", label: "Audit Log", icon: FileText },
  ];

  const getNavItems = () => {
    if (isAdmin) {
      return adminNavItems;
    }
    return studentNavItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-upsa-blue/10 p-1.5 rounded-lg group-hover:bg-upsa-blue/20 transition-colors">
                <Shield className="h-7 w-7 text-upsa-blue" />
              </div>
              <span className="text-xl font-bold text-upsa-blue hidden sm:block">
                UPSA Voting
              </span>
              <span className="text-xs font-medium text-gray-400 hidden lg:block">
                v2.0
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated && (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                        ${
                          active
                            ? "text-upsa-blue bg-upsa-blue/10"
                            : "text-gray-600 hover:text-upsa-blue hover:bg-gray-50"
                        }
                      `}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Super Admin dropdown */}
                {isSuperAdmin && (
                  <div className="relative" ref={adminDropdownRef}>
                    <button
                      onClick={() =>
                        setIsAdminDropdownOpen(!isAdminDropdownOpen)
                      }
                      className={`
                        flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all
                        ${
                          isAdminDropdownOpen || isActive("/admin/audit")
                            ? "text-red-600 bg-red-50"
                            : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                        }
                      `}>
                      <Shield className="h-4 w-4" />
                      <span>Super Admin</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isAdminDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isAdminDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        {superAdminNavItems.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.path);
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`
                                flex items-center gap-2 px-4 py-2 text-sm transition-colors
                                ${
                                  active
                                    ? "text-red-600 bg-red-50"
                                    : "text-gray-700 hover:bg-gray-50"
                                }
                              `}
                              onClick={() => setIsAdminDropdownOpen(false)}>
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            {isAuthenticated && (
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
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

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role || "Student"}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {user?.studentId}
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
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <Link
                      to="/vote"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}>
                      <Vote className="h-4 w-4" />
                      Vote
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-medium text-upsa-blue hover:bg-upsa-blue/10 rounded-lg transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-medium bg-upsa-blue text-white rounded-lg hover:bg-upsa-blue/90 transition-colors shadow-sm">
                    Get Started
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu">
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
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-all
                        ${
                          active
                            ? "text-upsa-blue bg-upsa-blue/10"
                            : "text-gray-600 hover:text-upsa-blue hover:bg-gray-50"
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {isSuperAdmin && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="px-3 py-1 text-xs font-semibold text-red-500 uppercase tracking-wider">
                      Super Admin
                    </p>
                    {superAdminNavItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-all
                            ${
                              active
                                ? "text-red-600 bg-red-50"
                                : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                            }
                          `}
                          onClick={() => setIsMobileMenuOpen(false)}>
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-upsa-blue bg-upsa-blue/10"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link
                  to="/results"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  <BarChart3 className="h-5 w-5" />
                  Results
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
