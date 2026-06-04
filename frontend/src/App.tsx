import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import LoginSelector from './components/LoginSelector';
import Header from './components/Header';

const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const Summary = lazy(() => import('./components/Summary'));
const UserManagement = lazy(() => import('./components/UserManagement'));

function PageLoader(): React.ReactElement {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

export default function App(): React.ReactElement {
  const currentUser = useAppSelector(s => s.auth.currentUser);

  if (!currentUser) return <LoginSelector />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/bookings" element={<BookingsPage />} />
              <Route
                path="/summary"
                element={
                  currentUser.role === 'admin' || currentUser.role === 'owner'
                    ? <Summary />
                    : <Navigate to="/bookings" replace />
                }
              />
              <Route
                path="/users"
                element={
                  currentUser.role === 'admin'
                    ? <UserManagement />
                    : <Navigate to="/bookings" replace />
                }
              />
              <Route path="*" element={<Navigate to="/bookings" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
