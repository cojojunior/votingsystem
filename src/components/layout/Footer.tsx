// src/components/layout/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-upsa-gold" />
              <span className="text-xl font-bold text-white">
                UPSA Voting System
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              University of Professional Studies, Accra - Secure and transparent
              student elections powered by modern technology.
            </p>
            <div className="flex items-center gap-4 mt-4">
              {/* Using Github SVG from public folder */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors">
                <img
                  src="/github.svg"
                  alt="GitHub"
                  className="h-5 w-5 invert brightness-0 hover:brightness-100 transition-all"
                />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/results"
                  className="hover:text-white transition-colors">
                  Results
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-upsa-gold" />
                <a
                  href="mailto:info@upsa.edu.gh"
                  className="hover:text-white transition-colors">
                  info@upsa.edu.gh
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-upsa-gold" />
                <a
                  href="tel:+233302123456"
                  className="hover:text-white transition-colors">
                  +233 30 212 3456
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-upsa-gold mt-1" />
                <span className="hover:text-white transition-colors">
                  University of Professional Studies, Accra
                  <br />
                  P.O. Box LG 149, Legon, Accra, Ghana
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
          <p>
            &copy; {currentYear} University of Professional Studies, Accra. All
            rights reserved.
          </p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/help" className="hover:text-white transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
