import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css'; // Reusing form styles

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 10) {
      setError('You can only upload up to 10 photos.');
      setImages([]);
    } else {
      setImages(selectedFiles);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Get logged-in user to send as sellerId
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('You must be logged in to post a product.');
      setLoading(false);
      return;
    }
    
    const user = JSON.parse(userStr);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', parseFloat(formData.price));
    data.append('category', formData.category);
    data.append('sellerId', user.id);
    
    if (images && images.length > 0) {
      images.forEach(img => {
        data.append('images', img);
      });
    }

    try {
      await api.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2>Post an Item for Sale</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="e.g., Used Calculus Textbook"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              rows="4"
              placeholder="Describe the condition, features, etc."
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Furniture">Furniture</option>
              <option value="Vehicles">Vehicles</option>
            </select>
          </div>
          <div className="form-group">
            <label>Price (₹)</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              required 
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>Product Images (You can select multiple)</label>
            <input 
              type="file" 
              name="images" 
              accept="image/*"
              multiple
              onChange={handleFileChange} 
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Posting...' : 'Post Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
