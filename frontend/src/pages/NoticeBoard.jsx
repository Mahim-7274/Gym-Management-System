import { useState, useEffect } from 'react';
import { Bell, PlusCircle, Trash2, Calendar } from 'lucide-react';
import { API_BASE_URL, fetchArray, requestJson } from '../utils/api';
import { useAuth } from '../context/useAuth';

export default function NoticeBoard() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const showMessage = (msg) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(""), 3000);
    };

    const fetchNotices = async () => {
        const data = await fetchArray(`${API_BASE_URL}/api/notices`);
        setNotices(data);
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            await requestJson(`${API_BASE_URL}/api/notices`, {
                method: 'POST',
                body: JSON.stringify({ 
                    title, 
                    content,
                    author: user.username // Automatically attach the logged-in user's name
                })
            });

            setTitle('');
            setContent('');
            fetchNotices();
            showMessage("✅ Notice Posted Successfully!");
        } catch (err) {
            console.error('Error posting notice:', err);
            showMessage("❌ Failed to post notice");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        // Removed window.confirm for preview browser compatibility
        try {
            await requestJson(`${API_BASE_URL}/api/notices/${id}`, {
                method: 'DELETE'
            });
            fetchNotices();
            showMessage("✅ Notice Deleted");
        } catch (err) {
            console.error('Error deleting notice:', err);
            showMessage("❌ Failed to delete notice");
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1>Notice Board</h1>
                <p>Post news, announcements, and holiday hours for all staff.</p>
            </header>

            {statusMessage && (
                <div style={{ padding: '10px', background: '#333', color: '#00ff88', marginBottom: '20px', borderRadius: '4px', textAlign: 'center' }}>
                    {statusMessage}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 2fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
                {/* --- POST NEW NOTICE FORM (ADMIN ONLY) --- */}
                {isAdmin && (
                    <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <PlusCircle size={20} color="var(--primary)" />
                            Post a Notice
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label>Title</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="e.g. Holiday Hours" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea 
                                    className="form-control" 
                                    placeholder="Write the announcement here..." 
                                    rows="5"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
                                {isSubmitting ? 'Posting...' : 'Post Notice'}
                            </button>
                        </form>
                    </div>
                )}

                {/* --- NOTICES LIST --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {notices.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                            <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p>No notices posted yet.</p>
                        </div>
                    ) : (
                        notices.map(notice => (
                            <div key={notice._id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{notice.title}</h3>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => handleDelete(notice._id)}
                                            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px' }}
                                            title="Delete Notice"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '1rem' }}>{notice.content}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                    <span>Posted by {notice.author || 'Admin'}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Calendar size={14} />
                                        {new Date(notice.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
