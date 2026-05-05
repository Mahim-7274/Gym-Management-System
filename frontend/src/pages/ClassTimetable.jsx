import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Edit, Plus, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { API_BASE_URL, fetchArray, requestJson } from '../utils/api';

const API_URL = `${API_BASE_URL}/api/class-timetable`;
const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const timeToMinutes = (time) => {
    const value = String(time || '').trim().toUpperCase();
    const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);

    if (!match) {
        return Number.MAX_SAFE_INTEGER;
    }

    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const meridiem = match[3];

    if (meridiem === 'AM' && hour === 12) {
        hour = 0;
    } else if (meridiem === 'PM' && hour !== 12) {
        hour += 12;
    }

    return hour * 60 + minute;
};

export default function ClassTimetable() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [classes, setClasses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        day: 'Monday',
        time: '',
        className: '',
        trainer: '',
        room: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const sortedClasses = useMemo(() => [...classes].sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        return dayDiff !== 0 ? dayDiff : timeToMinutes(a.time) - timeToMinutes(b.time);
    }), [classes]);

    const fetchClasses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchArray(API_URL, { throwOnError: true });
            setClasses(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Could not load class timetable.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            day: 'Monday',
            time: '',
            className: '',
            trainer: '',
            room: ''
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            setError('Only admins can manage timetable entries.');
            return;
        }

        try {
            await requestJson(editingId ? `${API_URL}/${editingId}` : API_URL, {
                method: editingId ? 'PUT' : 'POST',
                body: JSON.stringify(formData)
            });

            resetForm();
            await fetchClasses();
        } catch (err) {
            setError(err.message || 'Could not save class.');
        }
    };

    const handleEdit = (classEntry) => {
        setEditingId(classEntry._id);
        setFormData({
            day: classEntry.day,
            time: classEntry.time,
            className: classEntry.className,
            trainer: classEntry.trainer,
            room: classEntry.room
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this class?')) return;

        try {
            await requestJson(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchClasses();
        } catch (err) {
            setError(err.message || 'Could not delete class.');
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1>Class Timetable</h1>
                <p>View and manage group classes across the week.</p>
            </header>

            {error && <div style={errorStyle}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'minmax(320px, 380px) 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
                {isAdmin && (
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            {editingId ? <Edit size={20} color="var(--accent-primary)" /> : <Plus size={20} color="var(--accent-primary)" />}
                            {editingId ? 'Edit Class' : 'Add Class'}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Day</label>
                                <select className="form-control" name="day" value={formData.day} onChange={handleChange}>
                                    {dayOrder.map(day => <option key={day}>{day}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Time</label>
                                <input className="form-control" name="time" value={formData.time} onChange={handleChange} placeholder="07:00 AM" required />
                            </div>

                            <div className="form-group">
                                <label>Class Name</label>
                                <input className="form-control" name="className" value={formData.className} onChange={handleChange} placeholder="Yoga" required />
                            </div>

                            <div className="form-group">
                                <label>Trainer</label>
                                <input className="form-control" name="trainer" value={formData.trainer} onChange={handleChange} placeholder="Trainer name" required />
                            </div>

                            <div className="form-group">
                                <label>Room</label>
                                <input className="form-control" name="room" value={formData.room} onChange={handleChange} placeholder="Studio A" required />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
                                <button className="btn btn-primary" type="submit">
                                    <Save size={18} /> {editingId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
                    {loading ? (
                        <div style={emptyStyle}>Loading timetable...</div>
                    ) : sortedClasses.length === 0 ? (
                        <div style={emptyStyle}>No classes scheduled.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                                    <th style={thStyle}>Day</th>
                                    <th style={thStyle}>Time</th>
                                    <th style={thStyle}>Class Name</th>
                                    <th style={thStyle}>Trainer</th>
                                    <th style={thStyle}>Room</th>
                                    {isAdmin && <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedClasses.map(classEntry => (
                                    <tr key={classEntry._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={tdStyle}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                <CalendarDays size={16} color="var(--accent-primary)" /> {classEntry.day}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{classEntry.time}</td>
                                        <td style={tdStyle}>{classEntry.className}</td>
                                        <td style={tdStyle}>{classEntry.trainer}</td>
                                        <td style={tdStyle}>{classEntry.room}</td>
                                        {isAdmin && (
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button className="btn btn-secondary" onClick={() => handleEdit(classEntry)}><Edit size={16} /></button>
                                                    <button className="btn btn-danger" onClick={() => handleDelete(classEntry._id)}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

const thStyle = {
    padding: '1.2rem',
    textAlign: 'left'
};

const tdStyle = {
    padding: '1.2rem'
};

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
