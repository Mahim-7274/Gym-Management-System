import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { API_BASE_URL, fetchArray, requestJson } from '../utils/api';

const API_URL = `${API_BASE_URL}/api/suggestions`;
const suggestionStatuses = ['New', 'Reviewed', 'Resolved'];

const getRoleType = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'trainer') return 'Trainer';
    if (role === 'staff') return 'Staff';
    return 'Member';
};

export default function SuggestionBox() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [suggestions, setSuggestions] = useState([]);
    const [formData, setFormData] = useState({
        name: user?.username || '',
        roleType: getRoleType(user?.role),
        category: 'Feedback',
        message: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSuggestions = useCallback(async () => {
        if (!isAdmin) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await fetchArray(API_URL, { throwOnError: true });
            setSuggestions(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Could not load suggestions.');
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await requestJson(API_URL, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            setFormData({ ...formData, message: '' });
            setSuccess('Suggestion submitted.');
            await fetchSuggestions();
        } catch (err) {
            setError(err.message || 'Could not submit suggestion.');
        }
    };

    const handleStatusChange = async (id, status) => {
        setError('');
        setSuccess('');

        try {
            await requestJson(`${API_URL}/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            setSuccess('Suggestion status updated.');
            await fetchSuggestions();
        } catch (err) {
            setError(err.message || 'Could not update suggestion status.');
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

            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'minmax(320px, 420px) 1fr' : 'minmax(320px, 520px)', gap: '2rem', alignItems: 'start' }}>
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

                {isAdmin && (
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
                                            {suggestionStatuses.map(status => (
                                                <button
                                                    key={status}
                                                    className={status === 'Resolved' ? 'btn btn-success' : 'btn btn-secondary'}
                                                    disabled={suggestion.status === status}
                                                    onClick={() => handleStatusChange(suggestion._id, status)}
                                                >
                                                    <CheckCircle size={16} /> {status}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}
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
