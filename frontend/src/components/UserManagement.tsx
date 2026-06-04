import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUsers, addUser, removeUser, changeUserRole, clearUserError } from '../store/userSlice';
import { updateCurrentUser } from '../store/authSlice';
import type { UserDto, UserRole } from '../types';
import Pagination from './Pagination';

const PAGE_SIZE = 5;

const ROLE_STYLE: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  owner: 'bg-blue-100 text-blue-700',
  user: 'bg-green-100 text-green-700',
};

const ROLES: UserRole[] = ['admin', 'owner', 'user'];

export default function UserManagement(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector(s => s.users);
  const currentUser = useAppSelector(s => s.auth.currentUser);

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [nameError, setNameError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  // Reset to page 1 when the list length changes (after create/delete)
  useEffect(() => { setPage(1); }, [list.length]);

  const checkDuplicate = (value: string): void => {
    const trimmed = value.trim().toLowerCase();
    const isDuplicate = trimmed.length > 0 && list.some(u => u.name.toLowerCase() === trimmed);
    setNameError(isDuplicate ? `A user named "${value.trim()}" already exists.` : null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
    checkDuplicate(e.target.value);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setCreateError(null);
    setSuccess(null);
    dispatch(clearUserError());

    const trimmed = name.trim();
    const isDuplicate = list.some(u => u.name.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      setNameError(`A user named "${trimmed}" already exists.`);
      return;
    }

    const result = await dispatch(addUser({ name: trimmed, role }));
    if (result.meta.requestStatus === 'fulfilled') {
      const created = result.payload as UserDto;
      setName('');
      setRole('user');
      setNameError(null);
      setSuccess(`User "${created.name}" created.`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setCreateError(result.payload as string);
    }
  };

  const handleDelete = async (user: UserDto): Promise<void> => {
    setDeleteError(null);
    if (!window.confirm(`Delete "${user.name}"? All their bookings will also be deleted.`)) return;
    const result = await dispatch(removeUser(user.id));
    if (result.meta.requestStatus === 'rejected') setDeleteError(result.payload as string);
  };

  const handleRoleChange = async (userId: number, newRole: UserRole): Promise<void> => {
    setRoleError(null);
    const result = await dispatch(changeUserRole({ id: userId, role: newRole }));
    if (result.meta.requestStatus === 'rejected') {
      setRoleError(result.payload as string);
    } else {
      dispatch(updateCurrentUser(result.payload as UserDto));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New User</h2>

        {createError && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{createError}</div>
        )}
        {success && (
          <div className="mb-3 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">{success}</div>
        )}

        <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter name"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                nameError
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {nameError && (
              <p className="mt-1 text-xs text-red-600">{nameError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !name.trim() || !!nameError}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            All Users
            <span className="ml-2 text-sm font-normal text-gray-400">({list.length})</span>
          </h2>
        </div>

        {(deleteError || roleError || error) && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {deleteError ?? roleError ?? error}
          </div>
        )}

        {loading && list.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600 text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        {user.name}
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-gray-400">(you)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">ID: {user.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={user.id === currentUser?.id}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${ROLE_STYLE[user.role]}`}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                    <button
                      onClick={() => handleDelete(user)}
                      disabled={user.id === currentUser?.id}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded px-2 py-1 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title={user.id === currentUser?.id ? "Can't delete your own account" : `Delete ${user.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination total={list.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
