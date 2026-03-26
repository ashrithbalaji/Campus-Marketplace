import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Inbox, 
  List, 
  PlusCircle, 
  LogOut 
} from 'lucide-react';
import api from '../services/api';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (user) {
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

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { path: '/messages', label: 'Messages', icon: MessageSquare, badge: messageCount },
    { path: '/requests', label: 'Requests', icon: Inbox, badge: notificationCount },
    { path: '/your-listings', label: 'Your Listings', icon: List },
    { path: '/add-product', label: 'Sell Item', icon: PlusCircle, highlight: true },
  ];

  if (!user) return null; // Don't show sidebar for unauthenticated users (Login/Signup)

  return (
    <div 
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <div className="logo-icon">C</div>
        <span className="logo-text">CAMPUS</span>
      </div>

      <div className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`sidebar-link ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
            >
              <div className="nav-icon-wrapper">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge > 0 && <span className="nav-badge-dot"></span>}
              </div>
              <span className="nav-label">{item.label}</span>
              {item.badge > 0 && isExpanded && (
                <span className="nav-badge-pill">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link logout-btn">
          <div className="nav-icon-wrapper">
            <LogOut size={24} />
          </div>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
