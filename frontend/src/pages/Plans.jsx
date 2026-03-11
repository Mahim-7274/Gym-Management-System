import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PlanFormModal from '../components/PlanFormModal';

export default function Plans() {
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);

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
        fetchPlans();
    }, []);

    const handleSavePlan = async (planData) => {
        try {
            const res = await fetch('http://localhost:5000/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(planData)
            });
            if (res.ok) {
                setShowModal(false);
                fetchPlans();
            }
        } catch (err) {
            console.error('Error saving plan:', err);
        }
    };

    const handleDeletePlan = async (id) => {
        if (!window.confirm('Are you sure you want to delete this plan?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/plans/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchPlans();
            }
        } catch (err) {
            console.error('Error deleting plan:', err);
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Gym Plans</h1>
                    <p>Configure and manage membership packages and pricing.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Create New Plan
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {plans.map(plan => (
                    <div key={plan._id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--accent-gradient)', filter: 'blur(50px)', opacity: '0.5' }}></div>

                        <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{plan.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '1rem 0' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>${plan.price}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>/ {plan.durationInDays} days</span>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }}>Edit Plan</button>
                            <button className="btn btn-danger" style={{ padding: '0.8rem' }} title="Delete Plan" onClick={() => handleDeletePlan(plan._id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {plans.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No plans created yet. Add one to get started!
                    </div>
                )}
            </div>

            {showModal && (
                <PlanFormModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSavePlan}
                />
            )}
        </div>
    );
}
