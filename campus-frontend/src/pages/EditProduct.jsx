import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './Auth.css'; 

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data;
        if (product.seller.id !== user.id) {
            navigate('/your-listings');
            return;
        }
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category
        });
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id, navigate, user]);

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
      await api.put(`/products/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/your-listings');
    } catch (err) {
      setError(err.response?.data || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="auth-container"><div style={{color:'white'}}>Loading...</div></div>;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2>Edit Listing</h2>
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
            />
          </div>
          <div className="form-group">
            <label>Replace Images (Optional)</label>
            <input 
              type="file" 
              name="images" 
              accept="image/*"
              multiple
              onChange={handleFileChange} 
            />
            <small style={{color:'var(--text-secondary)', display:'block', marginTop:'5px'}}>Leave empty to keep existing images.</small>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
