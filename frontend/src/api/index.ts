import axios from 'axios';
import type { UserDto, BookingDto, SummaryItem, UserRole } from '../types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('currentUser') ?? 'null') as UserDto | null;
  if (user?.id) config.headers['X-User-Id'] = String(user.id);
  return config;
});

export const getSelectableUsers = () => api.get<UserDto[]>('/users/select');
export const getUsers = () => api.get<UserDto[]>('/users');
export const createUser = (data: { name: string; role: UserRole }) => api.post<UserDto>('/users', data);
export const deleteUser = (id: number) => api.delete<{ message: string }>(`/users/${id}`);
export const updateUserRole = (id: number, role: UserRole) =>
  api.patch<UserDto>(`/users/${id}/role`, { role });

export const getBookings = () => api.get<BookingDto[]>('/bookings');
export const createBooking = (data: { startTime: string; endTime: string }) =>
  api.post<BookingDto>('/bookings', data);
export const deleteBooking = (id: number) => api.delete<{ message: string }>(`/bookings/${id}`);
export const getBookingSummary = () => api.get<SummaryItem[]>('/bookings/summary');
