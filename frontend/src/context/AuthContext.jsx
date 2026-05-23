import { useState } from 'react';
import { AuthContext } from './auth-context';

const readStoredUser = () => {
    const storedUser = localStorage.getItem('gymUser');
    const storedToken = localStorage.getItem('gymToken');

    if (!storedUser || !storedToken) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        localStorage.removeItem('gymUser');
        localStorage.removeItem('gymToken');
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readStoredUser);
    const loading = false;

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('gymUser', JSON.stringify(userData));
        localStorage.setItem('gymToken', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('gymUser');
        localStorage.removeItem('gymToken');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
