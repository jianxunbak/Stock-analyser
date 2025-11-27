import React from 'react';
import { useStockData } from '../../hooks/useStockData';
import styles from './DebtCard.module.css';

const DebtCard = () => {
    const { stockData, loading } = useStockData();

    if (loading) return <div className={styles.loading}></div>;
    if (!stockData) return null;

    const { debt } = stockData;
    if (!debt) return null;

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>Conservative Debt</h3>

            <div className={styles.metricsContainer}>
                <div className={styles.metricCard}>
                    <h4 className={styles.metricLabel}>Debt / EBITDA Ratio</h4>
                    <p className={`${styles.metricValue} ${debt.debtToEbitda != null && debt.debtToEbitda < 3 ? styles.positive : styles.negative}`}>
                        {debt.debtToEbitda != null ? `${debt.debtToEbitda.toFixed(2)}x` : 'N/A'}
                    </p>
                    <p className={styles.metricTarget}>Target: &lt; 3x</p>
                </div>

                <div className={styles.metricCard}>
                    <h4 className={styles.metricLabel}>Debt Servicing Ratio</h4>
                    <p className={`${styles.metricValue} ${debt.debtServicingRatio != null && debt.debtServicingRatio < 30 ? styles.positive : styles.warning}`}>
                        {debt.debtServicingRatio != null ? `${debt.debtServicingRatio.toFixed(2)}%` : 'N/A'}
                    </p>
                    <p className={styles.metricTarget}>Target: &lt;30%</p>
                </div>

                <div className={styles.metricCard}>
                    <h4 className={styles.metricLabel}>Current Ratio</h4>
                    <p className={`${styles.metricValue} ${debt.currentRatio > 1.5 ? styles.positive : styles.negative}`}>
                        {debt.currentRatio?.toFixed(2)}
                    </p>
                    <p className={styles.metricTarget}>Target: &gt; 1.5</p>
                </div>

                {debt.isREIT && (
                    <div className={styles.metricCard}>
                        <span className={styles.metricLabel}>Gearing Ratio (MRQ)</span>
                        <p className={`${styles.metricValue} ${debt.gearingRatio != null && debt.gearingRatio < 45 ? styles.positive : styles.negative}`}>
                            {debt.gearingRatio != null ? `${debt.gearingRatio.toFixed(2)}%` : 'N/A'}
                        </p>
                        <p className={styles.metricTarget}>Target: &lt; 45%</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DebtCard;
