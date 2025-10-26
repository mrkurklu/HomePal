import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomeownerDashboard from './pages/HomeownerDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import CreateJobPage from './pages/CreateJobPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ProfilePage from './pages/ProfilePage';
import QuotesPage from './pages/QuotesPage';
import NotificationsPage from './pages/NotificationsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { user, token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (token) {
      // Initialize socket connection here if needed
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={user?.role === 'homeowner' ? '/homeowner' : '/professional'} /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to={user?.role === 'homeowner' ? '/homeowner' : '/professional'} /> : <RegisterPage />
        } />
        
        <Route path="/homeowner" element={
          <PrivateRoute>
            <HomeownerDashboard />
          </PrivateRoute>
        } />
        <Route path="/professional" element={
          <PrivateRoute>
            <ProfessionalDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/jobs/create" element={
          <PrivateRoute>
            <CreateJobPage />
          </PrivateRoute>
        } />
        <Route path="/jobs/:id" element={
          <PrivateRoute>
            <JobDetailsPage />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
        
        <Route path="/quotes" element={
          <PrivateRoute>
            <QuotesPage />
          </PrivateRoute>
        } />
        
        <Route path="/notifications" element={
          <PrivateRoute>
            <NotificationsPage />
          </PrivateRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <ToastContainer position="top-right" />
    </Router>
  );
}

export default App;
