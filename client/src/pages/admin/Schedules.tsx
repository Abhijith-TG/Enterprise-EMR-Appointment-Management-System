import React, { useState, useEffect } from "react";
import { doctorService } from "../../services/doctor.service.js";
import { scheduleService } from "../../services/schedule.service.js";
import type { Doctor, Session } from "../../types/index.js";
import { Loader, Save, Plus, Trash2 } from "lucide-react";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const Schedules: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [loading, setLoading] = useState(true);

  // Form State
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [slotDuration, setSlotDuration] = useState(15);
  const [sessions, setSessions] = useState<Session[]>([
    { startTime: "09:00", endTime: "12:00" },
  ]);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      loadDoctorSchedule(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await doctorService.getDoctors();
      setDoctors(data);
      if (data.length > 0) {
        setSelectedDoctorId(data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching doctors", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorSchedule = async (doctorId: string) => {
    setMessage(null);
    try {
      const schedule = await scheduleService.getScheduleByDoctorId(doctorId);
      if (schedule) {
        setWorkingDays(schedule.workingDays);
        setSlotDuration(schedule.slotDuration);
        setSessions(schedule.sessions);
      } else {
        // Reset to default
        setWorkingDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
        setSlotDuration(15);
        setSessions([{ startTime: "09:00", endTime: "17:00" }]);
      }
    } catch (err) {
      // If 404, reset to default (means no schedule configured yet)
      setWorkingDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
      setSlotDuration(15);
      setSessions([{ startTime: "09:00", endTime: "17:00" }]);
    }
  };

  const handleDayToggle = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSession = () => {
    setSessions([...sessions, { startTime: "13:00", endTime: "17:00" }]);
  };

  const handleRemoveSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleSessionChange = (index: number, field: keyof Session, value: string) => {
    setSessions(
      sessions.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    if (workingDays.length === 0) {
      setMessage({ type: "error", text: "Please select at least one working day." });
      return;
    }
    if (sessions.length === 0) {
      setMessage({ type: "error", text: "Please add at least one session." });
      return;
    }

    setMessage(null);
    setSaveLoading(true);

    try {
      await scheduleService.createSchedule({
        doctorId: selectedDoctorId,
        workingDays,
        sessions,
        slotDuration,
      });
      setMessage({ type: "success", text: "Schedule configured successfully." });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to save schedule.",
      });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Schedule Management</h1>
        <p className="text-slate-500 text-sm mt-1">Configure and manage clinical sessions and slot durations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Selector Sidebar */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 h-fit space-y-4 shadow-sm">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Select Doctor
          </label>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {doctors.length === 0 ? (
              <p className="text-slate-500 text-sm">No doctors found.</p>
            ) : (
              doctors.map((doc) => {
                const docUser = doc.user && typeof doc.user !== "string" ? doc.user : null;
                const isSelected = selectedDoctorId === doc._id;
                return (
                  <button
                    key={doc._id}
                    onClick={() => setSelectedDoctorId(doc._id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/10"
                        : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <div>{docUser?.firstName} {docUser?.lastName}</div>
                    <div className={`text-xs mt-0.5 ${isSelected ? "text-indigo-200" : "text-indigo-500"}`}>
                      {doc.specialization}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Schedule Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          {selectedDoctorId ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div
                  className={`p-4 rounded-lg text-sm border ${
                    message.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Working Days */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Working Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = workingDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                            : "bg-white border-slate-300 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Duration */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Slot Duration (Minutes)
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className="w-full max-w-[200px] bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              {/* Sessions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Clinical Sessions
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSession}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Session
                  </button>
                </div>

                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={session.startTime}
                            onChange={(e) => handleSessionChange(index, "startTime", e.target.value)}
                            required
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={session.endTime}
                            onChange={(e) => handleSessionChange(index, "endTime", e.target.value)}
                            required
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSession(index)}
                        disabled={sessions.length === 1}
                        className="mt-5 p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 transition-all duration-200"
                >
                  <Save className="h-4 w-4" />
                  {saveLoading ? "Saving Configuration..." : "Save Schedule"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Please register doctors first to configure schedules.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
