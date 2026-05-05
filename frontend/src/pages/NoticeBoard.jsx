import { useState, useEffect } from 'react';
import { Bell, PlusCircle, Trash2, Calendar } from 'lucide-react';

export default function NoticeBoard() {
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchNotices = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notices');
            const data = await res.json();
            setNotices(data);
        } catch (err) {
            console.error('Error fetching notices:', err);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/notices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (res.ok) {
                setTitle('');
                setContent('');
                fetchNotices();
            } else {
                console.error('Failed to post notice');
            }
        } catch (err) {
            console.error('Error posting notice:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/notices/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchNotices();
            } else {
                console.error('Failed to delete notice');
            }
        } catch (err) {
            console.error('Error deleting notice:', err);
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1>Notice Board</h1>
                <p>Post news, announcements, and holiday hours for all staff.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
                {/* --- POST NEW NOTICE FORM --- */}
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
                                    <button 
                                        onClick={() => handleDelete(notice._id)}
                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px' }}
                                        title="Delete Notice"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '1rem' }}>{notice.content}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                    <span>Posted by {notice.author}</span>
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
