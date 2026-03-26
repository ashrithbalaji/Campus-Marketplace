import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Requests.css';

const Requests = () => {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'purchases'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const endpoint = activeTab === 'sales' 
        ? `/requests/seller/${user.id}` 
        : `/requests/buyer/${user.id}`;
      
      const response = await api.get(endpoint);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await api.put(`/requests/${requestId}/status?sellerId=${user.id}`, { status: newStatus });
      // Refresh list
      fetchRequests();
    } catch (error) {
      alert('Failed to update request status');
    }
  };

  if (!user) return <div>Please log in to view requests.</div>;

  return (
    <div className="requests-container">
      <h2>My Requests</h2>
      
      <div className="requests-tabs">
        <button 
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Requests
        </button>
        <button 
          className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          Purchase Requests
        </button>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="requests-grid">
          {requests.map((req) => (
            <div key={req.id} className="request-card">
              <h3>{req.product.name}</h3>
              <p>₹{req.product.price}</p>
              
              <div className={`status-badge status-${req.status.toLowerCase()}`}>
                {req.status}
              </div>

              {activeTab === 'sales' ? (
                <>
                  <p><strong>Buyer:</strong> {req.buyer.name}</p>
                  
                  {req.status === 'PENDING' && (
                    <div className="action-buttons">
                      <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="btn-accept">Accept</button>
                      <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="btn-reject">Reject</button>
                    </div>
                  )}

                  {req.status === 'APPROVED' && req.buyer.mobileNumber && (
                    <div className="contact-info">
                      <p>📞 Buyer Contact:</p>
                      <p>{req.buyer.mobileNumber}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {req.status === 'APPROVED' && req.product.seller.mobileNumber && (
                    <div className="contact-info">
                      <p>📞 Seller Contact:</p>
                      <p>{req.product.seller.mobileNumber}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
