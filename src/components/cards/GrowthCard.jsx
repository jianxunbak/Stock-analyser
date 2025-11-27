import React, { useMemo } from 'react';
import { useStockData } from '../../hooks/useStockData';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart
} from 'recharts';
import styles from './GrowthCard.module.css';
import { useTheme } from '../../context/ThemeContext';

const GrowthCard = () => {
    const { stockData, loading } = useStockData();
    const [barSize, setBarSize] = React.useState(20);
    const [chartHeight, setChartHeight] = React.useState(300);

    React.useEffect(() => {
        const handleResize = () => {
            // Use 400px for desktop (>= 768px), 300px for mobile (< 768px)
            setChartHeight(window.innerWidth < 768 ? 300 : 400);

            // Keep the bar size logic here too
            setBarSize(window.innerWidth < 768 ? 2 : 30);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Define chart colors based on theme
    const { theme } = useTheme();
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

    if (loading) return <div className={styles.loading}></div>;
    if (!stockData) return null;

    const { growth } = stockData;

    // Prepare data for charts
    const prepareChartData = () => {
        if (!growth.tables) return [];

        const revenue = growth.tables.total_revenue || [];
        const netIncome = growth.tables.net_income || [];
        const opIncome = growth.tables.operating_income || [];
        const ocf = growth.tables.operating_cash_flow || [];

        // Merge by date
        const merged = revenue.map(r => {
            const ni = netIncome.find(n => n.date === r.date);
            const oi = opIncome.find(o => o.date === r.date);
            const o = ocf.find(c => c.date === r.date);
            return {
                date: r.date,
                revenue: r.value,
                netIncome: ni ? ni.value : 0,
                opIncome: oi ? oi.value : 0,
                ocf: o ? o.value : 0
            };
        }).reverse(); // Oldest to newest

        return merged;
    };

    const prepareMarginData = () => {
        if (!growth.tables) return [];

        const gross = growth.tables.gross_margin || [];
        const net = growth.tables.net_margin || [];

        const merged = gross.map(g => {
            const n = net.find(nm => nm.date === g.date);
            return {
                date: g.date,
                grossMargin: g.value,
                netMargin: n ? n.value : 0
            };
        }).reverse();

        return merged;
    };

    let financialData = prepareChartData();
    let marginData = prepareMarginData();

    // MOCK DATA FALLBACK (DEBUGGING)
    if (financialData.length === 0) {
        console.warn("Using Mock Data for Financial Chart");
        financialData = [
            { date: '2021', revenue: 168000000000, netIncome: 61000000000, ocf: 76000000000 },
            { date: '2022', revenue: 198000000000, netIncome: 72000000000, ocf: 89000000000 },
            { date: '2023', revenue: 211000000000, netIncome: 72000000000, ocf: 87000000000 },
            { date: '2024', revenue: 245000000000, netIncome: 88000000000, ocf: 110000000000 },
        ];
    }
    if (marginData.length === 0) {
        marginData = [
            { date: '2021', grossMargin: 68, netMargin: 36 },
            { date: '2022', grossMargin: 68, netMargin: 36 },
            { date: '2023', grossMargin: 69, netMargin: 34 },
            { date: '2024', grossMargin: 70, netMargin: 35 },
        ];
    }

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>Growth Analysis</h3>

            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <h4 className={styles.metricLabel}>Median Annual Revenue Growth</h4>
                    <p className={`${styles.metricValue} ${growth.revenueGrowth > 0 ? styles.positive : styles.negative}`}>
                        {(growth.revenueGrowth * 100).toFixed(2)}%
                    </p>
                </div>

            </div>

            {/* Chart 1: Revenue, Net Income, OCF */}
            <div className={styles.chartContainer}>
                <h4 className={styles.chartTitle}>Financial Performance</h4>
                {financialData.length > 0 ? (
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <ComposedChart data={financialData} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis dataKey="date" stroke={chartColors.text} tick={{ fontSize: 10, fill: chartColors.text }} />
                                <YAxis stroke={chartColors.text} tick={{ fontSize: 10, fill: chartColors.text }} tickFormatter={(val) => `$${(val / 1e9).toFixed(0)}B`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: chartColors.tooltipBg,
                                        border: chartColors.tooltipBorder,
                                        color: chartColors.tooltipColor,
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px'
                                    }}
                                    formatter={(val, name) => [`$${(val / 1e9).toFixed(2)}B`, name]}
                                    itemStyle={{ margin: '0', padding: '0' }}
                                    labelStyle={{
                                        margin: '0 0 3px 0', // Collapse top/bottom margin, but leave a small gap (3px) below the label
                                        padding: '0',
                                        fontWeight: 'bold' // Optional, to make the label stand out
                                    }}
                                />
                                <Legend wrapperStyle={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    alignItems: 'center',
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                }} />
                                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" barSize={barSize} />
                                <Bar dataKey="opIncome" name="Operating Income" fill="#8B5CF6" barSize={barSize} />
                                <Bar dataKey="netIncome" name="Net Income" fill="#F59E0B" barSize={barSize} />
                                <Bar dataKey="ocf" name="Operating Cash Flow" fill="#10B981" barSize={barSize} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className={styles.noData}>
                        No financial data available for chart
                    </div>
                )}
            </div>

            {/* Chart 2: Margins */}
            <div className={styles.chartContainer}>
                <h4 className={styles.chartTitle}>Margin Trends</h4>
                {marginData.length > 0 ? (
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <ComposedChart data={marginData} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis dataKey="date" stroke={chartColors.text} tick={{ fontSize: 10, fill: chartColors.text }} />
                                <YAxis stroke={chartColors.text} tick={{ fontSize: 10, fill: chartColors.text }} tickFormatter={(val) => `${val}%`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: chartColors.tooltipBg,
                                        border: chartColors.tooltipBorder,
                                        color: chartColors.tooltipColor,
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px'
                                    }}
                                    formatter={(val, name) => [`${val.toFixed(2)}%`, name]}
                                    itemStyle={{ margin: '0', padding: '0' }}
                                    labelStyle={{
                                        margin: '0 0 3px 0', // Collapse top/bottom margin, but leave a small gap (3px) below the label
                                        padding: '0',
                                        fontWeight: 'bold' // Optional, to make the label stand out
                                    }}
                                />
                                <Legend wrapperStyle={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    alignItems: 'center',
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                }} />
                                <Bar dataKey="grossMargin" name="Gross Margin" fill="#8B5CF6" barSize={barSize} />
                                <Bar dataKey="netMargin" name="Net Margin" fill="#EC4899" barSize={barSize} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className={styles.noData}>
                        No margin data available for chart
                    </div>
                )}
            </div>

            {/* Growth Estimates Table */}
            {growth.estimates && growth.estimates.length > 0 && (
                <div>
                    <h4 className={styles.tableTitle}>5-Year Growth Estimates</h4>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.tableHead}>
                                <tr>
                                    <th className={styles.tableCell}>Period</th>
                                    <th className={styles.tableCell}>Growth Estimates</th>
                                </tr>
                            </thead>
                            <tbody>
                                {growth.estimates.map((row, idx) => (
                                    <tr key={idx} className={styles.tableRow}>
                                        <td className={styles.periodCell}>
                                            {row['Period'] || row['period'] || row['Growth Estimates'] || row['index'] || 'N/A'}
                                        </td>
                                        <td className={styles.valueCell}>
                                            {(row['stockTrend'] || row['stock'] || row[Object.keys(row).find(k => k !== 'period' && k !== 'Period' && k !== 'index')] || 'N/A')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrowthCard;
