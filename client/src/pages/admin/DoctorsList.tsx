import React, { useState, useEffect } from "react";
import { doctorService } from "../../services/doctor.service.js";
import { departmentService } from "../../services/department.service.js";
import type { Doctor, Department } from "../../types/index.js";
import { Plus, Edit2, Trash2, Loader } from "lucide-react";

export const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [consultationFee, setConsultationFee] = useState(0);
  const [departmentId, setDepartmentId] = useState("");
  
  const [formError, setFormError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsData, deptsData] = await Promise.all([
        doctorService.getDoctors(),
        departmentService.getDepartments(),
      ]);
      setDoctors(doctorsData);
      setDepartments(deptsData);
    } catch (err) {
      console.error("Error loading doctors data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setSpecialization("");
    setConsultationFee(0);
    setDepartmentId(departments[0]?._id || "");
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    const docUser = doc.user && typeof doc.user !== "string" ? doc.user : null;
    const docDept = doc.department && typeof doc.department !== "string" ? doc.department : null;

    setEditingDoctor(doc);
    setFirstName(docUser?.firstName || "");
    setLastName(docUser?.lastName || "");
    setEmail(docUser?.email || "");
    setPassword("");
    setSpecialization(doc.specialization);
    setConsultationFee(doc.consultationFee);
    setDepartmentId(docDept?._id || "");
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    try {
      if (editingDoctor) {
        // Update
        const payload = {
          firstName,
          lastName,
          email,
          specialization,
          consultationFee,
          departmentId,
        };
        const updated = await doctorService.updateDoctor(editingDoctor._id, payload);
        setDoctors(doctors.map((d) => (d._id === updated._id ? updated : d)));
      } else {
        // Create
        const payload = {
          firstName,
          lastName,
          email,
          password,
          specialization,
          consultationFee,
          departmentId,
        };
        const created = await doctorService.createDoctor(payload);
        setDoctors([created, ...doctors]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to save doctor");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this doctor?")) return;
    try {
      await doctorService.deleteDoctor(id);
      // Re-fetch list to reflect user deactivation
      await fetchData();
    } catch (err) {
      console.error("Error deleting doctor", err);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0">Doctors Directory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage clinical staff, specialties and details</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-200"
        >
          <Plus className="h-4 w-4" /> Add Doctor
        </button>
      </div>

      {/* Grid List */}
      <div className="bg-[#0d1321] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e293b] bg-[#141d30]/60">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Department</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Specialization</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Consultation Fee</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {doctors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No doctors registered yet.
                </td>
              </tr>
            ) : (
              doctors.map((doc) => {
                const docUser = doc.user && typeof doc.user !== "string" ? doc.user : null;
                const docDept = doc.department && typeof doc.department !== "string" ? doc.department : null;

                return (
                  <tr key={doc._id} className="hover:bg-[#121a2b]/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {docUser?.firstName} {docUser?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{docUser?.email}</td>
                    <td className="px-6 py-4 text-sm text-indigo-400">{docDept?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{doc.specialization}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">${doc.consultationFee}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          docUser?.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {docUser?.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-[#1a2336] transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        disabled={!docUser?.isActive}
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#1a2336] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1321] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingDoctor ? "Edit Doctor Profile" : "Register New Doctor"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {!editingDoctor && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                    placeholder="e.g. Cardiologist"
                    className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-[#1e293b] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center justify-center px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-semibold rounded-xl"
                >
                  {submitLoading ? "Saving..." : "Save Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
