import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  IconButton, CircularProgress, Typography, Paper, Avatar, Chip, Tooltip
} from '@mui/material';
import { FaPaperPlane, FaTimes, FaUserShield } from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ChatModal.css';

function ChatModal({ open, onClose, matchId, initialMatchData }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(initialMatchData);
  const messagesEndRef = useRef(null);

  const moderatorInfoStr = localStorage.getItem('moderatorInfo');
  let currentUserId = null;
  
  if (moderatorInfoStr) {
      const parsed = JSON.parse(moderatorInfoStr);
      currentUserId = parsed.data?._id || parsed._id;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open && matchId) {
      const fetchMessages = async () => {
        if(messages.length === 0) setLoading(true);
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
      const interval = setInterval(fetchMessages, 3000); 
      return () => clearInterval(interval);
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
        senderModel: 'Moderator' 
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

  const getAvatarUrl = (path) => path ? `http://localhost:5001${path}` : '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: 'chat-dialog-paper' }}>
      <DialogTitle className="chat-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaUserShield /> Moderator Channel
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}><FaTimes /></IconButton>
      </DialogTitle>
      
      <DialogContent className="chat-dialog-content">
        {loading && messages.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        )}
        
        <Box className="chat-messages-container">
          {messages.map((msg, index) => {
            const isMe = msg.sender._id === currentUserId;
            const senderName = msg.sender.firstName || msg.sender.organisationName || 'Unknown';
            const role = msg.sender.role || msg.senderModel;

            return (
              <Box key={msg._id || index} className={`chat-message ${isMe ? 'sent' : 'received'}`}>
                {!isMe && (
                    <Tooltip title={`${senderName} (${role})`} placement="top">
                        <Avatar src={getAvatarUrl(msg.sender.profileImage || msg.sender.organisationLogo)} className="chat-avatar" />
                    </Tooltip>
                )}
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
                    {!isMe && (
                        <Typography variant="caption" className="chat-sender-name">
                            {senderName}
                        </Typography>
                    )}
                    <Paper elevation={0} className="chat-bubble">
                        <Typography variant="body2">{msg.message}</Typography>
                    </Paper>
                    <Typography variant="caption" className="chat-timestamp">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Box>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>
      
      <DialogActions className="chat-dialog-actions">
          {matchData && !matchData.isFinderAllowedInChat && (
              <Chip 
                label="Enable Finder Access" 
                onClick={handleAllowFinder}
                color="secondary"
                className="allow-finder-chip"
                size="small"
              />
          )}
          <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
            <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="chat-input-field"
                InputProps={{ sx: { borderRadius: '20px', backgroundColor: '#f8f9fa' } }}
            />
            <Button variant="contained" onClick={handleSendMessage} className="send-btn" disabled={!newMessage.trim()}>
                <FaPaperPlane />
            </Button>
          </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ChatModal;