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
