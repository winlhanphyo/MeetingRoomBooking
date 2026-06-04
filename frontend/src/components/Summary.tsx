import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSummary } from '../store/bookingSlice';
import type { UserRole } from '../types';
import Pagination from './Pagination';

const PAGE_SIZE = 5;

const fmt = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

const ROLE_STYLE: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  owner: 'bg-blue-100 text-blue-700',
  user: 'bg-green-100 text-green-700',
};

export default function Summary(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { summary, summaryLoading } = useAppSelector(s => s.bookings);
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch(fetchSummary()); }, [dispatch]);

  const totalBookings = summary.reduce((sum, u) => sum + u.totalBookings, 0);
  const paginated = summary.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (summaryLoading) {
    return <div className="text-center py-12 text-gray-400">Loading summary...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Bookings', value: totalBookings },
          { label: 'Total Users', value: summary.length },
          {
            label: 'Avg Bookings / User',
            value: summary.length > 0 ? (totalBookings / summary.length).toFixed(1) : '0',
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-2xl font-bold text-blue-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Bookings by User</h2>
          <button onClick={() => dispatch(fetchSummary())} className="text-sm text-blue-600 hover:underline">
            Refresh
          </button>
        </div>

        {summary.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No data available.</div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {paginated.map(u => (
                <div key={u.userId} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600 text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLE[u.role]}`}>
                        {u.role}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {u.totalBookings} booking{u.totalBookings !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {u.bookings.length > 0 ? (
                    <div className="ml-10 space-y-1">
                      {u.bookings.map(b => (
                        <div key={b.id} className="text-xs text-gray-500 flex gap-2">
                          <span className="text-gray-300">&bull;</span>
                          {fmt(b.startTime)} &rarr; {fmt(b.endTime)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ml-10 text-xs text-gray-400">No bookings</p>
                  )}
                </div>
              ))}
            </div>
            <Pagination total={summary.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
