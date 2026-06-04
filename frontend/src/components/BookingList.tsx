import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBookings, removeBooking } from '../store/bookingSlice';
import type { BookingDto } from '../types';
import Pagination from './Pagination';

const PAGE_SIZE = 5;

const fmt = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const duration = (start: string, end: string): string => {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export default function BookingList(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector(s => s.bookings);
  const currentUser = useAppSelector(s => s.auth.currentUser);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch(fetchBookings()); }, [dispatch]);

  // Reset to page 1 when the list length changes (after delete)
  useEffect(() => { setPage(1); }, [list.length]);

  const canDelete = (booking: BookingDto): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'owner') return true;
    return booking.userId === currentUser.id;
  };

  const handleDelete = async (booking: BookingDto): Promise<void> => {
    const confirmed = await Swal.fire({
      title: 'Delete booking?',
      html: `<span class="text-sm text-gray-600">${fmt(booking.startTime)} → ${fmt(booking.endTime)}</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!confirmed.isConfirmed) return;

    setDeleteError(null);
    setDeletingId(booking.id);
    const result = await dispatch(removeBooking(booking.id));
    setDeletingId(null);
    if (result.meta.requestStatus === 'rejected') {
      setDeleteError(result.payload as string);
      Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: result.payload as string,
        confirmButtonColor: '#3b82f6',
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'The booking has been removed.',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  if (loading && list.length === 0) {
    return <div className="text-center py-12 text-gray-400">Loading bookings...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">
          All Bookings
          <span className="ml-2 text-sm font-normal text-gray-400">({list.length})</span>
        </h2>
        <button onClick={() => dispatch(fetchBookings())} className="text-sm text-blue-600 hover:underline">
          Refresh
        </button>
      </div>

      {(error || deleteError) && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error ?? deleteError}
        </div>
      )}

      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No bookings yet.</div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(booking => {
              const isPast = new Date(booking.endTime) < new Date();
              return (
                <div
                  key={booking.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${isPast ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isPast ? 'bg-gray-300' : 'bg-blue-500'}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {fmt(booking.startTime)} &rarr; {fmt(booking.endTime)}
                        <span className="ml-2 text-xs text-gray-400">
                          ({duration(booking.startTime, booking.endTime)})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Booked by{' '}
                        <span className="font-medium">{booking.User?.name ?? `User #${booking.userId}`}</span>
                        <span className="ml-1 text-gray-400">({booking.User?.role})</span>
                        {isPast && <span className="ml-2 text-gray-400">&middot; Past</span>}
                      </div>
                    </div>
                  </div>

                  {canDelete(booking) && (
                    <button
                      onClick={() => handleDelete(booking)}
                      disabled={deletingId === booking.id}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded px-2 py-1 transition disabled:opacity-40"
                    >
                      {deletingId === booking.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination total={list.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
