import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import styles from './HeroPage.module.css';
import { useStockData } from '../../hooks/useStockData';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import WatchlistModal from '../ui/WatchlistModal'; // New component
import { Star } from 'lucide-react';

const HeroPage = () => {
    const [ticker, setTicker] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWatchlist, setShowWatchlist] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { loadStockData } = useStockData();
    const { currentUser, login, logout } = useAuth();

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (ticker.trim()) {
            try {
                await loadStockData(ticker.trim().toUpperCase());
                navigate(`/analysis?ticker=${ticker.trim().toUpperCase()}`);
            } catch (error) {
                setErrorMessage(error.response?.data?.detail || error.message || "Could not find stock.");
                setShowErrorModal(true);
            }
        }
    };

    const handleCloseError = () => {
        setShowErrorModal(false);
    };

    const handleLogin = async () => {
        try {
            await login();
        } catch (error) {
            console.error("Failed to log in", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.backgroundGradient}></div>

            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>Stock Analyser</h1>
                {currentUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            className={styles.watchlistButton}
                            onClick={() => setShowWatchlist(true)}
                        >
                            <Star size={20} className={styles.starIcon} />
                        </button>
                        <span className={styles.username} >{currentUser.displayName}</span>
                        <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </header>

            <div className={styles.content}>
                <h1 className={styles.title}>Stock Analyser</h1>
                <p className={styles.subtitle}>
                    Financial analysis for the modern investor.
                </p>

                {!currentUser ? (
                    <>
                        <p className={styles.subtitleInstruction}>
                            Login to get started.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={handleLogin}
                                className={styles.loginButton}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg> Log in with Google
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className={styles.subtitleInstruction}>
                            Enter a ticker to get started.
                        </p>

                        <div className={styles.searchWrapper}>
                            <input
                                type="text"
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value)}
                                placeholder="Search ticker (e.g. MSFT)"
                                className={styles.searchInput}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e);
                                    }
                                }}
                            />
                            <Search
                                className={styles.searchIcon}
                                size={24}
                                onClick={handleSearch}
                            />
                        </div>
                    </>
                )}
            </div>
            <Modal
                isOpen={showErrorModal}
                onClose={handleCloseError}
                title="Stock Not Found"
                message={errorMessage}
            />

            {showWatchlist && (
                <WatchlistModal
                    isOpen={showWatchlist}
                    onClose={() => setShowWatchlist(false)}
                />
            )}
        </div>
    );
};

export default HeroPage;
