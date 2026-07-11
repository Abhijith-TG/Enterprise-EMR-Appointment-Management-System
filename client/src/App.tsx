import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { UserRole } from "./types/index.js";
import { Login } from "./pages/Login.js";
import { DashboardLayout } from "./layouts/DashboardLayout.js";
import { DoctorsList } from "./pages/admin/DoctorsList.js";
import { ReceptionistsList } from "./pages/admin/ReceptionistsList.js";
import { Schedules } from "./pages/admin/Schedules.js";
import { AllAppointments } from "./pages/admin/AllAppointments.js";
import { Patients } from "./pages/receptionist/Patients.js";
import { Scheduler } from "./pages/receptionist/Scheduler.js";
import { Appointments } from "./pages/receptionist/Appointments.js";
import { DoctorAppointments } from "./pages/doctor/DoctorAppointments.js";
import { Loader } from "lucide-react";

// Route Guard for Authenticated Users
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Route Guard for specific Roles
const RoleRoute: React.FC<{ allowedRoles: UserRole[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Home Redirect Component
const HomeRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case UserRole.SUPER_ADMIN:
      return <Navigate to="/admin/doctors" replace />;
    case UserRole.RECEPTIONIST:
      return <Navigate to="/receptionist/scheduler" replace />;
    case UserRole.DOCTOR:
      return <Navigate to="/doctor/appointments" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* Index redirects to appropriate role dashboard */}
            <Route index element={<HomeRedirect />} />

            {/* Admin Routes */}
            <Route
              path="admin/doctors"
              element={
                <RoleRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <DoctorsList />
                </RoleRoute>
              }
            />
            <Route
              path="admin/receptionists"
              element={
                <RoleRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <ReceptionistsList />
                </RoleRoute>
              }
            />
            <Route
              path="admin/schedules"
              element={
                <RoleRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <Schedules />
                </RoleRoute>
              }
            />
            <Route
              path="admin/appointments"
              element={
                <RoleRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <AllAppointments />
                </RoleRoute>
              }
            />

            {/* Receptionist Routes */}
            <Route
              path="receptionist/patients"
              element={
                <RoleRoute allowedRoles={[UserRole.RECEPTIONIST]}>
                  <Patients />
                </RoleRoute>
              }
            />
            <Route
              path="receptionist/scheduler"
              element={
                <RoleRoute allowedRoles={[UserRole.RECEPTIONIST]}>
                  <Scheduler />
                </RoleRoute>
              }
            />
            <Route
              path="receptionist/appointments"
              element={
                <RoleRoute allowedRoles={[UserRole.RECEPTIONIST]}>
                  <Appointments />
                </RoleRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="doctor/appointments"
              element={
                <RoleRoute allowedRoles={[UserRole.DOCTOR]}>
                  <DoctorAppointments />
                </RoleRoute>
              }
            />
          </Route>

          {/* Fallback Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
