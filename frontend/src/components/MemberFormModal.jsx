import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function MemberFormModal({ onClose, onSave, initialData = null }) {
    const [plans, setPlans] = useState([]);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        emergencyContactName: initialData?.emergencyContactName || '',
        emergencyContactPhone: initialData?.emergencyContactPhone || '',
        healthNotes: initialData?.healthNotes || '',
        planId: initialData?.currentPlan?._id || ''
    });

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/plans');
                const data = await res.json();
                setPlans(data);
                if (!formData.planId && data.length > 0 && !initialData) {
                    setFormData(prev => ({ ...prev, planId: data[0]._id }));
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
            }
        };
        fetchPlans();
    }, [initialData, formData.planId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, _id: initialData?._id });
    };

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '2rem' }}>
                    {initialData ? 'Edit Member Details' : 'Register New Member'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Ali Khan" />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 234 567 8900" />
                        </div>

                        <div className="form-group">
                            <label>Emergency Contact Name</label>
                            <input type="text" className="form-control" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="e.g. Sara Khan" />
                        </div>

                        <div className="form-group">
                            <label>Emergency Contact Phone</label>
                            <input type="tel" className="form-control" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="+1 234 567 8901" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Health Notes</label>
                        <textarea className="form-control" name="healthNotes" value={formData.healthNotes} onChange={handleChange} rows="3" placeholder="Any medical conditions or injuries?"></textarea>
                    </div>

                    <div className="form-group">
                        <label>Initial Plan</label>
                        <select className="form-control" name="planId" value={formData.planId} onChange={handleChange}>
                            <option value="">No Plan</option>
                            {plans.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={18} /> {initialData ? 'Update Member' : 'Save Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
