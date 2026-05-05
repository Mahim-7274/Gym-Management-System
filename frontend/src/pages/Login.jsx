import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user, data.token);
                navigate('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch {
            setError('Server error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            background: 'var(--bg-dark)',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1000
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem', textAlign: 'center' }}>
                <h1 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                    AURA FITNESS
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sign in to your account</p>

                {error && (
                    <div style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} /> Username</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="admin or staff" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={16} /> Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.8rem' }}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                
                <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                    <p>Demo Accounts:</p>
                    <p>Admin: admin / password123</p>
                    <p>Staff: staff / password123</p>
                </div>
            </div>
        </div>
    );
}
