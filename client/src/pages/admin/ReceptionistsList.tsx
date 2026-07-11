import React, { useState, useEffect } from "react";
import { receptionistService } from "../../services/receptionist.service.js";
import type { User } from "../../types/index.js";
import { Plus, Edit2, Trash2, Loader } from "lucide-react";
import { Pagination } from "../../components/Pagination.js";
import { ConfirmModal } from "../../components/ConfirmModal.js";
import toast from "react-hot-toast";

export const ReceptionistsList: React.FC = () => {
  const [receptionists, setReceptionists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT = 10;

  // Delete Confirmation States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [receptionistIdToDelete, setReceptionistIdToDelete] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState<User | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchReceptionists();
  }, [page]);

  const fetchReceptionists = async () => {
    setLoading(true);
    try {
      const result = await receptionistService.getReceptionists(page, LIMIT);
      const list = Array.isArray(result.data) ? result.data : [];
      setReceptionists(list);
      if (result.meta) {
        setTotalPages(result.meta.totalPages ?? 1);
        setTotalItems(result.meta.total ?? 0);
      }
    } catch (err) {
      console.error("Error loading receptionists data", err);
      setReceptionists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingReceptionist(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (receptionist: User) => {
    setEditingReceptionist(receptionist);
    setFirstName(receptionist.firstName);
    setLastName(receptionist.lastName || "");
    setEmail(receptionist.email);
    setPassword("");
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    try {
      if (editingReceptionist) {
        // Update
        const payload = {
          firstName,
          lastName,
          email,
        };
        const updated = await receptionistService.updateReceptionist(editingReceptionist._id, payload);
        setReceptionists(receptionists.map((r) => (r._id === updated._id ? updated : r)));
      } else {
        // Create
        const payload = {
          firstName,
          lastName,
          email,
          password,
        };
        const created = await receptionistService.createReceptionist(payload);
        setReceptionists([created as any, ...receptionists]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to save receptionist");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setReceptionistIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!receptionistIdToDelete) return;
    try {
      await receptionistService.deleteReceptionist(receptionistIdToDelete);
      toast.success("Receptionist deactivated successfully!");
      await fetchReceptionists();
    } catch (err) {
      console.error("Error deleting receptionist", err);
      toast.error("Failed to deactivate receptionist.");
    } finally {
      setReceptionistIdToDelete(null);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Reception Staff</h1>
          <p className="text-slate-500 text-sm mt-1">Manage registration staff accounts and access status</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Receptionist
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {receptionists.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No receptionists registered yet.
                </td>
              </tr>
            ) : (
              receptionists.map((rec) => (
                <tr key={rec._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {rec.firstName} {rec.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{rec.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        rec.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {rec.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec._id)}
                      disabled={!rec.isActive}
                      className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          itemLabel="receptionists"
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingReceptionist ? "Edit Receptionist Account" : "Register Receptionist"}
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

              {!editingReceptionist && (
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
                  {submitLoading ? "Saving..." : "Save Staff"}
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
          setReceptionistIdToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Deactivate Receptionist"
        message="Are you sure you want to deactivate this receptionist? This will suspend their login credentials and block their platform access."
        confirmText="Deactivate"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};
