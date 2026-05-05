import { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL, fetchArray } from '../utils/api';

export default function Upkeep() {
    const [machines, setMachines] = useState([]);

    const fetchMachines = async () => {
        const data = await fetchArray(`${API_BASE_URL}/api/machines`);
        setMachines(data);
    };

    useEffect(() => { fetchMachines(); }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        let note = "";
        if (newStatus === 'Broken') {
            note = prompt("What is the issue with this machine?");
            if (note === null) return; // Cancel if prompt is cancelled
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/machines/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, note: note || "All good." })
            });
            if (res.ok) fetchMachines();
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const addNewMachine = async () => {
        const name = prompt("Enter Machine Name (e.g., Treadmill 05):");
        if (!name) return;

        await fetch(`${API_BASE_URL}/api/machines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, status: 'Functional' })
        });
        fetchMachines();
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Machine Upkeep</h1>
                    <p>Monitor and report equipment status.</p>
                </div>
                <button className="btn btn-primary" onClick={addNewMachine}>
                    <Plus size={18} /> Add Machine
                </button>
            </header>

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
                                <td style={{ padding: '1.2rem', fontSize: '0.9rem', color: 'gray' }}>{m.note || '-'}</td>
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
