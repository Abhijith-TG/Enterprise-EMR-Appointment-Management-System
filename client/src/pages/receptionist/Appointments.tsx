import React, { useState, useEffect } from "react";
import { appointmentService } from "../../services/appointment.service.js";
import { doctorService } from "../../services/doctor.service.js";
import { type Appointment, type Doctor, AppointmentStatus } from "../../types/index.js";
import { Loader, ChevronLeft, ChevronRight, Check, X, UserCheck } from "lucide-react";

export const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [page, selectedDoctorId, selectedStatus, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctors", err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        status: selectedStatus || undefined,
        doctorId: selectedDoctorId || undefined,
        date: selectedDate || undefined,
      };
      const response = await appointmentService.listAppointments(params);
      setAppointments(response.data);
      if (response.meta) {
        setTotalPages(response.meta.totalPages || 1);
        setTotalItems(response.meta.total || 0);
      }
    } catch (err) {
      console.error("Error fetching appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId: string, status: AppointmentStatus) => {
    setStatusUpdateLoading(apptId);
    try {
      await appointmentService.updateStatus(apptId, status);
      // Refresh list
      fetchAppointments();
    } catch (err) {
      console.error("Error updating appointment status", err);
      alert("Error updating appointment status. Please try again.");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleClearFilters = () => {
    setSelectedDoctorId("");
    setSelectedStatus("");
    setSelectedDate("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white m-0">Appointment Flow</h1>
        <p className="text-slate-400 text-sm mt-1">Manage check-ins, arrivals, and patient workflow status</p>
      </div>

      {/* Filter bar */}
      <div className="bg-[#0d1321] border border-[#1e293b] rounded-xl p-4 shadow-xl flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Doctor</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => {
              setSelectedDoctorId(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Doctors</option>
            {doctors.map((d) => {
              const u = d.user && typeof d.user !== "string" ? d.user : null;
              return (
                <option key={d._id} value={d._id}>
                  Dr. {u?.firstName} {u?.lastName} ({d.specialization})
                </option>
              );
            })}
          </select>
        </div>

        <div className="w-[180px]">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            {Object.values(AppointmentStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[180px]">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl border border-slate-700/50"
        >
          Clear
        </button>
      </div>

      {/* Appointment table */}
      <div className="bg-[#0d1321] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#141d30]/60">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Date & Slot</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Patient</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Doctor</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Workflow Transitions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                      No appointments scheduled.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => {
                    const docUser = appt.doctor?.user && typeof appt.doctor.user !== "string" ? appt.doctor.user : null;
                    const dateFormatted = new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    const isUpdating = statusUpdateLoading === appt._id;

                    return (
                      <tr key={appt._id} className="hover:bg-[#121a2b]/40 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          <div>{dateFormatted}</div>
                          <div className="text-xs text-indigo-400 font-semibold mt-0.5">{appt.slotTime}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-white font-medium">
                            {appt.patient?.firstName} {appt.patient?.lastName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {appt.patient?.patientId}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {docUser ? `Dr. ${docUser.firstName} ${docUser.lastName}` : "N/A"}
                          <div className="text-xs text-slate-500 mt-0.5">{appt.department?.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${appt.status === AppointmentStatus.SCHEDULED
                              ? "bg-blue-500/10 text-blue-400"
                              : appt.status === AppointmentStatus.ARRIVED
                                ? "bg-amber-500/10 text-amber-400"
                                : appt.status === AppointmentStatus.COMPLETED
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {isUpdating ? (
                            <Loader className="h-5 w-5 text-indigo-500 animate-spin" />
                          ) : (
                            <div className="flex gap-2">
                              {appt.status === AppointmentStatus.SCHEDULED && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, AppointmentStatus.ARRIVED)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg transition"
                                  >
                                    <UserCheck className="h-3.5 w-3.5" />
                                    Arrived
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, AppointmentStatus.CANCELLED)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg transition"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Cancel
                                  </button>
                                </>
                              )}

                              {appt.status === AppointmentStatus.ARRIVED && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, AppointmentStatus.COMPLETED)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg transition"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, AppointmentStatus.CANCELLED)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg transition"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Cancel
                                  </button>
                                </>
                              )}

                              {(appt.status === AppointmentStatus.COMPLETED ||
                                appt.status === AppointmentStatus.CANCELLED) && (
                                  <span className="text-xs text-slate-500 font-medium">Terminal state reached</span>
                                )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-[#1e293b] flex items-center justify-between bg-[#0e1627]/40">
                <span className="text-xs text-slate-500">
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalItems} items)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
