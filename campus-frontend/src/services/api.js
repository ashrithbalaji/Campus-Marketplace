import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add delete product function
export const deleteProduct = (productId, sellerId) => {
  return api.delete(`/products/${productId}?sellerId=${sellerId}`);
};

export default api;
