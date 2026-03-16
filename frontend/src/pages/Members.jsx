import { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, Edit, Trash2, CheckCircle } from 'lucide-react';
import MemberFormModal from '../components/MemberFormModal';
import ReceiptModal from '../components/ReceiptModal';

export default function Members() {
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
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

    // Fixed handleMarkAsPaid for instant UI update
    const handleMarkAsPaid = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: 'Paid' })
            });

            if (res.ok) {
                // Update the state immediately
                setMembers(prev => prev.map(m => m._id === id ? { ...m, paymentStatus: 'Paid' } : m));
                alert("Payment status updated to Paid!");
            }
        } catch (err) {
            console.error('Error updating payment:', err);
        }
    };

    const handleSaveMember = async (memberData) => {
        try {
            const method = memberData._id ? 'PUT' : 'POST';
            const url = memberData._id ? `http://localhost:5000/api/members/${memberData._id}` : 'http://localhost:5000/api/members';
            const payload = { ...memberData };
            if (payload.planId) payload.currentPlan = payload.planId;

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
        if (!window.confirm('Are you sure?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/members/${id}`, { method: 'DELETE' });
            if (res.ok) fetchMembers();
        } catch (err) {
            console.error('Error deleting member:', err);
        }
    };

    const handleRenewPlan = async (member) => {
        let planId = member.currentPlan?._id || (plans.length > 0 ? plans[0]._id : null);
        if (!planId) return alert("No plans available!");

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

    const filteredMembers = members.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || (m.phone && m.phone.includes(searchTerm))
    );

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Member Details</h1>
                    <p>Manage memberships and payment tracking.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'gray' }} />
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search..." 
                            style={{ paddingLeft: '2.8rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditingMember(null); setShowMemberForm(true); }}>
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </header>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                            <th style={{ padding: '1.2rem' }}>Name</th>
                            <th style={{ padding: '1.2rem' }}>Phone</th>
                            <th style={{ padding: '1.2rem' }}>Status</th>
                            <th style={{ padding: '1.2rem' }}>Payment</th>
                            <th style={{ padding: '1.2rem' }}>Plan</th>
                            <th style={{ padding: '1.2rem' }}>Expiry</th>
                            <th style={{ padding: '1.2rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => {
                            const isUnpaid = member.paymentStatus !== 'Paid';
                            return (
                                <tr key={member._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1.2rem' }}>{member.name}</td>
                                    <td style={{ padding: '1.2rem' }}>{member.phone}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span className={`badge ${member.status === 'Active' ? 'badge-active' : 'badge-expired'}`}>{member.status}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span className={`badge ${!isUnpaid ? 'badge-active' : 'badge-expired'}`}>
                                            {member.paymentStatus || 'Unpaid'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>{member.currentPlan?.name || 'N/A'}</td>
                                    <td style={{ padding: '1.2rem' }}>{member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        {isUnpaid && (
                                            <button className="btn btn-primary" style={{ background: '#00ff88', color: 'black' }} onClick={() => handleMarkAsPaid(member._id)}>
                                                <CheckCircle size={14} /> Paid
                                            </button>
                                        )}
                                        <button className="btn btn-secondary" onClick={() => { setEditingMember(member); setShowMemberForm(true); }}><Edit size={14} /></button>
                                        <button className="btn btn-danger" onClick={() => handleDeleteMember(member._id)}><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showMemberForm && <MemberFormModal initialData={editingMember} onClose={() => setShowMemberForm(false)} onSave={handleSaveMember} />}
            {showReceipt && selectedReceipt && <ReceiptModal receipt={selectedReceipt} onClose={() => setShowReceipt(false)} />}
        </div>
    );
}