import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
// Added Wrench icon for Machine Upkeep
import { LayoutDashboard, Users, CreditCard, Settings, Briefcase, TrendingUp, Wrench, Bell, LogOut, Dumbbell, MessageSquare, CalendarDays } from 'lucide-react'; 
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Plans from './pages/Plans';
import Workers from './pages/Workers'; 
import ProgressTracker from './pages/ProgressTracker';
import Upkeep from './pages/Upkeep'; // Import the new Machine Upkeep page
import NoticeBoard from './pages/NoticeBoard';
import WorkoutPlans from './pages/WorkoutPlans';
import SuggestionBox from './pages/SuggestionBox';
import ClassTimetable from './pages/ClassTimetable';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null; // Don't render sidebar if not logged in

  return (
    <aside className="sidebar glass-panel" style={{ border: 'none', borderRadius: 0, position: 'fixed', top: 0, left: 0, height: '100vh', width: '280px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AURA FITNESS
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Logged in as: {user.username} ({user.role})
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <NavLink to="/" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        
        <NavLink to="/members" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
          <Users size={20} /> Members
        </NavLink>

        <NavLink to="/progress" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
          <TrendingUp size={20} /> Progress Tracker
        </NavLink>

        <NavLink to="/workouts" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
          <Dumbbell size={20} /> Workout Plans
        </NavLink>

        <NavLink to="/notices" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
          <Bell size={20} /> Notice Board
        </NavLink>

        <NavLink to="/suggestions" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
          <MessageSquare size={20} /> Suggestion Box
        </NavLink>

        <NavLink to="/timetable" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
          <CalendarDays size={20} /> Class Timetable
        </NavLink>

        {user.role === 'admin' && (
          <>
            <NavLink to="/workers" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
              <Briefcase size={20} /> Workers
            </NavLink>

            <NavLink to="/upkeep" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
              <Wrench size={20} /> Machine Upkeep
            </NavLink>

            <NavLink to="/plans" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
              <CreditCard size={20} /> Gym Plans
            </NavLink>
          </>
        )}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
          <Settings size={20} /> Settings
        </button>
        <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.2)' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" />;
  
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  return (
    <div className="layout">
      {user && <Sidebar />}
      <main className="main-content" style={{ width: user ? 'calc(100% - 280px)' : '100%', marginLeft: user ? '280px' : '0' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressTracker /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><WorkoutPlans /></ProtectedRoute>} />
          <Route path="/notices" element={<ProtectedRoute><NoticeBoard /></ProtectedRoute>} />
          <Route path="/suggestions" element={<ProtectedRoute><SuggestionBox /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><ClassTimetable /></ProtectedRoute>} />
          
          <Route path="/plans" element={<ProtectedRoute requireAdmin={true}><Plans /></ProtectedRoute>} />
          <Route path="/workers" element={<ProtectedRoute requireAdmin={true}><Workers /></ProtectedRoute>} />
          <Route path="/upkeep" element={<ProtectedRoute requireAdmin={true}><Upkeep /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
