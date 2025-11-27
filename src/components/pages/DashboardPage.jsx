import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStockData } from '../../hooks/useStockData';
import { useAuth } from '../../context/AuthContext';
import OverviewCard from '../cards/OverviewCard';
import GrowthCard from '../cards/GrowthCard';
import MoatCard from '../cards/MoatCard';
import ProfitabilityCard from '../cards/ProfitabilityCard';
import DebtCard from '../cards/DebtCard';
import ValuationCard from '../cards/ValuationCard';
import SupportResistanceCard from '../cards/SupportResistanceCard';
import FinancialTables from '../cards/FinancialTables';
import NewsEstimates from '../cards/NewsEstimates';
import Modal from '../ui/Modal';
import WatchlistModal from '../ui/WatchlistModal';
import { Search, ArrowLeft, Star, Menu, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserProfileModal from '../ui/UserProfileModal';
import styles from './DashboardPage.module.css';

// ...

const DashboardPage = () => {
    const { loadStockData, error, loading } = useStockData();
    const [ticker, setTicker] = useState('');
    const [moatStatusLabel, setMoatStatusLabel] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWatchlist, setShowWatchlist] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, logout, loading: authLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Persistence: Load ticker from localStorage or URL on mount
    useEffect(() => {
        const urlTicker = searchParams.get('ticker');
        const savedTicker = localStorage.getItem('lastTicker');

        if (urlTicker) {
            setTicker(urlTicker);
            loadStockData(urlTicker);
            localStorage.setItem('lastTicker', urlTicker);
        } else if (savedTicker) {
            setTicker(savedTicker);
            loadStockData(savedTicker);
        }
    }, []); // Only run on mount

    // Auth Protection
    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/');
        }
    }, [authLoading, currentUser, navigate]);

    // Error Handling: Show Modal on error
    useEffect(() => {
        if (error) {
            setShowErrorModal(true);
        }
    }, [error]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();

        const tickerValue = ticker.trim();

        if (!tickerValue) return; // Block empty search

        const upperTicker = tickerValue.toUpperCase();

        loadStockData(upperTicker);

        setMoatStatusLabel(null); // Reset Moat Status on new search
        localStorage.setItem('lastTicker', upperTicker);
        setSearchParams({ ticker: upperTicker }); // Update URL
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleSearchIconClick = (e) => {
        if (ticker.trim()) {
            handleSearch(e);
        }
    };

    const handleCloseError = () => {
        setShowErrorModal(false);
    };

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

    if (authLoading) return <div>Loading...</div>; // Or a spinner

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <header className={styles.header}>
                    <h1
                        className={styles.title}
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        Stock Analyser
                    </h1>

                    <div className={styles.actionGroup}>
                        {/* Search Bar - Always Visible */}
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value)}
                                placeholder="Search..."
                                className={styles.searchInput}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSearch(e);
                                    }
                                }}
                            />
                            <Search
                                className={styles.searchIcon}
                                onClick={handleSearchIconClick}
                            />
                        </div>

                        {/* Desktop Actions */}
                        <div className={styles.desktopActions}>
                            <button
                                className={styles.watchlistButton}
                                onClick={() => setShowWatchlist(true)}
                            >
                                <Star size={16} className={styles.starIcon} />
                            </button>

                            {currentUser && (
                                <>
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
                                        className={styles.watchlistButton}
                                        title="Log Out"
                                    >
                                        <LogOut size={16} className={styles.starIcon} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className={styles.menuButton}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMenuOpen && (
                        <div className={styles.mobileMenu}>
                            <button
                                className={styles.watchlistButton}
                                onClick={() => {
                                    setShowWatchlist(true);
                                    setIsMenuOpen(false);
                                }}
                            >
                                <Star size={16} className={styles.starIcon} />
                            </button>

                            {currentUser && (
                                <>
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
                                        <LogOut size={16} className={styles.starIcon} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                </header>

                <Modal
                    isOpen={showErrorModal}
                    onClose={handleCloseError}
                    title="Stock Not Found"
                    message={error ? `Could not find stock. Please check the ticker and try again.\nError: ${error}` : "An error occurred."}
                />

                <div className={styles.grid}>
                    <div className={styles.colSpan3} style={{ position: 'relative' }}>
                        {!loading && (
                            <div
                                onClick={() => navigate('/')}
                                className={styles.backButton}
                            >
                                <ArrowLeft size={20} />
                            </div>
                        )}
                        <OverviewCard moatStatusLabel={moatStatusLabel} />
                    </div>
                    <div className={styles.colSpan3}>
                        <GrowthCard />
                    </div>
                    <div className={styles.colSpan3}>
                        <ProfitabilityCard />
                    </div>
                    <div className={styles.colSpan3}>
                        <MoatCard onMoatStatusChange={setMoatStatusLabel} />
                    </div>
                    <div className={styles.colSpan1}>
                        <DebtCard />
                    </div>

                    <div className={styles.colSpan1}>
                        <ValuationCard />
                    </div>

                    <div className={styles.colSpan1}>
                        <SupportResistanceCard />
                    </div>

                    <div className={styles.colSpan3}>
                        <FinancialTables />
                    </div>
                </div>

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
            </div>
        </div>
    );
};

export default DashboardPage;
