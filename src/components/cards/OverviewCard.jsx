import React, { useState, useMemo, useEffect } from 'react';
import { useStockData } from '../../hooks/useStockData';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend
} from 'recharts';
import styles from './OverviewCard.module.css';
import { ChevronDown, Star } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const OverviewCard = ({ moatStatusLabel }) => {
    const { stockData, loading } = useStockData();
    const { theme } = useTheme();
    const [timeframe, setTimeframe] = useState('1Y');
    const [showDetails, setShowDetails] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    // Define chart colors based on theme
    const chartColors = useMemo(() => {
        const isDark = theme === 'dark';
        return {
            grid: isDark ? "#374151" : "#e5e7eb",
            text: isDark ? "#9CA3AF" : "#6b7280",
            tooltipBg: isDark ? "#1F2937" : "#ffffff",
            tooltipColor: isDark ? "#fff" : "#111827",
            tooltipBorder: isDark ? "none" : "1px solid #e5e7eb"
        };
    }, [theme]);

    // Check watchlist status on mount/update
    useEffect(() => {
        const checkWatchlist = () => {
            if (stockData?.overview?.symbol) {
                const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
                setIsInWatchlist(watchlist.some(item => item.ticker === stockData.overview.symbol));
            }
        };

        checkWatchlist();
        window.addEventListener('watchlist-updated', checkWatchlist);
        return () => window.removeEventListener('watchlist-updated', checkWatchlist);
    }, [stockData?.overview?.symbol]);

    const toggleWatchlist = () => {
        if (!stockData?.overview?.symbol) return;

        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        const symbol = stockData.overview.symbol;

        if (isInWatchlist) {
            // Remove
            const updated = watchlist.filter(item => item.ticker !== symbol);
            localStorage.setItem('watchlist', JSON.stringify(updated));
            setIsInWatchlist(false);
            window.dispatchEvent(new Event('watchlist-updated'));
        } else {
            // Add
            // Extract Data
            const currentPrice = stockData.overview.price || 0;
            const intrinsicValue = stockData.valuation?.intrinsicValue || 0;

            // Support & Signal Logic
            let supportLevel = null;
            let signal = "Hold";

            if (stockData.support_resistance?.levels?.length > 0) {
                const level = stockData.support_resistance.levels[0];
                supportLevel = level.price;

                // Signal Logic (matching SupportResistanceCard)
                if (currentPrice <= level.price) {
                    signal = "Buy";
                } else if (currentPrice >= level.price * 1.5) {
                    signal = "Sell";
                }
            }

            const calculatedTotal = displayedCriteria.filter(c => c.status === "Pass").length;
            const score = stockData?.score;

            const newItem = {
                ticker: symbol,
                price: currentPrice,
                score: calculatedTotal && score?.max ? ((calculatedTotal / score.max) * 100).toFixed(0) : 0,
                intrinsicValue: intrinsicValue,
                supportLevel: supportLevel,
                signal: signal
            };
            localStorage.setItem('watchlist', JSON.stringify([...watchlist, newItem]));
            setIsInWatchlist(true);
            window.dispatchEvent(new Event('watchlist-updated'));
        }
    };

    // Fetch chart data when timeframe changes
    useEffect(() => {
        if (!stockData?.overview?.symbol) return;

        const fetchChartData = async () => {
            setChartLoading(true);
            try {
                const response = await axios.get(`http://localhost:8000/api/chart/${stockData.overview.symbol}/${timeframe}`);
                setChartData(response.data.data || []);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setChartData([]);
            } finally {
                setChartLoading(false);
            }
        };

        fetchChartData();
    }, [timeframe, stockData?.overview?.symbol]);

    const formatXAxis = (tickItem) => {
        // Show time for intraday intervals (1m, 5m, 30m, 1h)
        if (tickItem.includes(' ')) {
            return tickItem.split(' ')[1]; // Extract time portion
        }
        return tickItem;
    };
    const [chartHeight, setChartHeight] = useState(400); // Default height

    useEffect(() => {
        const handleResize = () => {
            setChartHeight(window.innerWidth < 768 ? 300 : 400);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- Score Logic ---
    // Recalculate criteria with overrides
    const displayedCriteria = useMemo(() => {
        const score = stockData?.score;
        if (!score?.criteria) return [];
        return score.criteria.map(c => {
            if (c.name === "Economic Moat" && moatStatusLabel) {
                const isPass = moatStatusLabel === "Wide Moat" || moatStatusLabel === "Narrow Moat";
                return {
                    ...c,
                    status: isPass ? "Pass" : "Fail",
                    value: moatStatusLabel
                };
            }
            return c;
        });
    }, [stockData, moatStatusLabel]);

    const calculatedTotal = useMemo(() => {
        return displayedCriteria.filter(c => c.status === "Pass").length;
    }, [displayedCriteria]);

    const calculatedScoreColor = calculatedTotal >= 7 ? styles.scoreGreen : calculatedTotal >= 4 ? styles.scoreYellow : styles.scoreRed;

    // Early returns AFTER all hooks
    if (loading) return <div className={styles.loading}></div>;
    if (!stockData) return null;

    const { overview, score, history, intraday_history, news } = stockData;

    if (!overview) return <div className={styles.card}><p className="text-red-400">Overview data not available</p></div>;

    return (
        <div className={styles.card}>
            {/* Top Zone: Split into Left (Details) and Right (Score) */}
            <div className={styles.topZone}>
                {/* Left: Stock Details */}
                <div className={styles.detailsSection}>
                    <div className={styles.header}>
                        <div>
                            <div className={styles.titleRow}>
                                <h2 className={styles.companyName}>{overview.name}</h2>
                                <button
                                    onClick={toggleWatchlist}
                                    className={styles.watchlistBtn}
                                    title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                                >
                                    <Star
                                        size={24}
                                        fill={isInWatchlist ? "#F59E0B" : "none"}
                                        color={isInWatchlist ? "#F59E0B" : "#9CA3AF"}
                                    />
                                </button>
                            </div>
                            <p className={styles.ticker}>{overview.symbol} • {overview.exchange}</p>
                            <div className={styles.priceContainer}>
                                <p className={styles.price}>
                                    {overview.currency} ${overview.price?.toFixed(2)}
                                </p>
                                <p className={`${styles.change} ${overview.change >= 0 ? styles.positive : styles.negative}`}>
                                    {overview.change > 0 ? '+' : ''}{overview.change?.toFixed(2)} ({overview.changePercent ? (overview.changePercent * 100).toFixed(2) : '0.00'}%)
                                </p>
                            </div>

                            {/* Badges Row */}
                            <div className={styles.badgesContainer}>
                                <div className={styles.badge}>
                                    <span className={styles.badgeLabel}>Beta:</span>
                                    <span className={styles.badgeValue}>{overview.beta?.toFixed(2)}</span>
                                </div>
                                <div className={styles.badge}>
                                    <span className={styles.badgeLabel}>PEG:</span>
                                    <span className={styles.badgeValue}>{overview.pegRatio ? overview.pegRatio.toFixed(2) : 'N/A'}</span>
                                </div>
                                <div className={styles.badge}>
                                    <span className={styles.badgeLabel}>Mkt Cap:</span>
                                    <span className={styles.badgeValue}>${(overview.marketCap / 1e9).toFixed(2)}B</span>
                                </div>
                                <div className={styles.badge}>
                                    <span className={styles.badgeLabel}>Shares:</span>
                                    <span className={styles.badgeValue}>{stockData.sharesOutstanding ? (stockData.sharesOutstanding / 1e9).toFixed(2) + 'B' : 'N/A'}</span>
                                </div>
                                <button className={`${styles.viewDetailsBtn} ${styles.iconButton}`} onClick={() => setShowDetails(!showDetails)}>
                                    <ChevronDown className={`${styles.chevron} ${showDetails ? styles.chevronUp : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right: Scoring System */}
                <div className={styles.scoreSection}>
                    <div className={styles.scoreHeader}>
                        <h3 className={styles.scoreTitle}>Stock Health Score</h3>
                        <div className={`${styles.totalScore} ${calculatedScoreColor}`}>
                            {score?.max ? ((calculatedTotal / score.max) * 100).toFixed(0) : 0}%
                        </div>
                    </div>
                    <div className={styles.criteriaList}>
                        {displayedCriteria.map((c, idx) => (
                            <div key={idx} className={styles.criteriaItem}>
                                <span className={styles.criteriaName}>{c.name}</span>
                                <span className={`${styles.criteriaStatus} ${c.status === 'Pass' ? styles.pass : styles.fail}`}>
                                    {c.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.scrollIndicator}>
                        <span className={styles.scrollText}>Scroll for details</span>
                        <ChevronDown size={14} className={styles.scrollIcon} />
                    </div>
                </div>
            </div>

            {/* Details Modal / Expandable Section */}
            {showDetails && (
                <div className={styles.detailsModal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalSection}>
                            <h4>Description</h4>
                            <p className={styles.description}>{overview.description}</p>
                        </div>
                        <div className={styles.modalGrid}>
                            <div className={styles.detailsColumn}>
                                <div className={styles.modalSection}>
                                    <h4>CEO</h4>
                                    <p>{overview.ceo}</p>
                                </div>
                                <div className={styles.modalSection}>
                                    <h4>Sector</h4>
                                    <p>{overview.sector}</p>
                                </div>
                                <div className={styles.modalSection}>
                                    <h4>Industry</h4>
                                    <p>{overview.industry}</p>
                                </div>
                            </div>

                            <div className={styles.eventsColumn}>
                                <div className={styles.modalSection}>
                                    <h4>Earnings and Revenues</h4>
                                    {stockData.calendar && Object.keys(stockData.calendar).length > 0 ? (
                                        <ul className={styles.eventsList}>
                                            {Object.entries(stockData.calendar).map(([key, value]) => (
                                                <li key={key} className={styles.eventItem}>
                                                    <strong className={styles.eventKey}>{key}:</strong>
                                                    <span className={styles.eventValue}>
                                                        {Array.isArray(value) ? value.join(", ") : String(value)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p>No other details avaliable.</p>}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Bottom Zone: Chart */}
            <div className={styles.bottomZone}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Price History</h3>
                    <div className={styles.timeframeControls}>
                        {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'].map(tf => (
                            <button
                                key={tf}
                                className={`${styles.tfButton} ${timeframe === tf ? styles.activeTf : ''}`}
                                onClick={() => setTimeframe(tf)}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.chartContainer}>
                    {chartLoading || chartData.length === 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <p>
                                {chartLoading ? 'Loading chart...' : 'Chart data not available.'}
                            </p>
                        </div>
                    ) : (
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                    <XAxis
                                        dataKey="date"
                                        stroke={chartColors.text}
                                        tickFormatter={formatXAxis}
                                        minTickGap={30}
                                        tick={{ fontSize: 10, fill: chartColors.text }}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        stroke={chartColors.text}
                                        tick={{ fontSize: 10, fill: chartColors.text }}

                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: chartColors.tooltipBg,
                                            border: chartColors.tooltipBorder,
                                            color: chartColors.tooltipColor,
                                            borderRadius: '15px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            fontSize: '12px',


                                        }}
                                        formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
                                        itemStyle={{ margin: '0', padding: '0' }}
                                        labelStyle={{
                                            margin: '0 0 3px 0', // Collapse top/bottom margin, but leave a small gap (3px) below the label
                                            padding: '0',
                                            fontWeight: 'bold' // Optional, to make the label stand out
                                        }}
                                    />

                                    <Legend wrapperStyle={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: 10, paddingLeft: 35, fontSize: '12px', alignItems: 'center' }} />
                                    <Area type="monotone" dataKey="close" stroke="#3B82F6" fillOpacity={1} fill="url(#colorPrice)" name="Price" />
                                    {/* SMAs - Show on all timeframes - Order: 50, 100, 150, 200 */}
                                    <Line type="monotone" dataKey="SMA_50" stroke="#3B82F6" strokeDasharray="5 5" dot={false} name="50 SMA" strokeWidth={2} />
                                    <Line type="monotone" dataKey="SMA_100" stroke="#F59E0B" strokeDasharray="5 5" dot={false} name="100 SMA" strokeWidth={2} />
                                    <Line type="monotone" dataKey="SMA_150" stroke="#10B981" strokeDasharray="5 5" dot={false} name="150 SMA" strokeWidth={2} />
                                    <Line type="monotone" dataKey="SMA_200" stroke="#EF4444" strokeDasharray="5 5" dot={false} name="200 SMA" strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewCard;
