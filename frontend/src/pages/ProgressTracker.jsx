import React, { useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL, fetchArray, fetchJson, requestJson } from '../utils/api';

const API_URL = `${API_BASE_URL}/api/progress`;

const ProgressTracker = () => {
    const [searchParams] = useSearchParams();
    const initialMemberId = searchParams.get('memberId') || "";

    const [logs, setLogs] = useState([]);
    const [memberId, setMemberId] = useState(initialMemberId); 
    const [memberName, setMemberName] = useState(""); 
    const [formData, setFormData] = useState({ weight: '', chest: '', waist: '' });
    const [statusMessage, setStatusMessage] = useState("");

    const showMessage = (msg) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(""), 3000);
    };

    const fetchHistory = useCallback(async () => {
        const cleanId = memberId.trim();
        if (!cleanId || cleanId.length < 3) {
            setMemberName("");
            return; 
        }
        try {
            // Fetch both progress logs and member details simultaneously using api helpers that include auth tokens
            const [historyData, memberData] = await Promise.all([
                fetchArray(`${API_URL}/${cleanId}`),
                fetchJson(`${API_BASE_URL}/api/members/${cleanId}`, { name: 'Unknown Member' })
            ]);
            
            setLogs(historyData);
            setMemberName(memberData.name || 'Unknown Member');
        } catch (err) { 
            console.error("Error fetching history", err); 
        }
    }, [memberId]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (memberId) fetchHistory();
        }, 500); 

        return () => clearTimeout(delayDebounceFn);
    }, [fetchHistory, memberId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await requestJson(`${API_URL}/add`, {
                method: 'POST',
                body: JSON.stringify({ ...formData, memberId: memberId.trim() })
            });
            setFormData({ weight: '', chest: '', waist: '' });
            await fetchHistory(); 
            showMessage("✅ Progress Logged Successfully!");
        } catch { 
            showMessage("❌ Error saving progress"); 
        }
    };

    // --- DELETE LOGIC ---
    const handleDelete = async (logId) => {
        // Removed window.confirm because it is blocked in embedded preview browsers
        try {
            await requestJson(`${API_URL}/${logId}`, { method: 'DELETE' });
            fetchHistory(); // Refresh the list after successful deletion
            showMessage("✅ Log deleted");
        } catch (err) {
            console.error("Delete Error:", err);
            showMessage("❌ Error deleting log");
        }
    };

    return (
        <div style={{ padding: '40px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#00d4ff' }}>Physical Progress Tracker</h1>
            
            {statusMessage && (
                <div style={{ padding: '10px', background: '#333', color: '#00ff88', marginBottom: '20px', borderRadius: '4px', textAlign: 'center' }}>
                    {statusMessage}
                </div>
            )}

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
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Measurement History 
                    {memberName && <span style={{ color: '#00d4ff', fontSize: '0.9em', background: 'rgba(0, 212, 255, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>{memberName}</span>}
                </h3>
                {logs.length > 0 ? logs.map(log => (
                    <div key={log._id} style={historyCardStyle}>
                        <div style={{ display: 'flex', gap: '25px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>🆔 ID: {memberId}</span>
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
