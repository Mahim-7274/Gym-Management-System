import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on load
        const storedUser = localStorage.getItem('gymUser');
        const storedToken = localStorage.getItem('gymToken');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

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
            {!loading && children}
        </AuthContext.Provider>
    );
};
