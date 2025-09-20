// src/components/moderator/ChatModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  IconButton, CircularProgress, Typography, Paper, Avatar, Chip
} from '@mui/material';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ChatModal.css';

function ChatModal({ open, onClose, matchId, initialMatchData }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(initialMatchData);
  const messagesEndRef = useRef(null);

  const moderatorInfo = JSON.parse(localStorage.getItem('moderatorInfo'));
  const currentUserId = moderatorInfo?.data?._id;

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
      // Optional: Polling to get new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval); // Cleanup on close
    }
  }, [open, matchId]);

  useEffect(scrollToBottom, [messages]);
  useEffect(() => setMatchData(initialMatchData), [initialMatchData]);

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
    }
  };

  const handleAllowFinder = async () => {
    try {
        const res = await axiosInstance.put(`/api/items/allow-finder/${matchId}`);
        setMatchData(res.data.data); 
    } catch (error) {
        console.error("Failed to allow finder", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: 'chat-dialog-paper' }}>
      <DialogTitle className="chat-dialog-title">
        Conversation for Match
        <IconButton onClick={onClose}><FaTimes /></IconButton>
      </DialogTitle>
      <DialogContent dividers className="chat-dialog-content">
        {loading && <CircularProgress />}
        <Box className="chat-messages-container">
          {messages.map((msg) => {
            const isMe = msg.sender._id === currentUserId;
            return (
              <Box key={msg._id} className={`chat-message ${isMe ? 'sent' : 'received'}`}>
                <Avatar src={`http://localhost:5001${msg.sender.profileImage}`} className="chat-avatar" />
                <Paper elevation={0} className="chat-bubble">
                  <Typography variant="body2">{msg.message}</Typography>
                  <Typography variant="caption" className="chat-timestamp">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>
      <DialogActions className="chat-dialog-actions">
          {matchData && !matchData.isFinderAllowedInChat && (
              <Chip 
                label="Allow Finder to Join Chat" 
                onClick={handleAllowFinder}
                color="secondary"
                className="allow-finder-chip"
              />
          )}
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button variant="contained" onClick={handleSendMessage} className="send-btn">
            <FaPaperPlane />
          </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChatModal;