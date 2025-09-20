// src/components/user/UserChatModal.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  IconButton, CircularProgress, Typography, Paper, Avatar
} from '@mui/material';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/UserChatModal.css'; // We will create this file next

function UserChatModal({ open, onClose, matchId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Get current user's ID from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const currentUserId = userInfo?._id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open && matchId) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const res = await axiosInstance.get(`/api/chat/${matchId}`);
          setMessages(res.data.data);
        } catch (error) {
          console.error("Failed to fetch messages", error);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval); 
    }
  }, [open, matchId]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;
    try {
      const res = await axiosInstance.post(`/api/chat/${matchId}`, {
        senderId: currentUserId,
        message: newMessage,
      });
      setMessages([...messages, res.data.data]);
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message", error);
      // Optionally, show an error to the user
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: 'user-chat-dialog-paper' }}>
      <DialogTitle className="user-chat-dialog-title">
        Conversation
        <IconButton onClick={onClose}><FaTimes /></IconButton>
      </DialogTitle>
      <DialogContent dividers className="user-chat-dialog-content">
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        <Box className="user-chat-messages-container">
          {messages.map((msg) => {
            const isMe = msg.sender._id === currentUserId;
            return (
              <Box key={msg._id} className={`user-chat-message ${isMe ? 'sent' : 'received'}`}>
                <Avatar src={`http://localhost:5001${msg.sender.profileImage}`} className="user-chat-avatar" />
                <Paper elevation={0} className="user-chat-bubble">
                  <Typography variant="body2">{msg.message}</Typography>
                  <Typography variant="caption" className="user-chat-timestamp">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>
      <DialogActions className="user-chat-dialog-actions">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button variant="contained" onClick={handleSendMessage} className="user-send-btn">
            <FaPaperPlane />
          </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserChatModal;