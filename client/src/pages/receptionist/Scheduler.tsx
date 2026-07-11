import React, { useState, useEffect } from "react";
import { doctorService } from "../../services/doctor.service.js";
import { appointmentService } from "../../services/appointment.service.js";
import { departmentService } from "../../services/department.service.js";
import { patientService } from "../../services/patient.service.js";
import { type Doctor, type Patient, type Department } from "../../types/index.js";
import { Loader, Calendar, User, BookOpen, AlertCircle, CheckCircle, Search, Plus } from "lucide-react";

export const Scheduler: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Patient Search & Selection
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchingPatients, setSearchingPatients] = useState(false);

  // Booking Form State
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  // Notifications & Loaders
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Quick Patient Modal
  const [quickPatientModal, setQuickPatientModal] = useState(false);
  const [qFirstName, setQFirstName] = useState("");
  const [qLastName, setQLastName] = useState("");
  const [qGender, setQGender] = useState<"Male" | "Female" | "Other">("Male");
  const [qDob, setQDob] = useState("");
  const [qMobile, setQMobile] = useState("");
  const [qEmail, setQEmail] = useState("");
  const [qError, setQError] = useState<string | null>(null);
  const [qLoading, setQLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchSlots(selectedDoctorId, selectedDate);
    } else {
      setAvailableSlots([]);
      setSlotsError(null);
    }
    setSelectedSlot("");
  }, [selectedDoctorId, selectedDate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (patientSearch.trim()) {
        searchPatients(patientSearch);
      } else {
        setPatientResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [patientSearch]);

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Error fetching departments", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getDoctors();
      setDoctors(data);
      if (data.length > 0) {
        setSelectedDoctorId(data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching doctors", err);
    }
  };

  const filteredDoctors = selectedDepartmentId
    ? doctors.filter((d) => {
        const depId = typeof d.department === "string" ? d.department : d.department?._id;
        return depId === selectedDepartmentId;
      })
    : doctors;

  // Auto-select first doctor when department changes if current is invalid
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      const isValid = filteredDoctors.some((d) => d._id === selectedDoctorId);
      if (!isValid) setSelectedDoctorId(filteredDoctors[0]._id);
    } else {
      setSelectedDoctorId("");
    }
  }, [selectedDepartmentId, doctors]);

  const fetchSlots = async (doctorId: string, date: string) => {
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const slots = await appointmentService.getAvailableSlots(doctorId, date);
      setAvailableSlots(slots);
    } catch (err: any) {
      console.error("Error fetching slots", err);
      setAvailableSlots([]);
      setSlotsError(
        err.response?.data?.message || err.message || "Failed to fetch slots"
      );
    } finally {
      setSlotsLoading(false);
    }
  };

  const searchPatients = async (query: string) => {
    setSearchingPatients(true);
    try {
      const data = await patientService.searchPatients(query);
      setPatientResults(data);
    } catch (err) {
      console.error("Error searching patients", err);
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setQError(null);
    setQLoading(true);

    try {
      const created = await patientService.createPatient({
        firstName: qFirstName,
        lastName: qLastName,
        gender: qGender,
        dob: qDob,
        mobile: qMobile,
        email: qEmail || undefined,
      });
      setSelectedPatient(created);
      setQuickPatientModal(false);
      setPatientSearch("");
      setPatientResults([]);
    } catch (err: any) {
      setQError(err.response?.data?.message || err.message || "Failed to register patient");
    } finally {
      setQLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctorId || !selectedDate || !selectedSlot) {
      setMessage({ type: "error", text: "Please complete all appointment selections." });
      return;
    }

    setMessage(null);
    setBookingLoading(true);

    try {
      await appointmentService.createAppointment({
        patientId: selectedPatient._id,
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        slotTime: selectedSlot,
        purpose,
        notes,
      });
      setMessage({ type: "success", text: "Appointment scheduled successfully." });
      // Reset form
      setPurpose("");
      setNotes("");
      setSelectedPatient(null);
      setSelectedSlot("");
      // Re-fetch slots
      fetchSlots(selectedDoctorId, selectedDate);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Double-booking or scheduling conflict occurred.",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Appointment Scheduler</h1>
        <p className="text-slate-500 text-sm mt-1">Check slots and schedule consultations for EMR folders</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Options panel */}
        <div className="xl:col-span-2 space-y-6">
          {/* Doctor & Date Pickers */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Department Filter
              </label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Departments</option>
                {departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Consulting Physician
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                {filteredDoctors.map((d) => {
                  const u = d.user && typeof d.user !== "string" ? d.user : null;
                  return (
                    <option key={d._id} value={d._id}>
                      Dr. {u?.firstName} {u?.lastName} ({d.specialization})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Slots Panel */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Available Time Slots
            </h3>

            {slotsLoading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader className="h-6 w-6 text-indigo-500 animate-spin" />
              </div>
            ) : slotsError ? (
              <div className="py-12 text-center text-amber-500/80 text-sm flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mx-auto" />
                <span>{slotsError}. Please configure the doctor's schedule in the <strong>Schedules</strong> tab first.</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No slots available. The physician may not be scheduled to work on this day, or all slots are booked.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all text-center ${isSelected
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                        }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right side booking details */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm h-fit">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-6 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            Booking Parameters
          </h3>

          {message && (
            <div
              className={`p-3.5 mb-6 rounded-lg text-sm border flex items-start gap-2.5 ${message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-5">
            {/* Patient Search panel */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Patient Search
              </label>

              {selectedPatient ? (
                <div className="flex items-center justify-between bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">ID: {selectedPatient.patientId} • {selectedPatient.mobile}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-300 rounded-xl">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Type name, ID or mobile..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="bg-transparent border-none text-sm text-slate-900 w-full focus:outline-none placeholder-slate-400"
                    />
                  </div>

                  {searchingPatients && (
                    <div className="absolute right-3 top-9">
                      <Loader className="h-4 w-4 text-indigo-500 animate-spin" />
                    </div>
                  )}

                  {patientResults.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-300 rounded-xl shadow-2xl divide-y divide-[#2e3e56]/40">
                      {patientResults.map((pat) => (
                        <button
                          key={pat._id}
                          type="button"
                          onClick={() => {
                            setSelectedPatient(pat);
                            setPatientSearch("");
                            setPatientResults([]);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition text-sm"
                        >
                          <div className="font-semibold text-slate-900">
                            {pat.firstName} {pat.lastName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {pat.patientId} • {pat.mobile}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!searchingPatients && patientSearch.trim() && patientResults.length === 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl p-3 text-center shadow-xl">
                      <p className="text-xs text-slate-500 mb-2">No folders match search terms</p>
                      <button
                        type="button"
                        onClick={() => {
                          setQMobile(patientSearch.replace(/\D/g, ""));
                          setQuickPatientModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition"
                      >
                        <Plus className="h-3 w-3" /> Quick Register
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Selected Slot Indicator */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Selected Slot
              </label>
              <div className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2 text-slate-700">
                <User className="h-4 w-4 text-indigo-400" />
                {selectedSlot ? (
                  <span className="font-semibold text-indigo-400">{selectedSlot}</span>
                ) : (
                  <span className="text-slate-500">Select a slot on the left grid</span>
                )}
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Purpose of Visit
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Checkup, Follow-up"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Special Instructions
              </label>
              <textarea
                placeholder="Notes for the consulting doctor..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={bookingLoading || !selectedPatient || !selectedSlot}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold tracking-wide text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition-all duration-200"
            >
              {bookingLoading ? "Scheduling appointment..." : "Confirm Appointment"}
            </button>
          </form>
        </div>
      </div>

      {/* Quick Register Modal */}
      {quickPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Register Patient</h3>
              <button onClick={() => setQuickPatientModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickRegister} className="p-6 space-y-4">
              {qError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-2.5 rounded-lg text-xs">
                  {qError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={qFirstName}
                    onChange={(e) => setQFirstName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={qLastName}
                    onChange={(e) => setQLastName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Gender *</label>
                  <select
                    value={qGender}
                    onChange={(e) => setQGender(e.target.value as any)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">DOB *</label>
                  <input
                    type="date"
                    required
                    value={qDob}
                    onChange={(e) => setQDob(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={qMobile}
                  onChange={(e) => setQMobile(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={qEmail}
                  onChange={(e) => setQEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuickPatientModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={qLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-semibold rounded-xl"
                >
                  {qLoading ? "Saving..." : "Register Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

