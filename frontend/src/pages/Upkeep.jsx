import { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL, fetchArray } from '../utils/api';

export default function Upkeep() {
    const [machines, setMachines] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMachineName, setNewMachineName] = useState("");
    const [showIssueForm, setShowIssueForm] = useState(null); // stores machine ID if open
    const [issueNote, setIssueNote] = useState("");

    const fetchMachines = async () => {
        const data = await fetchArray(`${API_BASE_URL}/api/machines`);
        setMachines(data);
    };

    useEffect(() => { fetchMachines(); }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        if (newStatus === 'Broken') {
            setShowIssueForm(id);
            setIssueNote("");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/machines/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, note: "All good." })
            });
            if (res.ok) fetchMachines();
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const submitBrokenReport = async () => {
        if (!showIssueForm) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/machines/${showIssueForm}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Broken', note: issueNote || "Broken" })
            });
            if (res.ok) {
                fetchMachines();
                setShowIssueForm(null);
            }
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const submitNewMachine = async () => {
        if (!newMachineName) return;

        await fetch(`${API_BASE_URL}/api/machines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newMachineName, status: 'Functional' })
        });
        
        setNewMachineName("");
        setShowAddForm(false);
        fetchMachines();
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Machine Upkeep</h1>
                    <p>Monitor and report equipment status.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                    <Plus size={18} /> Add Machine
                </button>
            </header>

            {/* In-line Add Form */}
            {showAddForm && (
                <div className="glass-panel" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter Machine Name (e.g., Treadmill 05)" 
                        value={newMachineName}
                        onChange={(e) => setNewMachineName(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button className="btn btn-primary" onClick={submitNewMachine}>Save</button>
                    <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
            )}

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                            <th style={{ padding: '1.2rem' }}>Machine</th>
                            <th style={{ padding: '1.2rem' }}>Status</th>
                            <th style={{ padding: '1.2rem' }}>Last Fixed</th>
                            <th style={{ padding: '1.2rem' }}>Notes</th>
                            <th style={{ padding: '1.2rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {machines.map(m => (
                            <tr key={m._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{m.name}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span className={`badge ${m.status === 'Functional' ? 'badge-active' : 'badge-expired'}`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    {m.lastFixed ? new Date(m.lastFixed).toLocaleDateString() : 'N/A'}
                                </td>
                                <td style={{ padding: '1.2rem', fontSize: '0.9rem', color: 'gray' }}>
                                    {showIssueForm === m._id ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="What's wrong?" 
                                                value={issueNote}
                                                onChange={(e) => setIssueNote(e.target.value)}
                                                style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                            />
                                            <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem' }} onClick={submitBrokenReport}>Save</button>
                                            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setShowIssueForm(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        m.note || '-'
                                    )}
                                </td>
                                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                    {m.status === 'Functional' ? (
                                        <button className="btn btn-danger" onClick={() => handleUpdateStatus(m._id, 'Broken')}>
                                            <AlertTriangle size={14} /> Report Broken
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary" style={{ background: '#00ff88', color: 'black' }} onClick={() => handleUpdateStatus(m._id, 'Functional')}>
                                            <CheckCircle size={14} /> Fixed
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
