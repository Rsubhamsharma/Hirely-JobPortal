import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const AuthContext = createContext();


export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    const checkAuthStatus = async () => {
        try {
            // Backend verify endpoint. Using /users/profile as verification as discussed if no dedicated check-auth exists
            // If profile fetch succeeds, we are logged in.
            const res = await api.get('/users/profile');
            if (res.data.success) {
                // Correctly set profile data. 
                // Note: The backend profile endpoint returns profile data. 
                // We might want to store user info separately if possible, but for now this confirms auth.
                setUser(res.data.data);
            }
        } catch (error) {
            // 401/403 means not logged in
            // console.log("Authorization check failed:", error.response?.status, error.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = (userData) => {
        setUser(userData);
        console.log(user)
    };

    const logout = async () => {
        try {
            await api.post('/users/logout');
            setUser(null);
            
            toast.success("Logged out successfully")
            navigate("/")
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    // Memoize the value to prevent unnecessary re-renders of consumers
    const value = useMemo(() => ({
        user,
        login,
        logout,
        loading
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
