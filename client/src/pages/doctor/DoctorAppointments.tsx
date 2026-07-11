import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.js";
import { appointmentService } from "../../services/appointment.service.js";
import { doctorService } from "../../services/doctor.service.js";
import type { Appointment } from "../../types/index.js";
import { AppointmentStatus } from "../../types/index.js";
import { Loader, Calendar, Edit3, ClipboardList } from "lucide-react";

export const DoctorAppointments: React.FC = () => {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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
      setAppointments(
        appointments.map((a) =>
          a._id === selectedAppt._id ? { ...a, notes, purpose } : a
        )
      );
      setModalOpen(false);
    } catch (err) {
      console.error("Error saving consultation notes", err);
      alert("Failed to save consultation notes.");
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
        <h1 className="text-2xl font-bold tracking-tight text-white m-0">My Consultations</h1>
        <p className="text-slate-400 text-sm mt-1">View scheduled patient slots and document consultation files</p>
      </div>

      {/* Grid of Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {appointments.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-[#0d1321] border border-[#1e293b] rounded-xl text-slate-500 text-sm">
            No consultations scheduled.
          </div>
        ) : (
          appointments.map((appt) => {
            const dobDate = new Date(appt.patient?.dob);
            const age = new Date().getFullYear() - dobDate.getFullYear();
            
            return (
              <div
                key={appt._id}
                className="bg-[#0d1321] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4 hover:border-slate-700/80 transition"
              >
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-400">
                      {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-indigo-400 font-bold bg-[#151f32] px-2 py-0.5 rounded">
                      {appt.slotTime}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      appt.status === AppointmentStatus.SCHEDULED
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
                </div>

                {/* Patient Profile */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {appt.patient?.firstName?.[0]}
                    {appt.patient?.lastName?.[0] || ""}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold text-white">
                      {appt.patient?.firstName} {appt.patient?.lastName}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div>ID: <strong className="text-slate-300">{appt.patient?.patientId}</strong></div>
                      <div>Mobile: <strong className="text-slate-300">{appt.patient?.mobile}</strong></div>
                      <div>Age/Gender: <strong className="text-slate-300">{age}yrs • {appt.patient?.gender}</strong></div>
                      {appt.patient?.primaryContactName && (
                        <div className="col-span-2 mt-1 border-t border-[#1e293b] pt-1">
                          Emergency Contact: <strong className="text-slate-300">{appt.patient.primaryContactName} ({appt.patient.relationship}) - {appt.patient.primaryContactNumber}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes & Purpose */}
                <div className="bg-[#151f32]/40 border border-[#2e3e56]/20 p-3 rounded-lg text-xs space-y-2">
                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5">PURPOSE OF VISIT:</span>
                    <p className="text-slate-300">{appt.purpose || "General medical consultation"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5">CLINICAL NOTES:</span>
                    <p className="text-slate-300 whitespace-pre-wrap">
                      {appt.notes || "No clinical files recorded for this session yet."}
                    </p>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleOpenNotes(appt)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Consultation Notes
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Consultation Notes Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d1321] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-indigo-400" />
                Document Consultation File
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Clinical Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record symptoms, diagnoses, prescriptions or files..."
                  rows={6}
                  className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-[#1e293b] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
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
