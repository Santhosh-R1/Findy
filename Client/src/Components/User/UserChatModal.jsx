import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  IconButton, CircularProgress, Typography, Paper, Avatar
} from '@mui/material';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/UserChatModal.css';

function UserChatModal({ open, onClose, matchId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getUserIdentity = () => {
    const userInfoStr = localStorage.getItem('userInfo');
    const orgInfoStr = localStorage.getItem('organisationInfo');

    if (orgInfoStr) {
        const parsed = JSON.parse(orgInfoStr);
        const id = parsed.data?._id || parsed._id; 
        return { id, type: 'Organisation' };
    } 
    
    if (userInfoStr) {
        const parsed = JSON.parse(userInfoStr);
        return { id: parsed._id, type: 'User' };
    }

    return { id: null, type: null };
  };

  const currentUser = getUserIdentity();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open && matchId) {
      const fetchMessages = async () => {
        if(messages.length === 0) setLoading(true);
        
        try {
          const res = await axiosInstance.get(`/api/chat/${matchId}`);
          if (res.data?.success) {
             setMessages(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch messages", error);
        } finally {
          setLoading(false);
        }
      };

      fetchMessages();
      
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval); 
    }
  }, [open, matchId]); 

  useEffect(() => {
      scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser.id) return;

    try {
      const res = await axiosInstance.post(`/api/chat/${matchId}`, {
        senderId: currentUser.id,
        message: newMessage,
        senderModel: currentUser.type, 
      });

      if (res.data?.success) {
          setMessages((prev) => [...prev, res.data.data]);
          setNewMessage('');
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const getAvatarUrl = (path) => {
      if (!path) return '';
      return `http://localhost:5001${path}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: 'user-chat-dialog-paper' }}>
      <DialogTitle className="user-chat-dialog-title">
        Conversation
        <IconButton onClick={onClose}><FaTimes /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers className="user-chat-dialog-content">
        {loading && messages.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
            </Box>
        )}
        
        <Box className="user-chat-messages-container">
          {messages.map((msg, index) => {
            const senderId = msg.sender?._id;
            const isMe = senderId === currentUser.id;
            const avatarUrl = getAvatarUrl(msg.sender?.profileImage || msg.sender?.organisationLogo);

            return (
              <Box key={msg._id || index} className={`user-chat-message ${isMe ? 'sent' : 'received'}`}>
                {!isMe && (
                    <Avatar src={avatarUrl} className="user-chat-avatar" />
                )}
                
                <Paper elevation={0} className="user-chat-bubble">
                  {!isMe && (
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: '#555' }}>
                          {msg.sender?.firstName || msg.sender?.organisationName || 'Unknown'}
                      </Typography>
                  )}
                  
                  <Typography variant="body2">{msg.message}</Typography>
                  
                  <Typography variant="caption" className="user-chat-timestamp">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>

                {isMe && (
                    <Avatar src={avatarUrl} className="user-chat-avatar" sx={{ ml: 1, mr: 0 }}/>
                )}
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
            autoComplete="off"
          />
          <Button variant="contained" onClick={handleSendMessage} className="user-send-btn" disabled={!newMessage.trim()}>
            <FaPaperPlane />
          </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserChatModal;