import { useState, useEffect } from 'react';
import { Activity, Users, CheckCircle } from 'lucide-react';
import CheckInModal from '../components/CheckInModal';

export default function Dashboard() {
    const [stats, setStats] = useState({ todayCheckins: 0, activeMembers: 0, gymCapacity: 0 });
    const [recentCheckins, setRecentCheckins] = useState([]);
    const [showCheckInModal, setShowCheckInModal] = useState(false);

    // Assuming a max capacity of 100 for the indicator
    const MAX_CAPACITY = 100;

    const fetchDashboardData = async () => {
        try {
            // Fetch today's checkins
            const checkinsRes = await fetch('http://localhost:5000/api/checkins/today');
            const checkinsData = await checkinsRes.json();

            // Fetch all members to count active ones
            const membersRes = await fetch('http://localhost:5000/api/members');
            const membersData = await membersRes.json();

            const activeCount = membersData.filter(m => m.status === 'Active').length;

            setStats({
                todayCheckins: checkinsData.length,
                activeMembers: activeCount,
                gymCapacity: Math.min(Math.round((checkinsData.length / MAX_CAPACITY) * 100), 100)
            });

            // Map checkins to display format
            const formattedCheckins = checkinsData.map(ci => {
                const date = new Date(ci.timestamp);
                return {
                    id: ci._id,
                    name: ci.memberId ? ci.memberId.name : 'Unknown Member',
                    plan: ci.memberId && ci.memberId.currentPlan ? ci.memberId.currentPlan.name : 'N/A',
                    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: ci.memberId ? ci.memberId.status : 'Unknown'
                };
            }).reverse(); // Show most recent first

            setRecentCheckins(formattedCheckins);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCheckInSuccess = () => {
        setShowCheckInModal(false);
        fetchDashboardData(); // Refresh the stats immediately
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Dashboard</h1>
                    <p>Real-time overview of gym activity today.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCheckInModal(true)}>
                    <CheckCircle size={18} /> Quick Check-in
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--accent-gradient)', padding: '1rem', borderRadius: '50%' }}>
                        <Activity color="white" size={32} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.todayCheckins}</h3>
                        <p>Today's Check-ins</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--success)' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.activeMembers}</h3>
                        <p>Total Active Members</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Recent Check-ins</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '1rem' }}>Member Name</th>
                                <th style={{ padding: '1rem' }}>Time</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentCheckins.map(ci => (
                                <tr key={ci.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{ci.name}</td>
                                    <td style={{ padding: '1rem' }}>{ci.time}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${ci.status === 'Active' ? 'badge-active' : 'badge-expired'}`}>{ci.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentCheckins.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No check-ins today yet. Click 'Quick Check-in' to start.</p>}
                </div>
            </div>

            {showCheckInModal && (
                <CheckInModal
                    onClose={() => setShowCheckInModal(false)}
                    onCheckIn={handleCheckInSuccess}
                />
            )}
        </div>
    );
}
