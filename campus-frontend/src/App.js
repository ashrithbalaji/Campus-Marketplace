import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import AddProduct from './pages/AddProduct';
import YourListings from './pages/YourListings';
import Messages from './pages/Messages';
import Sidebar from './components/Sidebar';
import ProductDetails from './pages/ProductDetails';
import EditProduct from './pages/EditProduct';
import Chatbot from './components/Chatbot';
import './index.css';

import Requests from './pages/Requests';

// Simple guard to check if user is logged in
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/verify-otp';

  return (
    <div className="app-container">
      {!isAuthPage && <Sidebar />}
      <main className={`main-content ${isAuthPage ? 'auth-mode' : 'with-sidebar'}`}>
        <Routes>
              <Route path="/" element={<Navigate to="/marketplace" />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/marketplace" 
                element={
                  <PrivateRoute>
                    <Marketplace />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/add-product" 
                element={
                  <PrivateRoute>
                    <AddProduct />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/requests" 
                element={
                  <PrivateRoute>
                    <Requests />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/your-listings" 
                element={
                  <PrivateRoute>
                    <YourListings />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <PrivateRoute>
                    <Messages />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/product/:id" 
                element={
                  <PrivateRoute>
                    <ProductDetails />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/edit-product/:id" 
                element={
                  <PrivateRoute>
                    <EditProduct />
                  </PrivateRoute>
                } 
              />
            </Routes>
      </main>
      {!isAuthPage && <Chatbot />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;