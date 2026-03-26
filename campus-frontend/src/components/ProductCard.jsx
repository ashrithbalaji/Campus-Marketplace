import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, currentUser, onDeleteProduct }) => {
  const backendBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081';
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await onDeleteProduct(product.id);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const isOwnProduct = currentUser?.id === product.seller?.id;

  return (
    <div className="product-list-item" onClick={() => navigate(`/product/${product.id}`)}>
      {product.imageUrls && product.imageUrls.length > 0 ? (
        <div className="product-list-image">
          <img 
            src={`${backendBaseUrl}${product.imageUrls[0]}`} 
            alt={product.name} 
            className="product-image"
          />
        </div>
      ) : (
        <div className="product-list-image-placeholder">
          <span>🛒</span>
        </div>
      )}

      <div className="product-list-content">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-list-footer">
          <div className="price-section">
            <span className="product-price">₹{product.price?.toFixed(2) || product.price}</span>
          </div>
          <span className="seller-badge">
            Seller: {product.seller?.name}
          </span>

          {/* Delete Button */}
          {isOwnProduct && onDeleteProduct && (
            <button 
              className="delete-product-btn" 
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;