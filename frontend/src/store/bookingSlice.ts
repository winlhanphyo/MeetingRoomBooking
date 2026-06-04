import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../api';
import type { BookingDto, SummaryItem } from '../types';

interface BookingState {
  list: BookingDto[];
  total: number;
  summary: SummaryItem[];
  summaryTotal: number;
  summaryTotalBookings: number;
  loading: boolean;
  summaryLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  list: [],
  total: 0,
  summary: [],
  summaryTotal: 0,
  summaryTotalBookings: 0,
  loading: false,
  summaryLoading: false,
  error: null,
};

const extractError = (err: unknown, fallback: string): string =>
  (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? fallback;

export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (params: { page: number; pageSize: number }, { rejectWithValue }) => {
    try {
      return (await api.getBookings(params.page, params.pageSize)).data;
    } catch (err) {
      return rejectWithValue(extractError(err, 'Failed to fetch bookings.'));
    }
  }
);

export const addBooking = createAsyncThunk(
  'bookings/create',
  async (data: { startTime: string; endTime: string }, { rejectWithValue }) => {
    try {
      return (await api.createBooking(data)).data;
    } catch (err) {
      return rejectWithValue(extractError(err, 'Failed to create booking.'));
    }
  }
);

export const removeBooking = createAsyncThunk(
  'bookings/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.deleteBooking(id);
      return id;
    } catch (err) {
      return rejectWithValue(extractError(err, 'Failed to delete booking.'));
    }
  }
);

export const fetchSummary = createAsyncThunk(
  'bookings/summary',
  async (params: { page: number; pageSize: number }, { rejectWithValue }) => {
    try {
      return (await api.getBookingSummary(params.page, params.pageSize)).data;
    } catch (err) {
      return rejectWithValue(extractError(err, 'Failed to fetch summary.'));
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookingError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload.data;
        state.total = payload.total;
      })
      .addCase(fetchBookings.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; })

      .addCase(addBooking.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addBooking.fulfilled, (state) => { state.loading = false; })
      .addCase(addBooking.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; })

      .addCase(removeBooking.rejected, (state, { payload }) => { state.error = payload as string; })

      .addCase(fetchSummary.pending, (state) => { state.summaryLoading = true; })
      .addCase(fetchSummary.fulfilled, (state, { payload }) => {
        state.summaryLoading = false;
        state.summary = payload.data;
        state.summaryTotal = payload.total;
        state.summaryTotalBookings = payload.totalBookings;
      })
      .addCase(fetchSummary.rejected, (state) => { state.summaryLoading = false; });
  },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
