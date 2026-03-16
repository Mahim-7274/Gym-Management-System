import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
// Added Wrench icon for Machine Upkeep
import { LayoutDashboard, Users, CreditCard, Settings, Briefcase, TrendingUp, Wrench } from 'lucide-react'; 
import './index.css';

import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Plans from './pages/Plans';
import Workers from './pages/Workers'; 
import ProgressTracker from './pages/ProgressTracker';
import Upkeep from './pages/Upkeep'; // Import the new Machine Upkeep page

const Sidebar = () => (
  <aside className="sidebar glass-panel" style={{ border: 'none', borderRadius: 0 }}>
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '1.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        AURA FITNESS
      </h2>
    </div>

    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <NavLink to="/" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
        <LayoutDashboard size={20} /> Dashboard
      </NavLink>
      
      <NavLink to="/members" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
        <Users size={20} /> Members
      </NavLink>

      <NavLink to="/workers" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
        <Briefcase size={20} /> Workers
      </NavLink>

      <NavLink to="/progress" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
        <TrendingUp size={20} /> Progress Tracker
      </NavLink>

      {/* NEW: Machine Upkeep Sidebar Link */}
      <NavLink to="/upkeep" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
        <Wrench size={20} /> Machine Upkeep
      </NavLink>

      <NavLink to="/plans" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }}>
        <CreditCard size={20} /> Gym Plans
      </NavLink>
    </nav>

    <div style={{ marginTop: 'auto' }}>
      <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
        <Settings size={20} /> Settings
      </button>
    </div>
  </aside>
);

function App() {
  return (
    <Router>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/progress" element={<ProgressTracker />} />
            {/* NEW: Machine Upkeep Route */}
            <Route path="/upkeep" element={<Upkeep />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;