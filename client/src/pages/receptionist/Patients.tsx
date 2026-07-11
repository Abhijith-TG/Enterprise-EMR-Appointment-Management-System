import React, { useState, useEffect } from "react";
import { patientService } from "../../services/patient.service.js";
import { type Patient } from "../../types/index.js";
import { Plus, Search, Loader } from "lucide-react";
import { Pagination } from "../../components/Pagination.js";

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT = 10;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [dob, setDob] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [primaryContactNumber, setPrimaryContactNumber] = useState("");
  const [relationship, setRelationship] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const result = await patientService.getPatients(page, LIMIT);
      setPatients(Array.isArray(result.data) ? result.data : []);
      if (result.meta) {
        setTotalPages(result.meta.totalPages ?? 1);
        setTotalItems(result.meta.total ?? 0);
      }
    } catch (err) {
      console.error("Error fetching patients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchPatients();
      return;
    }
    setLoading(true);
    try {
      const results = await patientService.searchPatients(searchQuery);
      setPatients(results);
    } catch (err) {
      console.error("Error searching patients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFirstName("");
    setLastName("");
    setGender("Male");
    setDob("");
    setMobile("");
    setEmail("");
    setAddress("");
    setPrimaryContactName("");
    setPrimaryContactNumber("");
    setRelationship("");
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    try {
      const payload = {
        firstName,
        lastName,
        gender,
        dob,
        mobile,
        email: email || undefined,
        address: address || undefined,
        primaryContactName: primaryContactName || undefined,
        primaryContactNumber: primaryContactNumber || undefined,
        relationship: relationship || undefined,
      };
      const created = await patientService.createPatient(payload);
      setPatients([created, ...patients]);
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to create patient record");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Patient Management</h1>
          <p className="text-slate-500 text-sm mt-1">Register new patients and manage clinical EMR folders</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Register Patient
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
        <div className="flex-1 flex items-center gap-2 px-2 bg-slate-50 rounded-lg border border-slate-200">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Name or Mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
        >
          Search
        </button>
      </form>

      {/* Grid list */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Patient ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Gender & DOB</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Mobile</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                      No patient folders found.
                    </td>
                  </tr>
                ) : (
                  patients.map((pat) => (
                    <tr key={pat._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{pat.patientId}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {pat.firstName} {pat.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div>{pat.gender}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date(pat.dob).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{pat.mobile}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{pat.email || "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-[150px]" title={pat.address}>
                        {pat.address || "—"}
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
              itemLabel="patients"
            />
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Register EMR Patient Folder</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Home Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-[#151f32] border border-[#2e3e56] rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Emergency Contact */}
              <div className="pt-3 border-t border-[#1e293b] space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Emergency Contact Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={primaryContactName}
                      onChange={(e) => setPrimaryContactName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder="e.g. Spouse"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Contact Mobile</label>
                  <input
                    type="tel"
                    value={primaryContactNumber}
                    onChange={(e) => setPrimaryContactNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-semibold rounded-xl"
                >
                  {submitLoading ? "Registering..." : "Register Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

