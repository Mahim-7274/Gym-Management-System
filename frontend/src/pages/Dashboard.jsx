import { useState, useEffect } from 'react';
import { Activity, Users, CheckCircle, AlertCircle, AlertTriangle, Wrench, TrendingUp } from 'lucide-react';
import CheckInModal from '../components/CheckInModal';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = useState({ todayCheckins: 0, activeMembers: 0, gymCapacity: 0 });
    const [recentCheckins, setRecentCheckins] = useState([]);
    const [unpaidMembers, setUnpaidMembers] = useState([]); 
    const [brokenMachines, setBrokenMachines] = useState([]); 
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [newMembersData, setNewMembersData] = useState([]);

    const MAX_CAPACITY = 100;

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch today's checkins
            const checkinsRes = await fetch('http://localhost:5000/api/checkins/today');
            const checkinsData = await checkinsRes.json();

            // 2. Fetch all members to count active ones
            const membersRes = await fetch('http://localhost:5000/api/members');
            const membersData = await membersRes.json();

            // 3. Fetch unpaid members
            const unpaidRes = await fetch('http://localhost:5000/api/members/unpaid');
            const unpaidData = await unpaidRes.json();
            setUnpaidMembers(unpaidData);

            // 4. Fetch broken machines
            const machinesRes = await fetch('http://localhost:5000/api/machines/broken');
            const machinesData = await machinesRes.json();
            setBrokenMachines(machinesData);

            // 5. Fetch analytics
            const revenueRes = await fetch('http://localhost:5000/api/analytics/revenue');
            const revenueJson = await revenueRes.json();
            setRevenueData(revenueJson);

            const newMembersRes = await fetch('http://localhost:5000/api/analytics/new-members');
            const newMembersJson = await newMembersRes.json();
            setNewMembersData(newMembersJson);

            const activeCount = membersData.filter(m => m.status === 'Active').length;

            setStats({
                todayCheckins: checkinsData.length,
                activeMembers: activeCount,
                gymCapacity: Math.min(Math.round((checkinsData.length / MAX_CAPACITY) * 100), 100)
            });

            const formattedCheckins = checkinsData.map(ci => {
                const date = new Date(ci.timestamp);
                return {
                    id: ci._id,
                    name: ci.memberId ? ci.memberId.name : 'Unknown Member',
                    plan: ci.memberId && ci.memberId.currentPlan ? ci.memberId.currentPlan.name : 'N/A',
                    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: ci.memberId ? ci.memberId.status : 'Unknown'
                };
            }).reverse();

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
        fetchDashboardData();
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

            {/* --- MACHINE UPKEEP ALERT --- */}
            {brokenMachines.length > 0 && (
                <div style={machineAlertStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertTriangle color="#ffa502" size={28} />
                        <div>
                            <h3 style={{ color: '#ffa502', margin: 0, fontSize: '1.1rem' }}>Machine Maintenance Required</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255, 165, 2, 0.8)' }}>
                                {brokenMachines.length} machine(s) are currently reported as broken.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {brokenMachines.map(m => (
                            <span key={m._id} style={machineTagStyle}>
                                <Wrench size={12} /> {m.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* --- UNPAID MONEY ALERTS --- */}
            {unpaidMembers.length > 0 && (
                <div style={alertContainerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <AlertCircle color="#ff4d4d" size={24} />
                        <h2 style={{ color: '#ff4d4d', margin: 0, fontSize: '1.25rem' }}>Unpaid Money Alerts</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {unpaidMembers.map(member => (
                            <div key={member._id} style={alertCardStyle}>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>{member.name}</span>
                                <span style={{ fontSize: '0.85rem', color: '#ff4d4d' }}>Status: {member.paymentStatus || 'Unpaid'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

            {/* --- ANALYTICS CHARTS --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp color="var(--primary)" size={20} />
                        Total Money Made (Last 30 Days)
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickMargin={10} />
                                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(20,20,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users color="var(--success)" size={20} />
                        New Members (Last 30 Days)
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <LineChart data={newMembersData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickMargin={10} />
                                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(20,20,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="newMembers" stroke="var(--success)" strokeWidth={3} dot={{ r: 4, fill: "var(--success)" }} />
                            </LineChart>
                        </ResponsiveContainer>
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

// Styles
const machineAlertStyle = {
    background: 'rgba(255, 165, 2, 0.1)',
    border: '1px solid rgba(255, 165, 2, 0.3)',
    padding: '1.2rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
};

const machineTagStyle = {
    background: 'rgba(255, 165, 2, 0.2)',
    color: '#ffa502',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    border: '1px solid rgba(255, 165, 2, 0.2)'
};

const alertContainerStyle = {
    background: 'rgba(255, 77, 77, 0.05)',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2.5rem'
};

const alertCardStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '10px 15px',
    borderRadius: '8px',
    borderLeft: '4px solid #ff4d4d',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
};