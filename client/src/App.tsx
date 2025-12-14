import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import MatchResume from './pages/MatchResume';
import JobSearch from './pages/JobSearch';
import MatchHistory from './pages/MatchHistory';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
