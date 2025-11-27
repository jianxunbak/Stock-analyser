import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const logout = () => {
        return signOut(auth);
    };

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, (user) => {
    //         setCurrentUser(user);
    //         setLoading(false);
    //     });

    //     return unsubscribe;
    // }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // --- SECURITY CHECK START ---

                // 1. Get the list from Vercel/Environment
                // Format expected: "john@gmail.com,jane@gmail.com"
                const allowedString = import.meta.env.VITE_FIREBASE_EMAIL || "";

                // 2. Clean the list: split by comma, remove spaces, make lowercase
                const allowedList = allowedString
                    .split(',')
                    .map(email => email.trim().toLowerCase());

                // 3. Clean the user's email
                const userEmail = user.email ? user.email.toLowerCase() : "";

                // 4. The Decision Logic
                if (allowedList.includes(userEmail)) {
                    // SUCCESS: User is on the list
                    setCurrentUser(user);
                } else {
                    // FAIL: User is NOT on the list
                    console.warn(`Unauthorized login attempt by: ${userEmail}`);
                    alert("Access Denied: You are not authorized to use this app.");

                    // Force them to log out immediately
                    await signOut(auth);
                    setCurrentUser(null);
                }
                // --- SECURITY CHECK END ---
            } else {
                // User is logged out
                setCurrentUser(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
