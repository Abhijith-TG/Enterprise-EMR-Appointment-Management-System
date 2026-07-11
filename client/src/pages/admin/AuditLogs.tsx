import React, { useState, useEffect } from "react";
import { auditlogService } from "../../services/auditlog.service.js";
import { type AuditLog } from "../../types/index.js";
import { Loader, Shield, Clock, FileText, User } from "lucide-react";

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await auditlogService.getLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0 flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-500" />
          System Audit Logs
        </h1>
        <p className="text-slate-500 text-sm mt-1">Immutable ledger of system events and activities.</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const date = new Date(log.createdAt).toLocaleString();
                  const userObj = log.user as any;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4 text-slate-400" />
                          {userObj?.firstName} {userObj?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{userObj?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg">
                          {log.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-slate-400" />
                          {log.entity}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {log.entityId}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
