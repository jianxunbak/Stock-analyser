import React, { useState } from 'react';
import { useStockData } from '../../hooks/useStockData';
import styles from './FinancialTables.module.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FinancialTables = () => {
    const { stockData, loading } = useStockData();
    const [activeTab, setActiveTab] = useState('income_statement');
    const [isExpanded, setIsExpanded] = useState(false);

    if (loading) return <div className={styles.loading}></div>;
    if (!stockData || !stockData.financials) return null;

    const { financials } = stockData;
    const tabs = [
        { id: 'income_statement', label: 'Income Statement' },
        { id: 'balance_sheet', label: 'Balance Sheet' },
        { id: 'cash_flow', label: 'Cash Flow' },
    ];

    const renderTable = (data) => {
        if (!data || !data.dates || !data.metrics) {
            if (activeTab === 'growth_estimates' && typeof data === 'object') {
                // Handle growth estimates dict
                return (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.tableHead}>
                                <tr>
                                    <th className={styles.th}>Period</th>
                                    {Object.keys(Object.values(data)[0] || {}).map(key => (
                                        <th key={key} className={styles.th}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(data).map(([period, values]) => (
                                    <tr key={period} className={styles.tableRow}>
                                        <td className={`${styles.td} font-medium text-white`}>{period}</td>
                                        {Object.values(values).map((val, idx) => (
                                            <td key={idx} className={styles.td}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }
            return <p className={styles.noDataText}>No data available.</p>;
        }

        return (
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead className={styles.tableHead}>
                        <tr>
                            <th className={`${styles.th} ${styles.stickyHeader}`}>Metric</th>
                            {data.dates.map((date) => (
                                <th key={date} className={styles.th}>{date}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.metrics.map((metric, index) => (
                            <tr key={index} className={styles.tableRow}>
                                <td className={`${styles.td} ${styles.stickyCell}`}>{metric.name}</td>
                                {metric.values.map((value, vIndex) => (
                                    <td key={vIndex} className={styles.td}>
                                        {typeof value === 'number'
                                            ? (Math.abs(value) > 1e6 ? `$${(value / 1e6).toFixed(2)}M` : value.toLocaleString())
                                            : value}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className={styles.card}>
            <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                <h3 className={styles.title}>Financial Statements</h3>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={styles.iconButton}
                >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {isExpanded && (
                <>
                    <div className={styles.tabsContainer}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${styles.tabButton} ${activeTab === tab.id
                                    ? styles.activeTab
                                    : styles.inactiveTab
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div>
                        {renderTable(financials[activeTab])}
                    </div>
                </>
            )}
        </div>
    );
};

export default FinancialTables;
