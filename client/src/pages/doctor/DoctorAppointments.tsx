import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.js";
import { appointmentService } from "../../services/appointment.service.js";
import { doctorService } from "../../services/doctor.service.js";
import type { Appointment } from "../../types/index.js";
import { AppointmentStatus } from "../../types/index.js";
import { Loader, Calendar, Edit3, ClipboardList, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export const DoctorAppointments: React.FC = () => {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);

  // Notes Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState("");
  const [purpose, setPurpose] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      resolveDoctorProfile();
    }
  }, [user]);

  const resolveDoctorProfile = async () => {
    setLoading(true);
    try {
      const doctorsList = await doctorService.getDoctors();
      // Match doctor user.id with current logged in user.id
      const matchedDoc = doctorsList.find((d: any) => {
        const uId = d.user && typeof d.user !== "string" ? d.user._id : d.user;
        return uId === user?.id;
      });

      if (matchedDoc) {
        setDoctorId(matchedDoc._id);
        fetchAppointments(matchedDoc._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error resolving doctor profile", err);
      setLoading(false);
    }
  };

  const fetchAppointments = async (docId: string) => {
    try {
      const response = await appointmentService.listAppointments({
        doctorId: docId,
      });
      setAppointments(response.data);
    } catch (err) {
      console.error("Error fetching doctor appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setStatusUpdateLoading(id);
    try {
      await appointmentService.updateStatus(id, newStatus);
      if (doctorId) {
        fetchAppointments(doctorId);
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status. Only Receptionists and Admins can update status, or you might lack permissions.");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleOpenNotes = (appt: Appointment) => {
    setSelectedAppt(appt);
    setNotes(appt.notes || "");
    setPurpose(appt.purpose || "");
    setModalOpen(true);
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setSaveLoading(true);

    try {
      await appointmentService.updateAppointment(selectedAppt._id, {
        notes,
        purpose,
      });
      toast.success("Consultation notes saved successfully!");
      setModalOpen(false);
      if (doctorId) {
        fetchAppointments(doctorId);
      }
    } catch (err) {
      console.error("Failed to save notes", err);
      toast.error("Failed to save consultation notes.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div className="text-center py-12 text-slate-500">
        Doctor profile could not be found for this user account.
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">My Consultations</h1>
        <p className="text-slate-500 text-sm mt-1">View scheduled patient slots and document consultation files</p>
      </div>

      {/* Grid of Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {appointments.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-400 text-sm">
            No consultations scheduled.
          </div>
        ) : (
          appointments.map((appt) => {
            const dobDate = new Date(appt.patient?.dob);
            const age = new Date().getFullYear() - dobDate.getFullYear();
            
            return (
              <div
                key={appt._id}
                className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition"
              >
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {appt.slotTime}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      appt.status === AppointmentStatus.SCHEDULED
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
                </div>

                {/* Patient Profile */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {appt.patient?.firstName?.[0]}
                    {appt.patient?.lastName?.[0] || ""}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {appt.patient?.firstName} {appt.patient?.lastName}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div>ID: <strong className="text-slate-700">{appt.patient?.patientId}</strong></div>
                      <div>Mobile: <strong className="text-slate-700">{appt.patient?.mobile}</strong></div>
                      <div>Age/Gender: <strong className="text-slate-700">{age}yrs • {appt.patient?.gender}</strong></div>
                      {appt.patient?.primaryContactName && (
                        <div className="col-span-2 mt-1 border-t border-slate-200 pt-1">
                          Emergency Contact: <strong className="text-slate-700">{appt.patient.primaryContactName} ({appt.patient.relationship}) - {appt.patient.primaryContactNumber}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes & Purpose */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-2">
                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5">PURPOSE OF VISIT:</span>
                    <p className="text-slate-700">{appt.purpose || "General medical consultation"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5">CLINICAL NOTES:</span>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {appt.notes || "No clinical files recorded for this session yet."}
                    </p>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleOpenNotes(appt)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 rounded-lg transition border border-indigo-200"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Consultation Notes
                  </button>
                  
                  {appt.status === AppointmentStatus.ARRIVED && (
                    <button
                      onClick={() => handleUpdateStatus(appt._id, AppointmentStatus.COMPLETED)}
                      disabled={statusUpdateLoading === appt._id}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition shadow-sm shadow-emerald-600/20"
                    >
                      {statusUpdateLoading === appt._id ? (
                        <Loader className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      Complete Consultation
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Consultation Notes Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-indigo-600" />
                Document Consultation File
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Clinical Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record symptoms, diagnoses, prescriptions or files..."
                  rows={6}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-semibold rounded-xl"
                >
                  {saveLoading ? "Saving File..." : "Save File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
