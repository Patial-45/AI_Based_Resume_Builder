import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { useAuth } from './context/auth';
import Recover from './pages/Recover';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import MatchResume from './pages/MatchResume';
import JobSearch from './pages/JobSearch';
import MatchHistory from './pages/MatchHistory';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';

function Workspace() {
  const { user } = useAuth();
  return (
      <div className={user ? "app-shell signed-in" : "app-shell"}>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="main-content">
          <Routes>
            <Route path="/recover" element={<Recover />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <ResumeUpload />
                </PrivateRoute>
              }
            />
            <Route
              path="/match"
              element={
                <PrivateRoute>
                  <MatchResume />
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <PrivateRoute>
                  <JobSearch />
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <MatchHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/builder"
              element={
                <PrivateRoute>
                  <ResumeBuilder />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<section className="p-12 text-center"><h1 className="text-3xl font-semibold">Page not found</h1><p className="mt-3">Use the navigation to return to your workspace.</p></section>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>

  );
}

export default function App() { return <AuthProvider><Workspace /></AuthProvider>; }
