import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [notificationCount, setNotificationCount] = React.useState(0);
  const [messageCount, setMessageCount] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      // Fetch both seller and buyer requests to count notifications
      const fetchNotifications = async () => {
        try {
          const [salesRes, purchasesRes] = await Promise.all([
            api.get(`/requests/seller/${user.id}`),
            api.get(`/requests/buyer/${user.id}`)
          ]);
          
          const pendingSales = salesRes.data.filter(req => req.status === 'PENDING').length;
          const approvedPurchases = purchasesRes.data.filter(req => req.status === 'APPROVED').length;
          
          setNotificationCount(pendingSales + approvedPurchases);
        } catch (err) {
          console.error('Failed to fetch notifications', err);
        }
      };

      const fetchMessageCount = async () => {
        try {
          const res = await api.get(`/messages/unread/${user.id}`);
          setMessageCount(res.data);
        } catch (err) {
          console.error('Failed to fetch message count', err);
        }
      };

      fetchNotifications();
      fetchMessageCount();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/marketplace" className="logo-bold">
          CAMPUS MARKET
        </Link>
      </div>
      <div className="navbar-links">
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.name}</span>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/marketplace" className="nav-link">Marketplace</Link>
            <Link to="/messages" className="nav-link messages-link">
              💬 Messages {messageCount > 0 && <span className="notification-badge">({messageCount})</span>}
            </Link>
            <Link to="/requests" className="nav-link requests-link">
              Requests {notificationCount > 0 && <span className="notification-badge">({notificationCount})</span>}
            </Link>
            <Link to="/your-listings" className="nav-link">Your Listings</Link>
            <Link to="/add-product" className="nav-link btn-post">Sell 🏷️</Link>
            <button onClick={handleLogout} className="nav-link btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
