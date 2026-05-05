import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dumbbell, Edit, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { API_BASE_URL, fetchArray, requestJson } from '../utils/api';

const API_URL = `${API_BASE_URL}/api/workout-plans`;

export default function WorkoutPlans() {
    const { user } = useAuth();
    const canManagePlans = ['admin', 'trainer', 'staff'].includes(user?.role);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [formData, setFormData] = useState({
        title: 'Workout Plan',
        assignedTrainer: '',
        dailyExercises: '',
        notes: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const selectedMember = useMemo(
        () => members.find(member => member._id === selectedMemberId),
        [members, selectedMemberId]
    );

    const resetForm = useCallback(() => {
        setEditingPlanId(null);
        setFormData({
            title: 'Workout Plan',
            assignedTrainer: '',
            dailyExercises: '',
            notes: ''
        });
    }, []);

    const fetchMembers = useCallback(async () => {
        const data = await fetchArray(`${API_BASE_URL}/api/members`, { throwOnError: true });
        setMembers(data);
        setSelectedMemberId(currentId => (
            data.some(member => member._id === currentId) ? currentId : data[0]?._id || ''
        ));
        if (data.length === 0) {
            setLoading(false);
        }
    }, []);

    const fetchPlans = useCallback(async (memberId) => {
        if (!memberId) {
            setPlans([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await fetchArray(`${API_URL}/member/${memberId}`, { throwOnError: true });
            setPlans(data);
            setError('');
        } catch {
            setError('Could not load workout plans.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers().catch(() => {
            setError('Could not load members.');
            setLoading(false);
        });
    }, [fetchMembers]);

    useEffect(() => {
        fetchPlans(selectedMemberId);
        resetForm();
    }, [fetchPlans, resetForm, selectedMemberId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (plan) => {
        if (!canManagePlans) return;
        setEditingPlanId(plan._id);
        setFormData({
            title: plan.title || 'Workout Plan',
            assignedTrainer: plan.assignedTrainer || '',
            dailyExercises: plan.dailyExercises || '',
            notes: plan.notes || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMemberId) {
            setError('Please select a member first.');
            return;
        }
        if (!canManagePlans) {
            setError('You do not have permission to manage workout plans.');
            return;
        }
        if (!formData.dailyExercises.trim()) {
            setError('Please add at least one daily exercise.');
            return;
        }

        try {
            await requestJson(editingPlanId ? `${API_URL}/${editingPlanId}` : API_URL, {
                method: editingPlanId ? 'PUT' : 'POST',
                body: JSON.stringify({ ...formData, memberId: selectedMemberId })
            });

            resetForm();
            await fetchPlans(selectedMemberId);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this workout plan?')) return;

        try {
            await requestJson(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchPlans(selectedMemberId);
            if (editingPlanId === id) resetForm();
        } catch (err) {
            setError(err.message || 'Could not delete workout plan.');
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1>Workout Plans</h1>
                <p>Create and manage basic exercise plans for members.</p>
            </header>

            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: canManagePlans ? 'minmax(320px, 420px) 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
                {canManagePlans && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Dumbbell size={20} color="var(--accent-primary)" />
                        {editingPlanId ? 'Edit Plan' : 'New Plan'}
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Member</label>
                            <select className="form-control" value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} required>
                                <option value="">Select member</option>
                                {members.map(member => (
                                    <option key={member._id} value={member._id}>{member.name} - {member.phone}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Plan Title</label>
                            <input className="form-control" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Beginner Strength Plan" required />
                        </div>

                        <div className="form-group">
                            <label>Assigned Trainer</label>
                            <input className="form-control" name="assignedTrainer" value={formData.assignedTrainer} onChange={handleChange} placeholder="Trainer name" />
                        </div>

                        <div className="form-group">
                            <label>Daily Exercises</label>
                            <textarea className="form-control" name="dailyExercises" rows="8" value={formData.dailyExercises} onChange={handleChange} placeholder="Monday: Squats 3x10, Pushups 3x12..." required />
                        </div>

                        <div className="form-group">
                            <label>Notes</label>
                            <textarea className="form-control" name="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder="Injury notes, intensity, rest days..." />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            {editingPlanId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
                            <button type="submit" className="btn btn-primary">
                                <Save size={18} /> {editingPlanId ? 'Update Plan' : 'Save Plan'}
                            </button>
                        </div>
                    </form>
                </div>
                )}

                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ marginBottom: '0.3rem' }}>{selectedMember ? selectedMember.name : 'Select a member'}</h2>
                        <p>{plans.length} workout plan(s)</p>
                    </div>

                    {loading ? (
                        <div className="glass-panel" style={emptyStyle}>Loading workout plans...</div>
                    ) : plans.length === 0 ? (
                        <div className="glass-panel" style={emptyStyle}>No workout plans found for this member.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {plans.map(plan => (
                                <div key={plan._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ marginBottom: '0.35rem' }}>{plan.title}</h3>
                                            <p style={{ fontSize: '0.9rem' }}>
                                                Trainer: {plan.assignedTrainer || 'Not assigned'} | Updated {new Date(plan.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {canManagePlans && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-secondary" onClick={() => handleEdit(plan)}><Edit size={16} /></button>
                                                <button className="btn btn-danger" onClick={() => handleDelete(plan._id)}><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>

                                    <pre style={preStyle}>{plan.dailyExercises}</pre>
                                    {plan.notes && <p style={{ marginTop: '1rem' }}>{plan.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const errorStyle = {
    background: 'rgba(255, 51, 102, 0.12)',
    color: 'var(--danger)',
    border: '1px solid rgba(255, 51, 102, 0.25)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem'
};

const emptyStyle = {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-secondary)'
};

const preStyle = {
    marginTop: '1rem',
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    lineHeight: 1.6,
    color: 'var(--text-primary)',
    background: 'rgba(0,0,0,0.2)',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)'
};
