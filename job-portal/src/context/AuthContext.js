import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const AuthContext = createContext(null);


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check authentication status on mount
    const checkAuthStatus = useCallback(async () => {
        try {
            // The backend uses HTTP-only cookies for authentication
            // Cookies are automatically sent with withCredentials: true in axios config
            const res = await api.get('/users/profile');

            // Backend returns: { statusCode, data: user, message, success }
            if (res.data.success && res.data.data) {
                const userData = res.data.data;
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            // 401/403 means not logged in - this is expected for unauthenticated users
            if (error.response?.status === 401 || error.response?.status === 403) {
            } else {
                console.error('Auth check error:', error.message);
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Login function - called after successful login API call
    // The backend sets HTTP-only cookies, we just need to store user data
    const login = useCallback((userData) => {
        console.log('Login called with user data:', userData);
        setUser(userData);
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await api.post('/users/logout');
            setUser(null);
            toast.success("Logged out successfully");
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
            // Even if logout API fails, clear local state
            setUser(null);
            toast.error("Logout encountered an issue");
            navigate("/");
        }
        finally {
            setLoading(false);
        }
    }, [navigate]);

    // Refresh user data from backend
    const refreshUser = useCallback(async () => {
        try {
            const res = await api.get('/users/profile');
            if (res.data.success && res.data.data) {
                setUser(res.data.data);
                return res.data.data;
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
            setUser(null);
        }
        return null;
    }, []);


    // Memoize the value to prevent unnecessary re-renders of consumers
    const value = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user
    }), [user, loading, login, logout, refreshUser]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
