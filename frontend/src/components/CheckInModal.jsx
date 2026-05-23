import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { API_BASE_URL, fetchArray } from '../utils/api';

export default function CheckInModal({ onClose, onCheckIn }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            const data = await fetchArray(`${API_BASE_URL}/api/members`);
            // Filter only active members for check-in
            setMembers(data.filter(m => m.status === 'Active'));
        };
        fetchMembers();
    }, []);

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.includes(searchTerm)
    );

    const handleCheckInClick = async (memberId) => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/checkins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId })
            });
            if (res.ok) {
                onCheckIn();
            } else {
                const data = await res.json();
                setErrorMsg(data.error || 'Failed to check in');
            }
        } catch (err) {
            console.error('Checkin failed:', err);
            setErrorMsg('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '1.5rem' }}>Quick Check-in</h2>
                <p style={{ marginBottom: '1.5rem' }}>Search for an active member to record their check-in today.</p>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                {errorMsg && (
                    <div style={{ padding: '1rem', background: 'rgba(255, 51, 102, 0.15)', border: '1px solid var(--danger)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <X size={18} color="var(--danger)" />
                        {errorMsg}
                    </div>
                )}

                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {filteredMembers.map(member => (
                        <div key={member._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: '0.2rem' }}>{member.name}</h4>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.phone}</span>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem' }}
                                onClick={() => handleCheckInClick(member._id)}
                                disabled={loading}
                            >
                                <Check size={16} /> Check In
                            </button>
                        </div>
                    ))}
                    {filteredMembers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No active members found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
