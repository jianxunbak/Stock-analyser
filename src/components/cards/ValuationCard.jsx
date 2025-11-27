import React from 'react';
import { useStockData } from '../../hooks/useStockData';
import styles from './ValuationCard.module.css';

const ValuationCard = () => {
    const { stockData, loading } = useStockData();

    if (loading) return <div className={styles.loading}></div>;
    if (!stockData) return null;

    const { valuation, overview } = stockData;

    if (!valuation) return null;

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>Intrinsic Value</h3>
            <div className={styles.metricsContainer}>
                <div className={styles.section}>
                    <h4 className={styles.label}>Method Used</h4>
                    <p className={styles.methodValue}>{valuation.method || 'N/A'}</p>
                </div>

                <div className={styles.section}>
                    <h4 className={styles.label}>Key Assumptions</h4>
                    <div className={styles.assumptionsContainer}>
                        {valuation.assumptions && Object.entries(valuation.assumptions).map(([key, value]) => (
                            <div key={key} className={styles.assumptionRow}>
                                <span className={styles.assumptionKey}>{key}</span>
                                <span className={styles.assumptionValue}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.valueRow}>
                        <div>
                            <h4 className={styles.label}>Current Price</h4>
                            <p className={`${styles.priceValue} ${overview?.price <= valuation.intrinsicValue ? styles.positive : styles.negative}`}>${overview?.price?.toFixed(2)}</p>
                        </div>
                        <div>
                            <h4 className={styles.label}>Intrinsic Value</h4>
                            <p className={styles.intrinsicValue}>${valuation.intrinsicValue ? valuation.intrinsicValue.toFixed(2) : 'N/A'}</p>
                        </div>
                    </div>
                    <div className={styles.differenceSection}>
                        <div >
                            <h4 className={styles.label}>Difference</h4>
                            <p className={`${styles.differenceValue} ${valuation.differencePercent > 0 ? styles.overvalued : styles.undervalued}`}>
                                {valuation.differencePercent ? (valuation.differencePercent > 0 ? '+' : '') + (valuation.differencePercent * 100).toFixed(2) : '0.00'}%
                            </p>
                        </div>
                        <div>
                            <h4 className={styles.label}>Valuation</h4>
                            <div className={`${styles.statusBadge} ${valuation.status === 'Undervalued' ? styles.statusUndervalued : valuation.status === 'Overvalued' ? styles.statusOvervalued : styles.statusFair}`}>
                                {valuation.status}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ValuationCard;
