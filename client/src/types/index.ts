export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  RECEPTIONIST: "RECEPTIONIST",
  DOCTOR: "DOCTOR",
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const AppointmentStatus = {
  SCHEDULED: "Scheduled",
  ARRIVED: "Arrived",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;
export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export interface User {
  id: string;
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Patient {
  _id: string;
  patientId: string;
  firstName: string;
  lastName?: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  mobile: string;
  email?: string;
  address?: string;
  primaryContactName?: string;
  primaryContactNumber?: string;
  relationship?: string;
  createdAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Doctor {
  _id: string;
  user: User | string;
  department: Department | string;
  specialization: string;
  consultationFee: number;
  createdAt?: string;
}

export interface Session {
  startTime: string;
  endTime: string;
  _id?: string;
}

export interface DoctorSchedule {
  _id: string;
  doctor: string;
  workingDays: string[];
  sessions: Session[];
  slotDuration: number;
}

export interface Appointment {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  department: Department;
  appointmentDate: string;
  slotTime: string;
  purpose: string;
  notes: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  user: User;
  role: UserRole;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
}
