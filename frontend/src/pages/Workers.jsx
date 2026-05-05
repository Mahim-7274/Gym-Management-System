import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const Workers = () => {
    const [workers, setWorkers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // NEW: For the search bar
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', workHours: 0 });

    const API_URL = `${API_BASE_URL}/api/workers`;

    useEffect(() => { fetchWorkers(); }, []);

    const fetchWorkers = async () => {
        try {
            const res = await axios.get(API_URL);
            setWorkers(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Error fetching:", err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/add`, formData);
            setFormData({ name: '', phone: '', email: '', workHours: 0 });
            fetchWorkers();
        } catch (err) { alert("Error adding worker"); }
    };

    const handleAddHour = async (id, currentHours) => {
        try {
            await axios.patch(`${API_URL}/${id}`, { workHours: (currentHours || 0) + 1 });
            fetchWorkers();
        } catch (err) { console.error("Could not update hours.", err); }
    };

    // FEATURE 7 LOGIC: Filter the list based on Name, Phone, or ID
    const filteredWorkers = workers.filter(worker => 
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phone.includes(searchTerm) ||
        worker._id.includes(searchTerm)
    );

    return (
        <div style={{ padding: '40px', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ color: '#00d4ff' }}>Admin Dashboard: Workers</h1>
            
            {/* SEARCH BAR SECTION */}
            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search by Name, Phone, or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        border: '2px solid #00d4ff', 
                        background: '#1a1a1a', 
                        color: 'white',
                        fontSize: '1rem'
                    }} 
                />
            </div>

            {/* ADD WORKER FORM (Same as before) */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle} required />
                <input type="text" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={inputStyle} required />
                <button type="submit" style={buttonStyle}>Add Trainer</button>
            </form>

            {/* RESULTS SECTION */}
            <div style={{ display: 'grid', gap: '15px' }}>
                {filteredWorkers.length > 0 ? (
                    filteredWorkers.map(worker => (
                        <div key={worker._id} style={cardStyle}>
                            <div>
                                <h3 style={{ margin: 0 }}>{worker.name}</h3>
                                <p style={{ margin: '5px 0', color: '#aaa', fontSize: '0.8rem' }}>ID: {worker._id}</p>
                                <p style={{ margin: 0, color: '#00d4ff' }}>{worker.phone}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{worker.workHours || 0} hrs</div>
                                <button onClick={() => handleAddHour(worker._id, worker.workHours)} style={logBtnStyle}>+ Log Hour</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>No workers found matching "{searchTerm}"</p>
                )}
            </div>
        </div>
    );
};

// Styles for better look
const inputStyle = { padding: '10px', background: '#1a1a1a', color: 'white', border: '1px solid #333', borderRadius: '4px', flex: 1 };
const buttonStyle = { padding: '10px 20px', background: '#00d4ff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const cardStyle = { padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const logBtnStyle = { marginTop: '8px', padding: '5px 12px', background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff', borderRadius: '4px', cursor: 'pointer' };

export default Workers;
