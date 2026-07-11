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
  Stethoscope,
  UserCheck,
  ClipboardList,
  Shield
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
          { name: "Audit Logs", path: "/admin/auditlogs", icon: Shield },
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
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Pulse EMR
            </span>
          </div>
          <button
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-[#f8fafc]"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-inner">
              {user?.firstName[0]?.toUpperCase()}
              {user?.lastName?.[0]?.toUpperCase() || ""}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <UserCheck className="h-3 w-3 text-indigo-600" />
                <span className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase">
                  {user?.role.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 lg:justify-end z-10">
          <button
            className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="text-xs text-slate-600 bg-slate-100 border border-slate-200/50 px-3.5 py-1.5 rounded-full font-medium hidden md:block">
            Signed in as: <strong className="text-indigo-700">{user?.firstName} {user?.lastName}</strong>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
