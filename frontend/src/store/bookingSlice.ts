import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../api';
import type { BookingDto, SummaryItem } from '../types';

interface BookingState {
  list: BookingDto[];
  summary: SummaryItem[];
  loading: boolean;
  summaryLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  list: [],
  summary: [],
  loading: false,
  summaryLoading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getBookings();
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to fetch bookings.'
      );
    }
  }
);

export const addBooking = createAsyncThunk(
  'bookings/create',
  async (data: { startTime: string; endTime: string }, { rejectWithValue }) => {
    try {
      const res = await api.createBooking(data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to create booking.'
      );
    }
  }
);

export const removeBooking = createAsyncThunk(
  'bookings/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.deleteBooking(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to delete booking.'
      );
    }
  }
);

export const fetchSummary = createAsyncThunk(
  'bookings/summary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getBookingSummary();
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to fetch summary.'
      );
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
      .addCase(fetchBookings.fulfilled, (state, { payload }) => { state.loading = false; state.list = payload; })
      .addCase(fetchBookings.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; })

      .addCase(addBooking.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addBooking.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = [...state.list, payload].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      })
      .addCase(addBooking.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; })

      .addCase(removeBooking.fulfilled, (state, { payload }) => {
        state.list = state.list.filter(b => b.id !== payload);
      })
      .addCase(removeBooking.rejected, (state, { payload }) => { state.error = payload as string; })

      .addCase(fetchSummary.pending, (state) => { state.summaryLoading = true; })
      .addCase(fetchSummary.fulfilled, (state, { payload }) => { state.summaryLoading = false; state.summary = payload; })
      .addCase(fetchSummary.rejected, (state) => { state.summaryLoading = false; });
  },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
