import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addBooking, clearBookingError } from '../store/bookingSlice';

const toDatetimeLocal = (date: Date): string => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const nextHour = (): Date => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
};

export default function BookingForm(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.bookings);

  const start = nextHour();
  const [startTime, setStartTime] = useState(toDatetimeLocal(start));
  const [endTime, setEndTime] = useState(toDatetimeLocal(new Date(start.getTime() + 3600_000)));
  const [success, setSuccess] = useState(false);

  const startInvalid = startTime && endTime && new Date(startTime) >= new Date(endTime);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    dispatch(clearBookingError());
    setSuccess(false);

    const result = await dispatch(
      addBooking({
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Booking</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
          Booking created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {startInvalid && (
          <p className="text-red-500 text-sm">Start time must be before end time.</p>
        )}

        <button
          type="submit"
          disabled={!!loading || !!startInvalid}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 rounded-lg transition text-sm"
        >
          {loading ? 'Creating...' : 'Create Booking'}
        </button>
      </form>
    </div>
  );
}
