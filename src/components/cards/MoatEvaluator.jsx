import React, { useState } from 'react';
import { evaluateMoat } from '../services/gemini';
import { motion } from 'framer-motion';
import { Loader2, Search, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

const CRITERIA_LABELS = {
    brandMonopoly: "Brand Monopoly",
    networkEffect: "Network Effect",
    economyOfScale: "Economy of Scale",
    highBarrierToEntry: "High Barrier to Entry",
    highSwitchingCost: "High Switching Cost"
};

const SCORES = {
    "High": 1,
    "Low": 0.5,
    "None": 0
};

const MoatEvaluator = () => {
    const [stockCode, setStockCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleEvaluate = async (e) => {
        e.preventDefault();
        if (!stockCode.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await evaluateMoat(stockCode);

            let totalScore = 0;
            const evaluatedData = {};

            for (const [key, value] of Object.entries(data)) {
                // Normalize value just in case it comes back slightly different
                let normalizedValue = "None";
                if (value) {
                    const v = value.toString().trim();
                    if (v.toLowerCase() === 'high') normalizedValue = "High";
                    else if (v.toLowerCase() === 'low') normalizedValue = "Low";
                    else normalizedValue = "None";
                }

                evaluatedData[key] = normalizedValue;
                totalScore += SCORES[normalizedValue] || 0;
            }

            let moatType = "No Moat";
            if (totalScore > 3) moatType = "Wide Moat";
            else if (totalScore >= 2) moatType = "Narrow Moat"; // 2-3

            setResult({
                criteria: evaluatedData,
                totalScore,
                moatType
            });
        } catch (err) {
            setError(err.message || "Failed to evaluate moat");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="evaluator-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <h1>Moat Analyser</h1>
                <p className="subtitle">Powered by Gemini AI</p>

                <form onSubmit={handleEvaluate} className="search-form">
                    <input
                        type="text"
                        value={stockCode}
                        onChange={(e) => setStockCode(e.target.value)}
                        placeholder="Enter Stock Code (e.g., AAPL)"
                        className="search-input"
                    />
                    <button type="submit" disabled={loading} className="search-button">
                        {loading ? <Loader2 className="spin" /> : <Search size={20} />}
                        <span>Evaluate</span>
                    </button>
                </form>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="result-section"
                    >
                        <div className="score-summary">
                            <div className={`moat-badge ${result.moatType.toLowerCase().replace(' ', '-')}`}>
                                {result.moatType === "Wide Moat" && <ShieldCheck size={32} />}
                                {result.moatType === "Narrow Moat" && <ShieldAlert size={32} />}
                                {result.moatType === "No Moat" && <ShieldX size={32} />}
                                <div className="moat-text">
                                    <span className="moat-label">Moat Rating</span>
                                    <span className="moat-value">{result.moatType}</span>
                                </div>
                            </div>
                            <div className="total-score-box">
                                <span className="score-label">Moat Score</span>
                                <span className="score-value">{result.totalScore}<span className="score-max">/5</span></span>
                            </div>
                        </div>

                        <div className="criteria-grid">
                            {Object.entries(result.criteria).map(([key, value]) => (
                                <div key={key} className="criteria-item">
                                    <span className="label">{CRITERIA_LABELS[key]}</span>
                                    <div className={`value-pill ${value.toLowerCase()}`}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default MoatEvaluator;
