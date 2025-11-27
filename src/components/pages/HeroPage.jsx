import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Menu, X, LogOut } from 'lucide-react';
import styles from './HeroPage.module.css';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import ThemeToggle from '../ui/ThemeToggle';
import WatchlistModal from '../ui/WatchlistModal';
import UserProfileModal from '../ui/UserProfileModal';

const HeroPage = () => {
    const [ticker, setTicker] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWatchlist, setShowWatchlist] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const navigate = useNavigate();
    const { currentUser, login, logout } = useAuth();

    // Click outside to close menu
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest(`.${styles.mobileMenu}`) && !event.target.closest(`.${styles.menuButton}`)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const trimmedTicker = ticker.trim().toUpperCase();
        if (!trimmedTicker) return;

        setIsValidating(true); // Start loading

        // Validate ticker before navigating
        try {
            const response = await fetch(`/api/stock/${trimmedTicker}`);
            if (!response.ok) {
                setIsValidating(false); // Stop loading on error
                setErrorMessage('Invalid stock ticker. Please try again.');
                setShowErrorModal(true);
                return;
            }
            // If valid, navigate
            navigate(`/analysis?ticker=${trimmedTicker}`);
            // Note: We don't set isValidating(false) here because we want the loading screen to persist until unmount/navigation completes
        } catch (error) {
            console.error("Error validating ticker:", error);
            setIsValidating(false); // Stop loading on error
            setErrorMessage('Error validating ticker. Please check your connection.');
            setShowErrorModal(true);
        }
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

    const handleCloseError = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>Stock Analyser</h1>

                {/* Desktop Actions */}
                <div className={styles.desktopActions}>
                    {currentUser ? (
                        <>
                            <button
                                className={styles.watchlistButton}
                                onClick={() => setShowWatchlist(true)}
                            >
                                <Star size={25} className={styles.starIcon} />
                            </button>

                            <button
                                className={styles.userButton}
                                onClick={() => setShowProfileModal(true)}
                                title="User Profile"
                            >
                                {currentUser.photoURL ? (
                                    <img src={currentUser.photoURL} alt="User" className={styles.userAvatarSmall} />
                                ) : (
                                    <div className={styles.userAvatarPlaceholder}>
                                        {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={handleLogout}
                                className={styles.watchlistButton} // Reuse icon button style
                                title="Log Out"
                            >
                                <LogOut size={25} className={styles.starIcon} />
                            </button>
                        </>
                    ) : (
                        <ThemeToggle />
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={styles.menuButton}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Menu size={24} />
                </button>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className={styles.mobileMenu}>
                        {currentUser ? (
                            <>
                                <button
                                    className={styles.watchlistButton}
                                    onClick={() => {
                                        setShowWatchlist(true);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <Star size={20} className={styles.starIcon} />
                                </button>

                                <button
                                    className={styles.userButton}
                                    onClick={() => {
                                        setShowProfileModal(true);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="User" className={styles.userAvatarSmall} />
                                    ) : (
                                        <div className={styles.userAvatarPlaceholder}>
                                            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className={styles.watchlistButton}
                                    title="Log Out"
                                >
                                    <LogOut size={20} className={styles.starIcon} />
                                </button>
                            </>
                        ) : (
                            <ThemeToggle />
                        )}
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

                        <div className={`${styles.searchWrapper} ${isSearchExpanded ? styles.searchExpanded : ''}`}>
                            <Search
                                className={styles.searchIcon}
                                size={24}
                                onClick={() => {
                                    if (ticker.trim()) {
                                        handleSearch();
                                    } else {
                                        setIsSearchExpanded(!isSearchExpanded);
                                    }
                                }}
                            />
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
                                onBlur={() => {
                                    if (!ticker.trim()) {
                                        setIsSearchExpanded(false);
                                    }
                                }}
                                autoFocus={isSearchExpanded}
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

            {showProfileModal && currentUser && (
                <UserProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    user={currentUser}
                />
            )}

            {isValidating && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <div className={styles.loadingText}>Validating Ticker...</div>
                </div>
            )}
        </div>
    );
};

export default HeroPage;
