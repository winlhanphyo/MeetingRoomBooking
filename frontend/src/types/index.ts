export type UserRole = 'admin' | 'owner' | 'user';

export interface UserDto {
  id: number;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface BookingDto {
  id: number;
  userId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  User?: Pick<UserDto, 'id' | 'name' | 'role'>;
}

export interface SummaryItem {
  userId: number;
  name: string;
  role: UserRole;
  totalBookings: number;
  bookings: BookingDto[];
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SummaryPagedResponse extends PagedResponse<SummaryItem> {
  totalBookings: number;
}
