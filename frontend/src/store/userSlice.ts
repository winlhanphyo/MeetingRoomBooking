import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../api';
import type { UserDto, UserRole } from '../types';

interface UserState {
  list: UserDto[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = { list: [], loading: false, error: null };

const extractError = (err: unknown, fallback: string): string =>
  (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? fallback;

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return (await api.getUsers()).data;
  } catch (err) {
    return rejectWithValue(extractError(err, 'Failed to fetch users.'));
  }
});

export const addUser = createAsyncThunk(
  'users/create',
  async (data: { name: string; role: UserRole }, { rejectWithValue }) => {
    try {
      return (await api.createUser(data)).data;
    } catch (err) {
      return rejectWithValue(extractError(err, 'Failed to create user.'));
    }
  }
);

export const removeUser = createAsyncThunk('users/delete', async (id: number, { rejectWithValue }) => {
  try {
    await api.deleteUser(id);
    return id;
  } catch (err) {
    return rejectWithValue(extractError(err, 'Failed to delete user.'));
  }
});

export const changeUserRole = createAsyncThunk(
  'users/changeRole',
  async ({ id, role }: { id: number; role: UserRole }, { rejectWithValue }) => {
    try {
      return (await api.updateUserRole(id, role)).data;
    } catch (err) {
      return rejectWithValue(extractError(err, 'Failed to update role.'));
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => { state.loading = false; state.list = payload; })
      .addCase(fetchUsers.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; })

      .addCase(addUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addUser.fulfilled, (state, { payload }) => { state.loading = false; state.list.push(payload); })
      .addCase(addUser.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; })

      .addCase(removeUser.fulfilled, (state, { payload }) => {
        state.list = state.list.filter(u => u.id !== payload);
      })
      .addCase(removeUser.rejected, (state, { payload }) => { state.error = payload as string; })

      .addCase(changeUserRole.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(u => u.id === payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...payload };
      })
      .addCase(changeUserRole.rejected, (state, { payload }) => { state.error = payload as string; });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
