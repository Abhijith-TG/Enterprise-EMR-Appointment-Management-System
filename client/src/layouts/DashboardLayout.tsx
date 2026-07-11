import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { UserRole } from "../types/index.js";
import {
  Users,
  Calendar,
  Briefcase,
  LogOut,
  Menu,
  X,
  Activity,
  UserCheck,
  ClipboardList
} from "lucide-react";

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getNavLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return [
          { name: "Doctors", path: "/admin/doctors", icon: Users },
          { name: "Receptionists", path: "/admin/receptionists", icon: Briefcase },
          { name: "Schedules", path: "/admin/schedules", icon: Calendar },
          { name: "All Appointments", path: "/admin/appointments", icon: ClipboardList },
        ];
      case UserRole.RECEPTIONIST:
        return [
          { name: "Scheduler", path: "/receptionist/scheduler", icon: Calendar },
          { name: "Appointments", path: "/receptionist/appointments", icon: ClipboardList },
          { name: "Patients", path: "/receptionist/patients", icon: Users },
        ];
      case UserRole.DOCTOR:
        return [
          { name: "My Appointments", path: "/doctor/appointments", icon: ClipboardList },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-[#090d16] text-[#e2e8f0] overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0d1321] border-r border-[#1e293b] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1e293b] bg-[#0e1726]/40">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-400 animate-pulse" />
            <span className="font-semibold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              EMR Platform
            </span>
          </div>
          <button
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-l-4 border-indigo-500 text-indigo-300 bg-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#151f32]"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0e1726]/40">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {user?.firstName[0]?.toUpperCase()}
              {user?.lastName?.[0]?.toUpperCase() || ""}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <UserCheck className="h-3 w-3 text-indigo-400" />
                <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
                  {user?.role.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/50 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#1e293b] bg-[#0d1321]/60 backdrop-blur-md flex items-center justify-between px-6 lg:justify-end">
          <button
            className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="text-xs text-slate-400 bg-[#1e293b]/50 px-3 py-1.5 rounded-full border border-slate-700/50 hidden md:block">
            Logged in as: <strong className="text-indigo-400">{user?.email}</strong>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#090d16]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
