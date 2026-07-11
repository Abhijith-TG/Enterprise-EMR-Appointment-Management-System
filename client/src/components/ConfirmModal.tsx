import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isDanger
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/10"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
