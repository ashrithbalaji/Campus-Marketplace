import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './Marketplace.css';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestBuy = async (productId) => {
    if (!currentUser) return;
    
    return api.post('/requests', {
      productId: productId,
      buyerId: currentUser.id
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/products/${productId}?sellerId=${currentUser.id}`);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.response?.data || 'Failed to delete product.');
    }
  };

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h1>Campus Marketplace</h1>
        <p>Buy and sell items within the campus community.</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading products...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products available yet.</h3>
          <p>Be the first to <Link to="/add-product">post an item</Link> for sale!</p>
        </div>
      ) : (
        <div className="products-list">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              currentUser={currentUser}
              onRequestBuy={handleRequestBuy}
              onDeleteProduct={handleDeleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
