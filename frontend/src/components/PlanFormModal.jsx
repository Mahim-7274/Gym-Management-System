import { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function PlanFormModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        durationInDays: '',
        price: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name: formData.name,
            durationInDays: Number(formData.durationInDays),
            price: Number(formData.price)
        });
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

                <h2 style={{ marginBottom: '2rem' }}>Create New Plan</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Plan Name</label>
                        <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. 3-Month Plan" />
                    </div>

                    <div className="form-group">
                        <label>Duration (in days)</label>
                        <input type="number" className="form-control" name="durationInDays" value={formData.durationInDays} onChange={handleChange} required placeholder="90" min="1" />
                    </div>

                    <div className="form-group">
                        <label>Price ($)</label>
                        <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} required placeholder="150" min="0" step="0.01" />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={18} /> Save Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
