import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, CheckCircle, User, QrCode, Download, Dumbbell } from 'lucide-react';
import MemberFormModal from '../components/MemberFormModal';
import ReceiptModal from '../components/ReceiptModal';
import QRCodeModal from '../components/QRCodeModal';
import { API_BASE_URL, fetchArray } from '../utils/api';

const escapeCsvValue = (value) => {
    const normalized = value === null || value === undefined ? '' : String(value);
    return `"${normalized.replace(/"/g, '""')}"`;
};

const downloadCsv = (filename, rows) => {
    const csv = rows.map(row => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

export default function Members() {
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [latestWorkoutPlans, setLatestWorkoutPlans] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [editingMember, setEditingMember] = useState(null);
    const [qrMember, setQrMember] = useState(null);

    const fetchMembers = async () => {
        const data = await fetchArray(`${API_BASE_URL}/api/members`);
        setMembers(data);
    };

    const fetchPlans = async () => {
        const data = await fetchArray(`${API_BASE_URL}/api/plans`);
        setPlans(data);
    };

    const fetchLatestWorkoutPlans = async () => {
        const data = await fetchArray(`${API_BASE_URL}/api/workout-plans/latest`);
        const planMap = data.reduce((acc, plan) => {
            acc[plan._id] = plan;
            return acc;
        }, {});
        setLatestWorkoutPlans(planMap);
    };

    useEffect(() => {
        fetchMembers();
        fetchPlans();
        fetchLatestWorkoutPlans();
    }, []);

    // Fixed handleMarkAsPaid for instant UI update
    const handleMarkAsPaid = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/members/${id}`, {
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

    const handleSaveMember = async (formData, memberId) => {
        try {
            const method = memberId ? 'PUT' : 'POST';
            const url = memberId ? `${API_BASE_URL}/api/members/${memberId}` : `${API_BASE_URL}/api/members`;

            const res = await fetch(url, {
                method,
                body: formData
            });

            if (res.ok) {
                setShowMemberForm(false);
                fetchMembers();
                fetchLatestWorkoutPlans();
            }
        } catch (err) {
            console.error('Error saving member:', err);
        }
    };

    const handleDeleteMember = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/members/${id}`, { method: 'DELETE' });
            if (res.ok) fetchMembers();
        } catch (err) {
            console.error('Error deleting member:', err);
        }
    };

    const handleRenewPlan = async (member) => {
        let planId = member.currentPlan?._id || (plans.length > 0 ? plans[0]._id : null);
        if (!planId) return alert("No plans available!");

        try {
            const res = await fetch(`${API_BASE_URL}/api/members/${member._id}/renew`, {
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

    const handleExportMembers = () => {
        const rows = [
            ['Name', 'Phone', 'Status', 'Plan', 'Expiry Date', 'Payment Status'],
            ...members.map(member => [
                member.name,
                member.phone,
                member.status,
                member.currentPlan?.name || 'N/A',
                member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : 'N/A',
                member.paymentStatus || 'Unpaid'
            ])
        ];

        downloadCsv('members.csv', rows);
    };

    const handleExportPayments = async () => {
        try {
            const receipts = await fetchArray(`${API_BASE_URL}/api/receipts?all=true`);
            const rows = [
                ['Member Name', 'Amount', 'Plan', 'Date', 'Payment Status'],
                ...receipts.map(receipt => [
                    receipt.memberId?.name || 'Unknown Member',
                    receipt.amountPaid,
                    receipt.planId?.name || 'N/A',
                    receipt.date ? new Date(receipt.date).toLocaleDateString() : 'N/A',
                    receipt.memberId?.paymentStatus || 'Paid'
                ])
            ];

            downloadCsv('payments.csv', rows);
        } catch (err) {
            console.error('Error exporting payments:', err);
        }
    };

    const filteredMembers = members.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm)) ||
        (m._id && m._id.includes(searchTerm))
    );

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Member Details</h1>
                    <p>Manage memberships and payment tracking.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
                    <button className="btn btn-secondary" onClick={handleExportMembers}>
                        <Download size={18} /> Export Members
                    </button>
                    <button className="btn btn-secondary" onClick={handleExportPayments}>
                        <Download size={18} /> Export Payments
                    </button>
                    <button className="btn btn-primary" onClick={() => { setEditingMember(null); setShowMemberForm(true); }}>
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </header>

            <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '1120px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                            <th style={{ padding: '1.2rem' }}>Member</th>
                            <th style={{ padding: '1.2rem' }}>Phone</th>
                            <th style={{ padding: '1.2rem' }}>Status</th>
                            <th style={{ padding: '1.2rem' }}>Payment</th>
                            <th style={{ padding: '1.2rem' }}>Plan</th>
                            <th style={{ padding: '1.2rem' }}>Expiry</th>
                            <th style={{ padding: '1.2rem' }}>Birthday</th>
                            <th style={{ padding: '1.2rem' }}>Latest Workout</th>
                            <th style={{ padding: '1.2rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => {
                            const isUnpaid = member.paymentStatus !== 'Paid';
                            const latestWorkout = latestWorkoutPlans[member._id];
                            return (
                                <tr key={member._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        {member.profilePicture ? (
                                            <img 
                                                src={`${API_BASE_URL}${member.profilePicture}`} 
                                                alt={member.name}
                                                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                                            />
                                        ) : (
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={18} color="rgba(255,255,255,0.4)" />
                                            </div>
                                        )}
                                        {member.name}
                                    </td>
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
                                    <td style={{ padding: '1.2rem' }}>{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        {latestWorkout ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                                <Dumbbell size={14} color="var(--accent-primary)" />
                                                <span>{latestWorkout.title}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>No plan</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        {isUnpaid && (
                                            <button className="btn btn-primary" style={{ background: '#00ff88', color: 'black' }} onClick={() => handleMarkAsPaid(member._id)}>
                                                <CheckCircle size={14} /> Paid
                                            </button>
                                        )}
                                        <button className="btn btn-secondary" onClick={() => setQrMember(member)} title="Show QR Code"><QrCode size={14} /></button>
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
            {qrMember && <QRCodeModal member={qrMember} onClose={() => setQrMember(null)} />}
        </div>
    );
}
