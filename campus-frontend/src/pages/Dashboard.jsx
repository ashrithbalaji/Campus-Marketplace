import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { deleteProduct } from '../services/api';
import { ShoppingBag, Heart, PlayCircle, Settings, User, Trash2, Package } from 'lucide-react';
import './Dashboard.css';

const IconWrapper = ({ icon: Icon, gradient }) => (
  <div className="icon-wrapper" style={{ background: `var(${gradient})` }}>
    <Icon size={24} color="white" strokeWidth={2} />
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  // Profile State
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [passwordForDeletion, setPasswordForDeletion] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data State
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [myProducts, setMyProducts] = useState([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    try {
      const [reqIncRes, reqPurRes, prodRes] = await Promise.all([
        api.get(`/requests/seller/${user.id}`),
        api.get(`/requests/buyer/${user.id}`),
        api.get(`/products/seller/${user.id}`)
      ]);
      setIncomingRequests(reqIncRes.data);
      setMyPurchases(reqPurRes.data);
      setMyProducts(prodRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(productId, user.id);
      setMyProducts(myProducts.filter(product => product.id !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      alert(err.response?.data || 'Failed to delete product.');
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await api.put(`/requests/${requestId}/status?sellerId=${user.id}`, { status });
      fetchData(); // Refresh list
    } catch (err) {
      alert(err.response?.data || 'Failed to update request status.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setIsUpdating(true);
    try {
      const response = await api.put(`/users/${user.id}/profile`, { mobileNumber });
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you SURE you want to delete your account? This action cannot be undone.")) return;
    setMessage({ text: '', type: '' });
    setIsDeleting(true);
    try {
      await api.delete(`/users/${user.id}`, { data: { password: passwordForDeletion } });
      alert('Account deleted successfully.');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      setMessage({ text: err.response?.data || 'Failed to delete account.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  // Calculate some stats for the featured card
  const pendingRequests = incomingRequests.filter(req => req.status === 'PENDING').length;
  const approvedPurchases = myPurchases.filter(req => req.status === 'APPROVED').length;

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome, {user.name}</h1>
        <p className="dashboard-subtitle">Here is your campus marketplace overview.</p>
      </div>

      <div className="dashboard-grid">
        
        {/* Featured Card */}
        <div className="ios-glass-card card-featured">
          <div>
            <IconWrapper icon={PlayCircle} gradient="--grad-purple-pink" />
            <h2 className="card-title">Dashboard Overview</h2>
            <p className="card-subtitle">Your activity at a glance.</p>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <p className="card-subtitle">Active Products</p>
              <p className="card-value" style={{ color: '#ec4899' }}>{myProducts.length}</p>
            </div>
            <div>
              <p className="card-subtitle">Pending Requests</p>
              <p className="card-value" style={{ color: '#3b82f6' }}>{pendingRequests}</p>
            </div>
            <div>
              <p className="card-subtitle">Approved Purchases</p>
              <p className="card-value" style={{ color: '#22c55e' }}>{approvedPurchases}</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="ios-glass-card">
          <IconWrapper icon={User} gradient="--grad-indigo-purple" />
          <h2 className="card-title">Profile Settings</h2>
          <p className="card-subtitle">Manage your personal information.</p>
          
          <div className="card-content">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Status:</strong> {user.verified ? 'Verified Student ✓' : 'Unverified'}</p>
            
            <form onSubmit={handleUpdateProfile} style={{ marginTop: '1rem' }}>
              <input 
                type="tel" 
                value={mobileNumber} 
                onChange={(e) => setMobileNumber(e.target.value)} 
                placeholder="Mobile Number"
                className="glass-input"
                required
              />
              <button type="submit" className="glass-btn">
                {isUpdating ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
            {message.text && (
               <p style={{ marginTop: '0.5rem', color: message.type === 'error' ? '#fca5a5' : '#86efac' }}>
                 {message.text}
               </p>
            )}
          </div>
        </div>

        {/* My Products */}
        <div className="ios-glass-card">
          <IconWrapper icon={Package} gradient="--grad-blue-cyan" />
          <h2 className="card-title">My Products</h2>
          <p className="card-subtitle">Items you are selling.</p>
          
          <div className="card-content" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {myProducts.length === 0 ? <p>No products listed yet.</p> : (
              <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
                {myProducts.map(product => (
                  <li key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <div>
                      <strong>{product.name}</strong>
                      <div style={{ fontSize: '0.85rem' }}>₹{product.price}</div>
                    </div>
                    <button onClick={() => handleDeleteProduct(product.id)} className="glass-btn danger" style={{ padding: '0.4rem', display: 'flex' }}>
                       <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Incoming Requests */}
        <div className="ios-glass-card">
          <IconWrapper icon={Heart} gradient="--grad-red-orange" />
          <h2 className="card-title">Requests Received</h2>
          <p className="card-subtitle">Buyers interested in your items.</p>
          
          <div className="card-content" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {incomingRequests.length === 0 ? <p>No incoming requests.</p> : (
              <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
                {incomingRequests.map(req => (
                  <li key={req.id} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <strong>{req.product.name}</strong> requested by {req.buyer.name}
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                        {req.status}
                      </span>
                      {req.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="glass-btn" style={{ padding: '0.2rem 0.5rem', color: '#86efac' }}>Approve</button>
                          <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="glass-btn danger" style={{ padding: '0.2rem 0.5rem' }}>Reject</button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* My Purchases */}
        <div className="ios-glass-card">
          <IconWrapper icon={ShoppingBag} gradient="--grad-green-emerald" />
          <h2 className="card-title">My Purchases</h2>
          <p className="card-subtitle">Items you requested.</p>

          <div className="card-content" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {myPurchases.length === 0 ? <p>No purchase requests made.</p> : (
              <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
                {myPurchases.map(req => (
                  <li key={req.id} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <strong>{req.product.name}</strong>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      Status: <span style={{ color: req.status === 'APPROVED' ? '#86efac' : 'inherit' }}>{req.status}</span>
                    </div>
                    {req.status === 'APPROVED' && (
                       <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                         Contact Seller: {req.product.seller.mobileNumber}
                       </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="ios-glass-card">
          <IconWrapper icon={Settings} gradient="--grad-gray" />
          <h2 className="card-title">Account Settings</h2>
          <p className="card-subtitle">Danger zone operations.</p>
          
          <div className="card-content">
            <p style={{ color: '#fca5a5' }}>Permanently delete your account and all associated data.</p>
            <form onSubmit={handleDeleteAccount} style={{ marginTop: '1rem' }}>
              <input 
                type="password" 
                value={passwordForDeletion} 
                onChange={(e) => setPasswordForDeletion(e.target.value)} 
                placeholder="Confirm Password"
                className="glass-input"
                required
              />
              <button type="submit" className="glass-btn danger" disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
