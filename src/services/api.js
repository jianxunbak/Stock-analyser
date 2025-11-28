import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const fetchStockData = async (ticker) => {
    try {
        const response = await axios.get(`${API_URL}/stock/${ticker}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching stock data:", error);
        throw error;
    }
};

export const fetchChartData = async (ticker, timeframe) => {
    try {
        const response = await axios.get(`${API_URL}/chart/${ticker}/${timeframe}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
        throw error;
    }
};
