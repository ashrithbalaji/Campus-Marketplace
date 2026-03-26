import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import './ProductDetails.css'; // Reusing global glassmorphism, with some specifics

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [requestStatus, setRequestStatus] = useState('');

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        
        // Fetch similar products after finding the product category matches
        try {
          const simResp = await api.get(`/products/${id}/similar`);
          setSimilarProducts(simResp.data);
        } catch(e) { console.error("Could not fetch similar products", e); }

      } catch (err) {
        setError('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleRequestBuy = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      // Create purchase request mapping to backend
      await api.post('/requests', {
        productId: product.id,
        buyerId: currentUser.id
      });
      setRequestStatus('success');
    } catch (err) {
      setRequestStatus('error');
    }
  };

  if (loading) return <div className="details-container"><div className="loading-spinner">Loading Product...</div></div>;
  if (error) return <div className="details-container"><div className="error-message">{error}</div></div>;
  if (!product) return null;

  const isOwnProduct = currentUser?.id === product.seller?.id;
  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [];

  return (
    <div className="details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="product-layout">
        
        {/* Left Side: Images */}
        <div className="product-gallery">
          <div className="main-image-container ios-glass-card">
            {images.length > 0 ? (
              <img src={`${backendBaseUrl}${images[selectedImage]}`} alt="Product" className="main-image" />
            ) : (
              <div className="placeholder-image">🛒 No Image Available</div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((url, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ios-glass-card ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={`${backendBaseUrl}${url}`} alt={`Thumbnail ${index}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="product-info-panel ios-glass-card">
          <span className="category-badge">{product.category}</span>
          <h1 className="product-title">{product.name}</h1>
          <h2 className="product-price">₹{product.price.toFixed(2)}</h2>
          
          <div className="product-seller-info">
            <p><strong>Seller:</strong> {product.seller?.name}</p>
            {product.sold && <span className="sold-badge">Item Sold</span>}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-action-box">
             {isOwnProduct ? (
               <p className="own-product-msg">This is your own listing.</p>
             ) : product.sold ? (
               <button className="btn-buy" disabled>Already Sold</button>
             ) : (
               <>
                 <button 
                   className={`btn-buy ${requestStatus === 'success' ? 'success' : requestStatus === 'error' ? 'error' : ''}`} 
                   onClick={handleRequestBuy}
                   disabled={requestStatus === 'success' || requestStatus === 'error'}
                 >
                   {requestStatus === 'success' ? <><CheckCircle size={20}/> Requested Successfully!</> : 
                    requestStatus === 'error' ? <><AlertCircle size={20}/> Request Failed</> : 
                    <><ShoppingCart size={20}/> Request to Buy</>}
                 </button>
                 <p className="buy-hint">By clicking this, the seller will be notified of your interest.</p>
               </>
             )}
          </div>
        </div>
      </div>

      {/* Similar Products Recommendation Section */}
      {similarProducts.length > 0 && (
        <div style={{marginTop: '4rem'}}>
          <h2 style={{color: 'var(--text-primary)', marginBottom: '1.5rem', fontWeight: 700}}>
            Based on your interests
          </h2>
          <div className="requests-grid" style={{gap: '1.5rem'}}>
            {similarProducts.map(sim => (
              <div 
                key={sim.id} 
                className="listing-card ios-glass-card" 
                style={{cursor: 'pointer'}}
                onClick={() => navigate(`/product/${sim.id}`)}
              >
                <div style={{height: '150px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                   {sim.imageUrls && sim.imageUrls.length > 0 ? (
                     <img src={`${backendBaseUrl}${sim.imageUrls[0]}`} alt={sim.name} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                   ) : (
                     <span style={{opacity: 0.5}}>🛒 No Image</span>
                   )}
                </div>
                <div style={{padding: '1rem'}}>
                  <h4 style={{margin: '0 0 0.5rem 0', color: 'var(--text-primary)'}}>{sim.name}</h4>
                  <p style={{margin: '0', color: '#86efac', fontWeight: 'bold'}}>₹{sim.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
