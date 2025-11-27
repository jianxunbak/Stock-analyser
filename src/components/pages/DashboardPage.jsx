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
import { Search, ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import styles from './DashboardPage.module.css';

const DashboardPage = () => {
    const { loadStockData, error, loading } = useStockData();
    const [ticker, setTicker] = useState('');
    const [moatStatusLabel, setMoatStatusLabel] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWatchlist, setShowWatchlist] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, logout, loading: authLoading } = useAuth();

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
        e.preventDefault();

        const tickerValue = ticker.trim();

        if (!tickerValue) return; // Block empty search

        const upperTicker = tickerValue.toUpperCase();

        loadStockData(upperTicker);

        setMoatStatusLabel(null); // Reset Moat Status on new search
        localStorage.setItem('lastTicker', upperTicker);
        setSearchParams({ ticker: upperTicker }); // Update URL
    };

    const handleCloseError = () => {
        setShowErrorModal(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

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
                        <button
                            className={styles.watchlistButton}
                            onClick={() => setShowWatchlist(true)}
                        >
                            <Star size={16} className={styles.starIcon} />
                        </button>

                        {currentUser && (
                            <>
                                <span style={{ color: 'white', fontWeight: '500', marginRight: '1rem' }}>
                                    {currentUser.displayName}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        marginRight: '1rem'
                                    }}
                                >
                                    Log Out
                                </button>
                            </>
                        )}

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
                                onClick={handleSearch}
                            />
                        </div>

                    </div>

                </header>

                <Modal
                    isOpen={showErrorModal}
                    onClose={handleCloseError}
                    title="Stock Not Found"
                    message={error ? `Could not find stock. Please check the ticker and try again.\nError: ${error}` : "An error occurred."}
                />

                {showWatchlist && (
                    <WatchlistModal
                        isOpen={showWatchlist}
                        onClose={() => setShowWatchlist(false)}
                    />
                )}

                <div className={styles.grid}>
                    <div className={styles.colSpan3} style={{ position: 'relative' }}>
                        {!loading && (
                            <div
                                onClick={() => navigate('/')}
                                style={{
                                    position: 'absolute',
                                    top: '-2rem',
                                    left: '0rem',
                                    zIndex: 20,
                                    cursor: 'pointer',
                                    color: '#9ca3af',
                                    padding: '4px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                className="hover:text-white transition-colors"
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
            </div>
        </div>
    );
};

export default DashboardPage;
