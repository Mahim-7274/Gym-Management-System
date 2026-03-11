import { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, Edit, Trash2 } from 'lucide-react';
import MemberFormModal from '../components/MemberFormModal';
import ReceiptModal from '../components/ReceiptModal';

export default function Members() {
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [editingMember, setEditingMember] = useState(null);

    const fetchMembers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/members');
            const data = await res.json();
            setMembers(data);
        } catch (err) {
            console.error('Error fetching members:', err);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/plans');
            const data = await res.json();
            setPlans(data);
        } catch (err) {
            console.error('Error fetching plans:', err);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchPlans();
    }, []);

    const handleSaveMember = async (memberData) => {
        try {
            const method = memberData._id ? 'PUT' : 'POST';
            const url = memberData._id ? `http://localhost:5000/api/members/${memberData._id}` : 'http://localhost:5000/api/members';

            const payload = { ...memberData };
            if (payload.planId) {
                payload.currentPlan = payload.planId;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowMemberForm(false);
                fetchMembers();
            }
        } catch (err) {
            console.error('Error saving member:', err);
        }
    };

    const handleDeleteMember = async (id) => {
        if (!window.confirm('Are you sure you want to delete this member?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/members/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchMembers();
            }
        } catch (err) {
            console.error('Error deleting member:', err);
        }
    };

    const handleRenewPlan = async (member) => {
        let planId = member.currentPlan?._id;
        if (!planId) {
            if (plans.length > 0) planId = plans[0]._id;
            else return alert("No plans available to renew with!");
        }

        try {
            const res = await fetch(`http://localhost:5000/api/members/${member._id}/renew`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedReceipt({
                    memberName: data.member.name,
                    planName: plans.find(p => p._id === planId)?.name || 'Plan',
                    amount: data.receipt.amountPaid
                });
                setShowReceipt(true);
                fetchMembers();
            }
        } catch (err) {
            console.error('Error renewing plan:', err);
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Member Details</h1>
                    <p>Manage all your gym memberships in one place.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" className="form-control" placeholder="Search members..." style={{ paddingLeft: '2.8rem', width: '250px' }} />
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditingMember(null); setShowMemberForm(true); }}>
                        <Plus size={18} /> Add New Member
                    </button>
                </div>
            </header>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '1.2rem 1.5rem' }}>Name</th>
                            <th style={{ padding: '1.2rem 1.5rem' }}>Phone</th>
                            <th style={{ padding: '1.2rem 1.5rem' }}>Status</th>
                            <th style={{ padding: '1.2rem 1.5rem' }}>Plan</th>
                            <th style={{ padding: '1.2rem 1.5rem' }}>Expiry Date</th>
                            <th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => {
                            const currentPlanName = member.currentPlan ? member.currentPlan.name : 'No Plan';
                            const expiryDateStr = member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : 'N/A';

                            return (
                                <tr key={member._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>{member.name}</td>
                                    <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)' }}>{member.phone}</td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <span className={`badge ${member.status === 'Active' ? 'badge-active' : 'badge-expired'}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>{currentPlanName}</td>
                                    <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)' }}>{expiryDateStr}</td>
                                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right', display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => { setEditingMember(member); setShowMemberForm(true); }}>
                                            <Edit size={16} /> Edit
                                        </button>
                                        <button className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} title="Delete Member" onClick={() => handleDeleteMember(member._id)}>
                                            <Trash2 size={16} /> Delete
                                        </button>
                                        {member.status === 'Expired' && (
                                            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => handleRenewPlan(member)}>
                                                <RefreshCw size={16} /> Renew
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {members.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No members found. Add one to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showMemberForm && (
                <MemberFormModal
                    initialData={editingMember}
                    onClose={() => setShowMemberForm(false)}
                    onSave={handleSaveMember}
                />
            )}

            {showReceipt && selectedReceipt && (
                <ReceiptModal
                    receipt={selectedReceipt}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </div>
    );
}
