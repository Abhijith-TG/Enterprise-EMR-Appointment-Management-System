import React, { useState, useEffect } from "react";
import { appointmentService } from "../../services/appointment.service.js";
import { doctorService } from "../../services/doctor.service.js";
import { type Appointment, type Doctor, AppointmentStatus } from "../../types/index.js";
import { Loader, ChevronLeft, ChevronRight, X, UserCheck, Edit3, ClipboardList } from "lucide-react";

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

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedApptNotes, setSelectedApptNotes] = useState<{ purpose: string; notes: string } | null>(null);

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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Appointment Flow</h1>
        <p className="text-slate-500 text-sm mt-1">Manage check-ins, arrivals, and patient workflow status</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Doctor</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => {
              setSelectedDoctorId(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
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
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
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
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl border border-slate-200"
        >
          Clear
        </button>
      </div>

      {/* Appointment table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date & Slot</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Patient</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Doctor</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Workflow Transitions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
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
                      <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          <div>{dateFormatted}</div>
                          <div className="text-xs text-indigo-600 font-semibold mt-0.5">{appt.slotTime}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-slate-900 font-semibold">
                            {appt.patient?.firstName} {appt.patient?.lastName}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">ID: {appt.patient?.patientId}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {docUser ? `Dr. ${docUser.firstName} ${docUser.lastName}` : "N/A"}
                          <div className="text-xs text-slate-400 mt-0.5">{appt.department?.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${appt.status === AppointmentStatus.SCHEDULED
                              ? "bg-blue-50 text-blue-700"
                              : appt.status === AppointmentStatus.ARRIVED
                                ? "bg-amber-50 text-amber-700"
                                : appt.status === AppointmentStatus.COMPLETED
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {isUpdating ? (
                            <Loader className="h-5 w-5 text-indigo-500 animate-spin" />
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              {appt.status !== AppointmentStatus.CANCELLED && (
                                <button
                                  onClick={() => {
                                    setSelectedApptNotes({
                                      purpose: appt.purpose || "General medical consultation",
                                      notes: appt.notes || "No clinical notes recorded yet."
                                    });
                                    setNotesModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  Notes
                                </button>
                              )}
                              {appt.status === AppointmentStatus.SCHEDULED && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, AppointmentStatus.ARRIVED)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 transition"
                                  >
                                    <UserCheck className="h-3.5 w-3.5" />
                                    Arrived
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, AppointmentStatus.CANCELLED)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Cancel
                                  </button>
                                </>
                              )}

                              {appt.status === AppointmentStatus.ARRIVED && (
                                <>

                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, AppointmentStatus.CANCELLED)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition"
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
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs text-slate-500">
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalItems} items)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Notes Modal */}
      {notesModalOpen && selectedApptNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-indigo-600" />
                Consultation File
              </h3>
              <button onClick={() => setNotesModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Purpose of Visit:</span>
                <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedApptNotes.purpose}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Clinical Notes:</span>
                <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap min-h-[100px]">
                  {selectedApptNotes.notes}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setNotesModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
