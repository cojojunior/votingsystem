// src/components/layout/Sidebar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  FileText,
  Shield,
  LogOut,
  Award,
  BarChart3,
  Settings,
  Home,
  Vote,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const { user, clearUser } = useAuthStore();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  // Student navigation items
  const studentNavItems = [
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

  const handleLogout = () => {
    clearUser();
    if (onClose) onClose();
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Determine which nav items to show
  let navItems = studentNavItems;
  if (isAdmin) {
    navItems = adminNavItems;
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-upsa-blue flex-shrink-0" />
            <div>
              <h1 className="text-lg font-bold text-upsa-blue">UPSA Voting</h1>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || "Student"}
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.email || "Guest"}
          </p>
          <p className="text-xs text-gray-500">
            {user?.studentId || "Not logged in"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {/* Main Navigation */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                      ${
                        active
                          ? "bg-upsa-blue text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }
                    `}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Super Admin items */}
            {isSuperAdmin && (
              <>
                <li className="pt-4 mt-4 border-t border-gray-200">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Super Admin
                  </p>
                </li>
                {superAdminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                          ${
                            active
                              ? "bg-red-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }
                        `}>
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
