import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/authSlice';
import { getSelectableUsers } from '../api';
import type { UserDto, UserRole } from '../types';

const ROLE_STYLE: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700 border border-red-300',
  owner: 'bg-blue-100 text-blue-700 border border-blue-300',
  user: 'bg-green-100 text-green-700 border border-green-300',
};

export default function LoginSelector(): React.ReactElement {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSelectableUsers()
      .then(res => setUsers(res.data))
      .catch(() => setError('Could not load users. Make sure the backend is running and seeded.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏢</div>
          <h1 className="text-2xl font-bold text-gray-800">Meeting Room Booking</h1>
          <p className="text-gray-500 mt-1">Select a user to continue</p>
        </div>

        {loading && <div className="text-center py-8 text-gray-400">Loading users...</div>}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{error}</div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No users found. Run <code className="bg-gray-100 px-1 rounded">npm run seed</code> in the backend.
          </div>
        )}

        <div className="space-y-2 mt-2">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => dispatch(login(user))}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-800">{user.name}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_STYLE[user.role]}`}>
                {user.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
