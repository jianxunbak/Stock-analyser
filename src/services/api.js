import axios from 'axios';

const API_URL = '/api';

export const fetchStockData = async (ticker) => {
    try {
        const response = await axios.get(`${API_URL}/stock/${ticker}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching stock data:", error);
        throw error;
    }
};
