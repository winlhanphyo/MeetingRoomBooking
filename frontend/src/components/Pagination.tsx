import React from 'react';

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ total, page, pageSize, onPageChange }: PaginationProps): React.ReactElement | null {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 3) pages.push('...');
    pages.push(totalPages);
  }

  const btn = (
    label: React.ReactNode,
    target: number,
    disabled: boolean,
    active = false,
  ) => (
    <button
      key={String(label)}
      onClick={() => !disabled && onPageChange(target)}
      disabled={disabled}
      className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition
        ${active
          ? 'bg-blue-600 text-white'
          : disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
      {label}
    </button>
  );

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-400">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        {btn('‹', page - 1, page === 1)}
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">…</span>
            : btn(p, p, false, p === page)
        )}
        {btn('›', page + 1, page === totalPages)}
      </div>
    </div>
  );
}
