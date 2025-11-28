import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const evaluateMoat = async (stockCode) => {
  try {
    const response = await axios.get(`${API_URL}/evaluate_moat/${stockCode}`);
    return response.data;
  } catch (error) {
    console.error("Error evaluating moat:", error);
    throw error;
  }
};
