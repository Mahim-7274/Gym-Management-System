import { useEffect, useState } from 'react';
import { CheckCircle, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, fetchArray } from '../utils/api';

const API_URL = `${API_BASE_URL}/api/suggestions`;

export default function SuggestionBox() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [suggestions, setSuggestions] = useState([]);
    const [formData, setFormData] = useState({
        name: user?.username || '',
        roleType: user?.role === 'admin' ? 'Admin' : 'Staff',
        category: 'Feedback',
        message: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const data = await fetchArray(API_URL);
            setSuggestions(data);
            setError('');
        } catch (err) {
            setError('Could not load suggestions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Could not submit suggestion.');
            }

            setFormData({ ...formData, message: '' });
            setSuccess('Suggestion submitted.');
            fetchSuggestions();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) fetchSuggestions();
        } catch (err) {
            setError('Could not update suggestion status.');
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1>Suggestion Box</h1>
                <p>Collect ideas, complaints, and feedback from members and staff.</p>
            </header>

            {(error || success) && (
                <div style={error ? errorStyle : successStyle}>
                    {error || success}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '2rem', alignItems: 'start' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Send size={20} color="var(--accent-primary)" />
                        Submit Feedback
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Role / Type</label>
                            <select className="form-control" name="roleType" value={formData.roleType} onChange={handleChange}>
                                <option>Member</option>
                                <option>Staff</option>
                                <option>Trainer</option>
                                <option>Admin</option>
                                <option>Guest</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select className="form-control" name="category" value={formData.category} onChange={handleChange}>
                                <option>Idea</option>
                                <option>Complaint</option>
                                <option>Feedback</option>
                                <option>Maintenance</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea className="form-control" name="message" rows="6" value={formData.message} onChange={handleChange} placeholder="Write the suggestion here..." required />
                        </div>

                        <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
                            <MessageSquare size={18} /> Submit Suggestion
                        </button>
                    </form>
                </div>

                <div>
                    <h2 style={{ marginBottom: '1rem' }}>Submitted Suggestions</h2>

                    {loading ? (
                        <div className="glass-panel" style={emptyStyle}>Loading suggestions...</div>
                    ) : suggestions.length === 0 ? (
                        <div className="glass-panel" style={emptyStyle}>No suggestions submitted yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {suggestions.map(suggestion => (
                                <div key={suggestion._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ marginBottom: '0.35rem' }}>{suggestion.category}</h3>
                                            <p style={{ fontSize: '0.9rem' }}>
                                                {suggestion.name} ({suggestion.roleType}) | {new Date(suggestion.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`badge ${suggestion.status === 'Resolved' ? 'badge-active' : 'badge-expired'}`}>
                                            {suggestion.status}
                                        </span>
                                    </div>

                                    <p style={{ margin: '1rem 0', whiteSpace: 'pre-wrap' }}>{suggestion.message}</p>

                                    {isAdmin && (
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <button className="btn btn-secondary" onClick={() => handleStatusChange(suggestion._id, 'Reviewed')}>
                                                <CheckCircle size={16} /> Mark Reviewed
                                            </button>
                                            <button className="btn btn-success" onClick={() => handleStatusChange(suggestion._id, 'Resolved')}>
                                                <CheckCircle size={16} /> Mark Resolved
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const emptyStyle = {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-secondary)'
};

const errorStyle = {
    background: 'rgba(255, 51, 102, 0.12)',
    color: 'var(--danger)',
    border: '1px solid rgba(255, 51, 102, 0.25)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem'
};

const successStyle = {
    background: 'rgba(0, 255, 136, 0.12)',
    color: 'var(--success)',
    border: '1px solid rgba(0, 255, 136, 0.25)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem'
};
