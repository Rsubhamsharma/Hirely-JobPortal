import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <span className="text-2xl font-brand font-bold tracking-brand text-white">
                Hire<span className="text-green-500">ly</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Connecting ambition with opportunity. Find your dream job or the perfect candidate with our premium recruitment platform. Secure, fast, and trusted by thousands.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/employee/jobs" className="hover:text-blue-400 transition-colors">Find Jobs</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Contact</h4>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-start gap-3">
                <span>📧</span>
                <a href="mailto:support@jobportal.com" className="hover:text-white transition-colors">support@jobportal.com</a>
              </li>
              <li className="flex items-start gap-3">
                <span>📞</span>
                <span>+91 123 456 7890</span>
              </li>
              <li className="flex items-start gap-3">
                <span>📍</span>
                <span>123 Tech Park, Innovation City, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Hirely. All Rights Reserved.
          </p>

          <div className="flex space-x-6">
            <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
