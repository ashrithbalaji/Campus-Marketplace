import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './YourListings.css';

const YourListings = () => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products/seller/${user.id}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSold = async (productId) => {
    if (!window.confirm("Mark this product as sold?")) return;

    try {
      await api.put(`/products/${productId}/sold?sellerId=${user.id}`);
      fetchProducts(); // Refresh list
      alert('Product marked as sold!');
    } catch (err) {
      alert(err.response?.data || 'Failed to mark as sold.');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="your-listings-container">
      <div className="listings-header">
        <h1>Your Listings 🏷️</h1>
        <button className="btn-add-new" onClick={() => navigate('/add-product')}>
          Add New Listing
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your listings...</div>
      ) : products.length === 0 ? (
        <div className="no-listings">
          <p>You haven't listed any products yet.</p>
          <button className="btn-primary" onClick={() => navigate('/add-product')}>
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="listings-grid">
          {products.map(product => (
            <div key={product.id} className="listing-card">
              <div className="listing-image">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:8081'}${product.imageUrls[0]}`} alt={product.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="listing-details">
                <h3>{product.name}</h3>
                <p className="description">{product.description}</p>
                <p className="price">₹{product.price}</p>
                <div className="listing-actions">
                  <button className="btn-edit" onClick={() => navigate(`/edit-product/${product.id}`)}>Edit</button>
                  <button className="btn-sold" onClick={() => handleMarkAsSold(product.id)}>
                    Sold
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourListings;