import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const ProgressTracker = () => {
    const [logs, setLogs] = useState([]);
    const [memberId, setMemberId] = useState(""); 
    const [formData, setFormData] = useState({ weight: '', chest: '', waist: '' });

    const API_URL = `${API_BASE_URL}/api/progress`;

    const fetchHistory = async () => {
        const cleanId = memberId.trim();
        if (!cleanId || cleanId.length < 5) return; 
        try {
            const res = await axios.get(`${API_URL}/${cleanId}`);
            setLogs(Array.isArray(res.data) ? res.data : []);
        } catch (err) { 
            console.error("Error fetching history", err); 
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (memberId) fetchHistory();
        }, 500); 

        return () => clearTimeout(delayDebounceFn);
    }, [memberId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/add`, { ...formData, memberId: memberId.trim() });
            setFormData({ weight: '', chest: '', waist: '' });
            await fetchHistory(); 
            alert("Progress Logged!");
        } catch (err) { 
            alert("Error saving progress"); 
        }
    };

    // --- DELETE LOGIC ---
    const handleDelete = async (logId) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            try {
                // We send the specific MongoDB _id to the delete route
                await axios.delete(`${API_URL}/${logId}`);
                fetchHistory(); // Refresh the list after successful deletion
            } catch (err) {
                console.error("Delete Error:", err);
                alert("Error deleting log");
            }
        }
    };

    return (
        <div style={{ padding: '40px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#00d4ff' }}>Physical Progress Tracker</h1>
            
            <div style={{ marginBottom: '30px' }}>
                <label>Enter Member ID to Track:</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Paste Member ID here..." 
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                        style={inputStyle} 
                    />
                    <button onClick={fetchHistory} style={buttonStyle}>Refresh List</button>
                </div>
            </div>

            {memberId && (
                <form onSubmit={handleSubmit} style={formBoxStyle}>
                    <h3>New Monthly Entry</h3>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <input type="number" placeholder="Weight (kg)" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} style={inputStyle} required />
                        <input type="number" placeholder="Chest (inch)" value={formData.chest} onChange={(e) => setFormData({...formData, chest: e.target.value})} style={inputStyle} />
                        <input type="number" placeholder="Waist (inch)" value={formData.waist} onChange={(e) => setFormData({...formData, waist: e.target.value})} style={inputStyle} />
                        <button type="submit" style={saveButtonStyle}>Save Stats</button>
                    </div>
                </form>
            )}

            <div style={{ marginTop: '30px' }}>
                <h3>Measurement History</h3>
                {logs.length > 0 ? logs.map(log => (
                    <div key={log._id} style={historyCardStyle}>
                        <div style={{ display: 'flex', gap: '25px', flex: 1 }}>
                            <span>📅 {new Date(log.date).toLocaleDateString()}</span>
                            <span>⚖️ <strong>{log.weight} kg</strong></span>
                            <span>📏 {log.chest}in Chest</span>
                            <span>📏 {log.waist}in Waist</span>
                        </div>
                        
                        <button 
                            onClick={() => handleDelete(log._id)} 
                            style={deleteButtonStyle}
                        >
                            Delete
                        </button>
                    </div>
                )) : <p style={{color: '#666'}}>No records found for this ID.</p>}
            </div>
        </div>
    );
};

// Styles
const inputStyle = { padding: '12px', background: '#1a1a1a', color: 'white', border: '1px solid #333', borderRadius: '4px', flex: 1 };
const buttonStyle = { padding: '10px 20px', background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff', borderRadius: '4px', cursor: 'pointer' };
const saveButtonStyle = { padding: '10px 20px', background: '#00d4ff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const deleteButtonStyle = { padding: '6px 12px', background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' };
const formBoxStyle = { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid #00d4ff', marginBottom: '20px' };
const historyCardStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#111', marginBottom: '10px', borderRadius: '8px', borderLeft: '4px solid #00d4ff' };

export default ProgressTracker;
