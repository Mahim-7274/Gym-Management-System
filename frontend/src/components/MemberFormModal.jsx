import { useState, useEffect, useRef } from 'react';
import { X, Save, Camera, User } from 'lucide-react';
import { API_BASE_URL, fetchArray } from '../utils/api';

const formatDateForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

export default function MemberFormModal({ onClose, onSave, initialData = null }) {
    const [plans, setPlans] = useState([]);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        customId: initialData?.customId || '',
        phone: initialData?.phone || '',
        dateOfBirth: formatDateForInput(initialData?.dateOfBirth),
        emergencyContactName: initialData?.emergencyContactName || '',
        emergencyContactPhone: initialData?.emergencyContactPhone || '',
        healthNotes: initialData?.healthNotes || '',
        planId: initialData?.currentPlan?._id || ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(initialData?.profilePicture ? `${API_BASE_URL}${initialData.profilePicture}` : null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchPlans = async () => {
            const data = await fetchArray(`${API_BASE_URL}/api/plans`);
            setPlans(data);
            if (!formData.planId && data.length > 0 && !initialData) {
                setFormData(prev => ({ ...prev, planId: data[0]._id }));
            }
        };
        fetchPlans();
    }, [initialData, formData.planId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('name', formData.name);
        if (formData.customId) data.append('customId', formData.customId);
        data.append('phone', formData.phone);
        data.append('dateOfBirth', formData.dateOfBirth || '');
        if (formData.emergencyContactName) data.append('emergencyContactName', formData.emergencyContactName);
        if (formData.emergencyContactPhone) data.append('emergencyContactPhone', formData.emergencyContactPhone);
        if (formData.healthNotes) data.append('healthNotes', formData.healthNotes);
        if (formData.planId) {
            data.append('planId', formData.planId);
            data.append('currentPlan', formData.planId);
        }
        if (selectedFile) {
            data.append('profilePicture', selectedFile);
        }

        onSave(data, initialData?._id);
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
                    {/* Profile Picture Upload */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            style={{ 
                                width: '100px', height: '100px', borderRadius: '50%', 
                                border: '2px dashed rgba(255,255,255,0.3)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', position: 'relative',
                                background: 'rgba(255,255,255,0.05)'
                            }}
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={40} color="rgba(255,255,255,0.3)" />
                            )}
                            <div style={{ 
                                position: 'absolute', bottom: '0', left: '0', right: '0', 
                                background: 'rgba(0,0,0,0.6)', padding: '4px', textAlign: 'center'
                            }}>
                                <Camera size={14} />
                            </div>
                        </div>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Ali Khan" />
                        </div>

                        <div className="form-group">
                            <label>Member ID (Optional)</label>
                            <input type="text" className="form-control" name="customId" value={formData.customId} onChange={handleChange} placeholder="e.g. 1001" />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 234 567 8900" />
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" className="form-control" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
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
