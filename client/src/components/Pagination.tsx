import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalItems,
  onPageChange,
  itemLabel = "items",
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers: number[] = [];
  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  for (let i = left; i <= right; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
      <span className="text-xs text-slate-500">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>{" "}
        <span className="text-slate-400">({totalItems} {itemLabel})</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-indigo-300 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {left > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="min-w-[32px] h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-indigo-300 transition"
            >
              1
            </button>
            {left > 2 && <span className="text-slate-400 text-xs px-1">…</span>}
          </>
        )}

        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[32px] h-8 px-2 rounded-lg border text-xs font-semibold transition ${
              p === page
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-indigo-300"
            }`}
          >
            {p}
          </button>
        ))}

        {right < totalPages && (
          <>
            {right < totalPages - 1 && (
              <span className="text-slate-400 text-xs px-1">…</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="min-w-[32px] h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-indigo-300 transition"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-indigo-300 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
