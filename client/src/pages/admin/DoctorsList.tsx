import React, { useState, useEffect } from "react";
import { doctorService } from "../../services/doctor.service.js";
import { departmentService } from "../../services/department.service.js";
import type { Doctor, Department } from "../../types/index.js";
import { Plus, Edit2, Trash2, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { Pagination } from "../../components/Pagination.js";
import { ConfirmModal } from "../../components/ConfirmModal.js";

export const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT = 10;

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

  // Add Department Modal States
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDescription, setNewDeptDescription] = useState("");
  const [deptSubmitLoading, setDeptSubmitLoading] = useState(false);
  const [deptFormError, setDeptFormError] = useState<string | null>(null);

  // Delete Confirmation States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [doctorIdToDelete, setDoctorIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsResult, deptsData] = await Promise.all([
        doctorService.getDoctors(page, LIMIT),
        departmentService.getDepartments(),
      ]);
      setDoctors(Array.isArray(doctorsResult.data) ? doctorsResult.data : []);
      if (doctorsResult.meta) {
        setTotalPages(doctorsResult.meta.totalPages ?? 1);
        setTotalItems(doctorsResult.meta.total ?? 0);
      }
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
        toast.success("Doctor profile updated successfully!");
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
        toast.success("Doctor registered successfully!");
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to save doctor");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptFormError(null);
    setDeptSubmitLoading(true);

    try {
      const created = await departmentService.createDepartment({
        name: newDeptName,
        description: newDeptDescription,
      });
      setDepartments([...departments, created]);
      setDepartmentId(created._id);
      toast.success("Department created successfully!");
      setDeptModalOpen(false);
    } catch (err: any) {
      setDeptFormError(err.response?.data?.message || err.message || "Failed to create department");
    } finally {
      setDeptSubmitLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDoctorIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!doctorIdToDelete) return;
    try {
      await doctorService.deleteDoctor(doctorIdToDelete);
      toast.success("Doctor deactivated successfully!");
      await fetchData();
    } catch (err) {
      console.error("Error deleting doctor", err);
      toast.error("Failed to deactivate doctor.");
    } finally {
      setDoctorIdToDelete(null);
      setDeleteConfirmOpen(false);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Doctors Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage clinical staff, specialties and details</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Doctor
        </button>
      </div>

      {/* Grid List */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Department</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Specialization</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Consultation Fee</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {doctors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-sm">
                  No doctors registered yet.
                </td>
              </tr>
            ) : (
              doctors.map((doc) => {
                const docUser = doc.user && typeof doc.user !== "string" ? doc.user : null;
                const docDept = doc.department && typeof doc.department !== "string" ? doc.department : null;

                return (
                  <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {docUser?.firstName} {docUser?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{docUser?.email}</td>
                    <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">{docDept?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.specialization}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">${doc.consultationFee}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${docUser?.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                          }`}
                      >
                        {docUser?.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        disabled={!docUser?.isActive}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          itemLabel="doctors"
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950">
                {editingDoctor ? "Edit Doctor Profile" : "Register New Doctor"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {!editingDoctor && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                    placeholder="e.g. Cardiologist"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                <div className="flex items-center gap-2">
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setNewDeptName("");
                      setNewDeptDescription("");
                      setDeptFormError(null);
                      setDeptModalOpen(true);
                    }}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200 transition-all flex items-center justify-center"
                    title="Add Department"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800"
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

      {/* Add Department Sub-Modal */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950">Add Department</h3>
              <button
                onClick={() => setDeptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeptSubmit} className="p-6 space-y-4">
              {deptFormError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-sm">
                  {deptFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Department Name</label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  required
                  placeholder="e.g. Cardiology"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                <textarea
                  value={newDeptDescription}
                  onChange={(e) => setNewDeptDescription(e.target.value)}
                  placeholder="e.g. Heart health and cardiovascular system."
                  rows={3}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deptSubmitLoading}
                  className="flex items-center justify-center px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-semibold rounded-xl"
                >
                  {deptSubmitLoading ? "Saving..." : "Add Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDoctorIdToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Deactivate Doctor"
        message="Are you sure you want to deactivate this doctor? This will suspend their login credentials and hide them from scheduling."
        confirmText="Deactivate"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};
