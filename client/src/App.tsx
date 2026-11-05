import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/auth/AuthPage';
import { FeedPage } from './pages/feed/FeedPage';
import { ExplorePage } from './pages/explore/ExplorePage';
import { UploadPage } from './pages/upload/UploadPage';
import { VideoEditorPage } from './pages/editor/VideoEditorPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { CreatorStudioPage } from './pages/creator/CreatorStudioPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#080604] text-amber-400">
        <div className="w-10 h-10 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SoundProvider>
          <Routes>
            {/* Auth page with Interactive Lumen Lamp from KONSEP LOGIN.mp4 */}
            <Route path="/login" element={<AuthPage />} />

            {/* Application Shell - Protected for All Roles (Requires Login First) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<FeedPage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route
                path="upload"
                element={
                  <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="editor"
                element={
                  <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
                    <VideoEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile/:username?" element={<ProfilePage />} />
              <Route
                path="creator"
                element={
                  <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
                    <CreatorStudioPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SoundProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

