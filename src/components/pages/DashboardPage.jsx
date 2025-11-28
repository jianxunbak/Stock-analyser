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
import { Search, ArrowLeft, Star, Menu, X, LogOut, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserProfileModal from '../ui/UserProfileModal';
import { FluidCard } from '../ui/FluidCard';
import CascadingHeader from '../CascadingHeader';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
    const { stockData, loadStockData, error, loading } = useStockData();
    const [ticker, setTicker] = useState('');
    const [moatStatusLabel, setMoatStatusLabel] = useState(null);
    const [isMoatEvaluating, setIsMoatEvaluating] = useState(false);
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

    const actionGroupContent = (
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
        </div>
    );

    const backButtonContent = !loading && (
        <div
            onClick={() => navigate('/')}
            className={styles.backButton}
        >
            <ArrowLeft size={20} />
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.wrapper} style={{ position: 'relative' }}>
                <div
                    className={styles.logoContainer}
                    onClick={() => navigate('/')}
                    style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        top: '20px',
                        left: '0px',
                        zIndex: 60
                    }}
                >
                    <h1 className={styles.titleText}>
                        Stock Analyser
                    </h1>
                    <TrendingUp className={styles.titleIcon} size={32} />
                </div>

                <CascadingHeader
                    topRightContent={actionGroupContent}
                    bottomLeftContent={backButtonContent}
                    gap="40px"
                />

                <Modal
                    isOpen={showErrorModal}
                    onClose={handleCloseError}
                    title="Stock Not Found"
                    message={error ? `Could not find stock. Please check the ticker and try again.\nError: ${error}` : "An error occurred."}
                />

                <div className={styles.grid}>
                    <div className={styles.colSpan3} style={{ position: 'relative' }}>
                        <FluidCard>
                            <OverviewCard moatStatusLabel={moatStatusLabel} isMoatEvaluating={isMoatEvaluating} />
                        </FluidCard>
                    </div>
                    <div className={styles.colSpan3}>
                        <FluidCard>
                            <GrowthCard />
                        </FluidCard>
                    </div>
                    <div className={styles.colSpan3}>
                        <FluidCard>
                            <ProfitabilityCard />
                        </FluidCard>
                    </div>
                    <div className={styles.colSpan3}>
                        <FluidCard>
                            <MoatCard
                                key={stockData?.overview?.symbol || 'moat-card'}
                                onMoatStatusChange={setMoatStatusLabel}
                                onIsEvaluatingChange={setIsMoatEvaluating}
                            />
                        </FluidCard>
                    </div>
                    <div className={styles.colSpan1}>
                        <FluidCard>
                            <DebtCard />
                        </FluidCard>
                    </div>

                    <div className={styles.colSpan1}>
                        <FluidCard>
                            <ValuationCard />
                        </FluidCard>
                    </div>

                    <div className={styles.colSpan1}>
                        <FluidCard>
                            <SupportResistanceCard />
                        </FluidCard>
                    </div>

                    <div className={styles.colSpan3}>
                        <FluidCard>
                            <FinancialTables />
                        </FluidCard>
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
