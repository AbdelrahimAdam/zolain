import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx';
import LoadingSpinner from '@/components/UI/LoadingSpinner.jsx';
import Login from '@/pages/Auth/Login.jsx';
import Register from '@/pages/Auth/Register.jsx';

// Unified layout
import Layout from '@/components/Layout/Layout.jsx';
import PublicLayout from '@/components/Layout/PublicLayout.jsx';

// Dashboards
import AdminDashboard from '@/pages/Admin/Dashboard.jsx';
import TeacherDashboard from '@/pages/Teacher/Dashboard.jsx';
import StudentDashboard from '@/pages/Student/Dashboard.jsx';

// Admin pages
import UserManagement from '@/pages/Admin/UserManagement.jsx';
import CourseManagement from '@/pages/Admin/CourseManagement.jsx';
import SessionManagement from '@/pages/Admin/SessionManagement.jsx';
import Analytics from '@/pages/Admin/Analytics.jsx';

// Teacher pages
import TeacherRecordings from '@/pages/Teacher/TeacherRecordings.jsx';
import TeacherSessions from '@/pages/Teacher/TeacherSessions.jsx';
import TeacherStudents from '@/pages/Teacher/TeacherStudents.jsx';
import TeacherCourses from '@/pages/Teacher/TeacherCourses.jsx';
import CreateSessionPage from '@/pages/Teacher/CreateSessionPage.jsx';
import CreateRecordingPage from '@/pages/Teacher/CreateRecordingPage.jsx';   // 👈 NEW IMPORT

// Student pages
import StudentSessions from '@/pages/Student/StudentSessions.jsx';
import StudentRecordings from '@/pages/Student/StudentRecordings.jsx';
import StudentCourses from '@/pages/Student/StudentCourses.jsx';
import StudentCourseDetail from '@/pages/Student/StudentCourseDetail.jsx';

// Shared / Other components
import RecordingDetail from '@/pages/Recording/RecordingDetail.jsx';
import Profile from '@/pages/User/Profile.jsx';
import SubscriptionPlans from '@/components/Subscription/SubscriptionPlans.jsx';

// New public pages for Zolain
import Home from '@/pages/Public/Home.jsx';
import CourseCatalog from '@/pages/Public/CourseCatalog.jsx';
import InstructorProfiles from '@/pages/Public/InstructorProfiles.jsx';
import Contact from '@/pages/Public/Contact.jsx';

// New course editor (admin/teacher)
import CourseEditor from '@/pages/Admin/CourseEditor.jsx';

import { getAuth } from 'firebase/auth';

// ✅ Force Logout Component
const Logout = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const auth = getAuth()
    auth
      .signOut()
      .catch(() => {})
      .finally(() => {
        localStorage.clear()
        sessionStorage.clear()
        navigate('/login', { replace: true })
      })
  }, [navigate])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-blue-600 dark:text-blue-400" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Logging out...</p>
      </div>
    </div>
  )
}

// ✅ Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userRole, userProfile, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading user profile...</p>
        </div>
      </div>
    )
  }

  if (userProfile && !userProfile.isActive && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Account Pending Approval
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Your account is pending admin approval. Please wait until your account is activated to access the dashboard.
            </p>
            <button
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                navigate('/logout', { replace: true })
              }}
              className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout & Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// ✅ Public Only Route
const PublicOnlyRoute = ({ children }) => {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />
      case 'teacher':
        return <Navigate to="/teacher/dashboard" replace />
      case 'student':
        return <Navigate to="/student/dashboard" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return children
}

// ✅ Role-based dashboard component
const RoleBasedDashboard = () => {
  const { userRole, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-4xl mb-4 text-red-500">❌</div>
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4">
              Profile Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your user profile could not be loaded. Please contact support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile.isActive && userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-4xl mb-4 text-yellow-500">⏳</div>
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">
              Account Pending Approval
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your account is pending admin approval. Please wait until your account is activated.
            </p>
          </div>
        </div>
      </div>
    )
  }

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />
    case 'teacher':
      return <TeacherDashboard />
    case 'student':
      return <StudentDashboard />
    default:
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center max-w-md">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="text-4xl mb-4 text-red-500">❌</div>
              <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4">
                Invalid User Role
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your account has an invalid role. Please contact support.
              </p>
            </div>
          </div>
        </div>
      )
  }
}

// Placeholders
const ReportsPage = () => <div className="p-6"><h1 className="text-3xl font-bold">Reports</h1></div>;
const MyCourses = () => <div className="p-6"><h1 className="text-3xl font-bold">My Courses</h1></div>;
const SchedulePage = () => <div className="p-6"><h1 className="text-3xl font-bold">Schedule</h1></div>;
const MessagesPage = () => <div className="p-6"><h1 className="text-3xl font-bold">Messages</h1></div>;
const ProgressPage = () => <div className="p-6"><h1 className="text-3xl font-bold">Progress</h1></div>;
const NotificationsPage = () => <div className="p-6"><h1 className="text-3xl font-bold">Notifications</h1></div>;
const HelpPage = () => <div className="p-6"><h1 className="text-3xl font-bold">Help & Support</h1></div>;
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">🚫 Unauthorized</div>
  </div>
);
const AdminLessons = () => <div className="p-6"><h1 className="text-3xl font-bold">Admin Lessons</h1><p>Manage all lesson videos</p></div>;

// ✅ Main Routes
function AppRoutes() {
  const { userRole } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/courses" element={<PublicLayout><CourseCatalog /></PublicLayout>} />
      <Route path="/instructors" element={<PublicLayout><InstructorProfiles /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

      {/* Auth routes */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/logout" element={<Logout />} />

      {/* Dashboard route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout role={userRole}>
              <RoleBasedDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout role="admin">
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="courses/new" element={<CourseEditor />} />
                <Route path="courses/:courseId/edit" element={<CourseEditor />} />
                <Route path="lessons" element={<AdminLessons />} />
                <Route path="sessions" element={<SessionManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<Profile />} />
                <Route path="subscription" element={<SubscriptionPlans />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Teacher routes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute requiredRole="teacher">
            <Layout role="teacher">
              <Routes>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="recordings" element={<TeacherRecordings />} />
                <Route path="lessons" element={<TeacherRecordings />} />
                <Route path="recordings/create" element={<CreateRecordingPage />} />   {/* 👈 NEW ROUTE */}
                <Route path="sessions" element={<TeacherSessions />} />
                <Route path="sessions/create" element={<CreateSessionPage />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="courses" element={<TeacherCourses />} />
                <Route path="courses/new" element={<CourseEditor />} />
                <Route path="courses/:courseId/edit" element={<CourseEditor />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
                <Route path="subscription" element={<SubscriptionPlans />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Student routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute requiredRole="student">
            <Layout role="student">
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="sessions" element={<StudentSessions />} />
                <Route path="recordings" element={<StudentRecordings />} />
                <Route path="lessons" element={<StudentRecordings />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="courses/:courseId" element={<StudentCourseDetail />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="profile" element={<Profile />} />
                <Route path="subscription" element={<SubscriptionPlans />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Common protected routes */}
      <Route
        path="/recording/:id"
        element={
          <ProtectedRoute>
            <Layout role={userRole}>
              <RecordingDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout role={userRole}>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Layout role={userRole}>
              <SubscriptionPlans />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout role={userRole}>
              <NotificationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <Layout role={userRole}>
              <HelpPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Layout role={userRole}>
              <MessagesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NavigateToDashboardOrHome />} />
    </Routes>
  )
}

// Redirect root to public home if not logged in, else to dashboard
const NavigateToDashboardOrHome = () => {
  const { user, userRole, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />
    case 'teacher':
      return <Navigate to="/teacher/dashboard" replace />
    case 'student':
      return <Navigate to="/student/dashboard" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

// ✅ App Wrapper
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}

export default App;