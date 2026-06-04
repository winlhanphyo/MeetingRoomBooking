import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserDto } from '../types';

interface AuthState {
  currentUser: UserDto | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: JSON.parse(localStorage.getItem('currentUser') ?? 'null') as UserDto | null,
  } satisfies AuthState,
  reducers: {
    login(state, action: PayloadAction<UserDto>) {
      state.currentUser = action.payload;
      localStorage.setItem('currentUser', JSON.stringify(action.payload));
    },
    logout(state) {
      state.currentUser = null;
      localStorage.removeItem('currentUser');
    },
    updateCurrentUser(state, action: PayloadAction<Partial<UserDto> & { id: number }>) {
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
      }
    },
  },
});

export const { login, logout, updateCurrentUser } = authSlice.actions;
export default authSlice.reducer;
