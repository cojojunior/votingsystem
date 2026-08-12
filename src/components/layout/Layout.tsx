// src/components/layout/Layout.tsx
import React, { useState } from "react";
import { Navbar } from "./Navbar"; // Import Navbar instead of Header
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../../store/authStore";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const { isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const shouldShowSidebar = showSidebar && isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />

      <div className="flex flex-1 relative">
        {shouldShowSidebar && (
          <>
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={closeSidebar}
              />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <button
              onClick={toggleSidebar}
              className="lg:hidden fixed bottom-4 right-4 z-20 p-3 bg-upsa-blue text-white rounded-full shadow-lg hover:bg-upsa-blue/90 transition-colors">
              <Menu className="h-6 w-6" />
            </button>
          </>
        )}

        <main
          className={`
            flex-1 transition-all duration-300
            ${shouldShowSidebar ? "lg:ml-64" : ""}
          `}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
