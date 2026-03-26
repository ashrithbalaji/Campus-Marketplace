import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Messages.css';

const Messages = () => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      // Get both seller and buyer approved requests
      const [sellerRes, buyerRes] = await Promise.all([
        api.get(`/requests/seller/${user.id}`),
        api.get(`/requests/buyer/${user.id}`)
      ]);
      
      const sellerApproved = sellerRes.data.filter(req => req.status === 'APPROVED');
      const buyerApproved = buyerRes.data.filter(req => req.status === 'APPROVED');
      
      // Combine and remove duplicates if any
      const allConversations = [...sellerApproved, ...buyerApproved];
      const uniqueConversations = allConversations.filter((conv, index, self) => 
        index === self.findIndex(c => c.id === conv.id)
      );
      
      setConversations(uniqueConversations);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/user/${user.id}/product/${selectedConversation.product.id}`);
      setMessages(res.data);
      // Mark messages as read
      await api.put(`/messages/read/${user.id}/product/${selectedConversation.product.id}`);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const receiverId = selectedConversation.product.seller.id === user.id
        ? selectedConversation.buyer.id
        : selectedConversation.product.seller.id;

      await api.post('/messages', { content: newMessage }, {
        params: {
          senderId: user.id,
          receiverId: receiverId,
          productId: selectedConversation.product.id
        }
      });

      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message: ' + (err.response?.data || err.message));
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="messages-container">
      <div className="messages-sidebar">
        <h2>💬 Messages</h2>
        {loading ? (
          <p>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p>No conversations yet. Approve some requests to start messaging!</p>
        ) : (
          <div className="conversations-list">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conversation-info">
                  <h4>{conv.product.name}</h4>
                  <p>₹{conv.product.price}</p>
                  <small>
                    {conv.product.seller.id === user.id ? `Buyer: ${conv.buyer.name}` : `Seller: ${conv.product.seller.name}`}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="messages-main">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <h3>{selectedConversation.product.name}</h3>
              <p>
                {selectedConversation.product.seller.id === user.id
                  ? `Buyer: ${selectedConversation.buyer.name} (${selectedConversation.buyer.email})`
                  : `Seller: ${selectedConversation.product.seller.name} (${selectedConversation.product.seller.mobileNumber})`
                }
              </p>
            </div>

            <div className="messages-list">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.sender.id === user.id ? 'sent' : 'received'}`}>
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <small>{new Date(msg.timestamp).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-conversation">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;