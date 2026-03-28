import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import MainLayout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Auth
import AuthPage from './pages/AuthPage';

// User pages
import DashboardPage from './pages/DashboardPage';
import RoadmapPage from './pages/RoadmapPage';
import SkillGapPage from './pages/SkillGapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import CoursesPage from './pages/CoursesPage';
import QuizPage from './pages/QuizPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import LearningPage from './pages/LearningPage';
import LandingPage from './pages/LandingPage';
import SkillAssessmentPage from './pages/SkillAssessmentPage';
import SkillVerificationPage from './pages/SkillVerificationPage';
import ReportPage from './pages/ReportPage';
import RecommendationsPage from './pages/RecommendationsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminSkillsPage from './pages/admin/AdminSkillsPage';
import AdminRoadmapConfigPage from './pages/admin/AdminRoadmapConfigPage';

/* ─── Route Guards ─────────────────────────────────────────────────────────── */

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { token, loading, user } = useAuthStore();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!token) return <Navigate to="/login" />;
  if (requireProfile && user && !user.profileComplete) return <Navigate to="/profile-setup" />;
  return <MainLayout>{children}</MainLayout>;
};

const AdminRoute = ({ children }) => {
  const { token, loading, user } = useAuthStore();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!token) return <Navigate to="/login" />;
  if (user && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return <AdminLayout>{children}</AdminLayout>;
};

/* ─── App ───────────────────────────────────────────────────────────────────── */

function App() {
  const { getMe } = useAuthStore();

  useEffect(() => {
    getMe();
  }, [getMe]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Auth routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Onboarding routes (token required, but no profile required) */}
        <Route path="/profile-setup" element={
          <ProtectedRoute requireProfile={false}>
            <ProfileSetupPage />
          </ProtectedRoute>
        } />
        <Route path="/skill-assessment" element={
          <ProtectedRoute requireProfile={false}>
            <SkillAssessmentPage />
          </ProtectedRoute>
        } />
        <Route path="/skill-verification" element={
          <ProtectedRoute requireProfile={false}>
            <SkillVerificationPage />
          </ProtectedRoute>
        } />

        {/* Main app routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
        <Route path="/gap" element={<ProtectedRoute><SkillGapPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />

        {/* Admin portal routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
        <Route path="/admin/roles" element={<AdminRoute><AdminRolesPage /></AdminRoute>} />
        <Route path="/admin/skills" element={<AdminRoute><AdminSkillsPage /></AdminRoute>} />
        <Route path="/admin/roadmaps" element={<AdminRoute><AdminRoadmapConfigPage /></AdminRoute>} />

        {/* Landing & fallback */}
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
