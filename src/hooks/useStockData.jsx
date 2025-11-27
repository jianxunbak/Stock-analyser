import { createContext, useContext, useState } from 'react';
import { fetchStockData } from '../services/api';

const StockDataContext = createContext();

export const StockDataProvider = ({ children }) => {
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock login

    const loadStockData = async (ticker) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchStockData(ticker);
            // console.log("Fetched Stock Data:", data);
            // Calculate Quant Moat Score (Mock logic for now)
            const moatScore = calculateQuantMoat(data);
            const enrichedData = { ...data, moat: { ...data.moat, score: moatScore } };
            setStockData(enrichedData);
            return enrichedData; // Return data for caller
        } catch (err) {
            console.error("Error loading stock data:", err);
            const errorMessage = err.response?.data?.detail || err.message || "An error occurred";
            setError(errorMessage);
            // Keep previous data if available so UI doesn't go blank
            // setStockData(null);
            throw err; // Re-throw for caller to handle
        } finally {
            setLoading(false);
        }
    };

    const calculateQuantMoat = (data) => {
        // Placeholder logic: Random score between 0 and 5
        // In a real app, this would use data points to calculate
        return Math.floor(Math.random() * 6);
    };

    return (
        <StockDataContext.Provider value={{ stockData, loading, error, loadStockData, isLoggedIn }}>
            {children}
        </StockDataContext.Provider>
    );
};

export const useStockData = () => useContext(StockDataContext);
