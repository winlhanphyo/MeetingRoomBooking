import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import type { UserRole } from '../types';

interface NavItem {
  to: string;
  label: string;
  roles: UserRole[];
}

const ROLE_STYLE: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  owner: 'bg-blue-100 text-blue-700',
  user: 'bg-green-100 text-green-700',
};

const NAV_ITEMS: NavItem[] = [
  { to: '/bookings', label: 'Bookings', roles: ['admin', 'owner', 'user'] },
  { to: '/summary', label: 'Summary', roles: ['admin', 'owner'] },
  { to: '/users', label: 'User Management', roles: ['admin'] },
];

export default function Header(): React.ReactElement {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.currentUser);

  const visibleItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span className="text-xl font-bold text-gray-800">🏢 Meeting Room</span>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{user.name}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLE[user.role]}`}>
                  {user.role}
                </span>
              </div>
            )}
            <button
              onClick={() => dispatch(logout())}
              className="text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-red-300 transition"
            >
              Switch User
            </button>
          </div>
        </div>

        <nav className="flex gap-1 -mb-px">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
