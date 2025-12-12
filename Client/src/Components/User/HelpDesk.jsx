// src/components/user/UserHelpDesk.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Paper, Button, Chip, Avatar,
  Container, Stack, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  ChatBubbleOutline as ChatIcon,
  SyncAlt as ExchangeIcon,
  CheckCircle as CheckCircleIcon,
  HourglassTop as HourglassIcon,
  Cancel as CancelIcon,
  ForumOutlined as NoMatchesIcon,
  RateReviewOutlined as ReviewIcon,
  Verified as VerifiedIcon,
  Handshake as HandshakeIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon // Icon for locked chat
} from '@mui/icons-material';
import axiosInstance from '../../api/baseUrl';
import UserChatModal from './UserChatModal';
import '../../Styles/UserHelpDesk.css';

const getImageUrl = (path) => `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${path}`;

const renderStatusChip = (status) => {
  const statusConfig = {
    resolved: { icon: <CheckCircleIcon />, label: "Resolved", color: "success" },
    confirmed_by_owner: { icon: <CheckCircleIcon />, label: "Confirmed by You", color: "primary" },
    rejected_by_owner: { icon: <CancelIcon />, label: "Rejected", color: "error" },
    pending_review: { icon: <HourglassIcon />, label: "Action Required", color: "warning" },
  };
  const config = statusConfig[status] || statusConfig.pending_review;
  return <Chip icon={config.icon} label={config.label} color={config.color} size="small" />;
};

const ItemDisplay = ({ label, color, item }) => (
  <div className="user-help-desk-item-display">
    <Avatar variant="rounded" src={getImageUrl(item.itemImage)} alt={item.itemName} className="user-help-desk-item-avatar" />
    <Box>
      <Chip label={label} size="small" color={color} className="user-help-desk-item-tag" />
      <Typography className="user-help-desk-item-name">{item.itemName || item.subCategory}</Typography>
      <Typography variant="caption" color="text.secondary">Status: <strong>{item.status}</strong></Typography>
    </Box>
  </div>
);

const MatchCard = ({ match, onOpenChat, currentUserId, onFinalizeClaim }) => { 
  const navigate = useNavigate();
  const handleReview = () => navigate(`/match-review?lostItemId=${match.lostItem._id}&foundItemId=${match.foundItem._id}`);

  // Safe ID comparisons
  const currentIdStr = String(currentUserId);
  const lostOwnerIdStr = String(match.lostItemOwner);
  const finderIdStr = match.finder && match.finder._id ? String(match.finder._id) : String(match.finder);

  const isOwnerOfLostItem = currentIdStr === lostOwnerIdStr;
  const isFinder = currentIdStr === finderIdStr;

  let leftItemData, rightItemData;
  if (isOwnerOfLostItem) {
    leftItemData = { item: match.lostItem, label: "Your Lost Item", color: "error" };
    rightItemData = { item: match.foundItem, label: "Found Item Match", color: "success" };
  } else {
    leftItemData = { item: match.foundItem, label: "Your Found Item", color: "success" };
    rightItemData = { item: match.lostItem, label: "Owner's Lost Item", color: "error" };
  }

  const isResolved = match.status === 'resolved';
  const isConfirmed = match.status === 'confirmed_by_owner';
  const isPending = match.status === 'pending_review';

  const canChat = isOwnerOfLostItem || (isFinder && match.isFinderAllowedInChat);
  const chatTooltip = canChat ? "Open conversation" : "Chat locked until Moderator approval";

  return (
    <Paper variant="outlined" className="user-help-desk-match-card">
      <div className="user-help-desk-card-header">
        <Typography variant="h6" className="user-help-desk-card-title">
          {isResolved ? "Match Resolved" : isConfirmed ? "Match Confirmed - Pending Claim" : "Potential Match Found"}
        </Typography>
        {renderStatusChip(match.status)}
      </div>

      <div className="user-help-desk-card-body">
        <div className="user-help-desk-item-container">
          <ItemDisplay label={leftItemData.label} color={leftItemData.color} item={leftItemData.item} />
        </div>
        <div className="user-help-desk-connector">
          <div className="user-help-desk-connector-line"></div>
          {isResolved ? <VerifiedIcon color="success" /> : <ExchangeIcon className="user-help-desk-connector-icon" />}
          <div className="user-help-desk-connector-line"></div>
        </div>
        <div className="user-help-desk-item-container found-item-container">
          <ItemDisplay label={rightItemData.label} color={rightItemData.color} item={rightItemData.item} />
        </div>
      </div>

      <div className="user-help-desk-card-actions">
        
        {isResolved ? (
          <Button variant="contained" color="success" startIcon={<VerifiedIcon />} disabled style={{ cursor: 'default' }}>
            Item Claimed
          </Button>
        ) : isConfirmed ? (
          <>
            {isOwnerOfLostItem && ( 
                <Button variant="contained" color="primary" startIcon={<HandshakeIcon />} onClick={() => onFinalizeClaim(match)}>
                Mark as Claimed
                </Button>
            )}
            <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={handleReview} sx={{ borderColor: 'primary.main', color: 'primary.main' }}>
              View Final Details
            </Button>
          </>
        ) : (
          isPending && !isFinder && (
            <Button variant="contained" className="user-help-desk-review-btn" startIcon={<ReviewIcon />} onClick={handleReview}>
              Review Details
            </Button>
          )
        )}

        <Tooltip title={chatTooltip}>
          <span> 
            <Button 
                variant="outlined" 
                className="user-help-desk-chat-btn" 
                startIcon={canChat ? <ChatIcon /> : <LockIcon />} 
                onClick={() => onOpenChat(match._id)}
                disabled={!canChat} // Disable if not allowed
                sx={!canChat ? { opacity: 0.6, borderColor: '#ccc', color: '#999' } : {}}
            >
                Conversation
            </Button>
          </span>
        </Tooltip>

      </div>
    </Paper>
  );
};

function UserHelpDesk() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatState, setChatState] = useState({ open: false, matchId: null });
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedMatchForClaim, setSelectedMatchForClaim] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const fetchUserMatches = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) { navigate('/login'); return; }
      setCurrentUserId(userInfo._id);
      const response = await axiosInstance.get(`/api/items/my-matches/${userInfo._id}`);
      setMatches(response.data.data);
    } catch (err) { setError(err.response?.data?.message || err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUserMatches(); }, [navigate]);

  const handleOpenChat = (matchId) => setChatState({ open: true, matchId });
  const handleCloseChat = () => setChatState({ open: false, matchId: null });

  const handleInitiateClaim = (match) => { setSelectedMatchForClaim(match); setClaimModalOpen(true); };
  const handleCloseClaimModal = () => { setClaimModalOpen(false); setSelectedMatchForClaim(null); };

  const handleConfirmClaim = async () => {
      if (!selectedMatchForClaim) return;
      try {
          await axiosInstance.post('/api/items/match/confirm-claim', {
              lostItemId: selectedMatchForClaim.lostItem._id,
              foundItemId: selectedMatchForClaim.foundItem._id
          });
          setClaimModalOpen(false);
          setSelectedMatchForClaim(null);
          fetchUserMatches(); 
      } catch (err) { alert("Error finalizing claim. Please try again."); }
  };

  const renderContent = () => {
    if (loading) return <Box className="user-help-desk-status-container"><CircularProgress /></Box>;
    if (error) return <Box className="user-help-desk-status-container"><Alert severity="error">{error}</Alert></Box>;
    if (matches.length === 0) return (
      <Paper variant="outlined" className="user-help-desk-status-container user-help-desk-no-items">
        <NoMatchesIcon className="user-help-desk-no-items-icon" />
        <Typography variant="h5">No Notifications Yet</Typography>
      </Paper>
    );
    return (
      <Stack spacing={4}>
        {matches.map((match) => (
          <MatchCard
            key={match._id}
            match={match}
            onOpenChat={handleOpenChat}
            currentUserId={currentUserId}
            onInitiateClaim={handleInitiateClaim}
            onFinalizeClaim={handleInitiateClaim} 
          />
        ))}
      </Stack>
    );
  };

  return (
    <Box className="user-help-desk-page-wrapper">
      <Container maxWidth="lg" className="user-help-desk-container">
        <Box className="user-help-desk-header">
          <Typography variant="h3" component="h1" className="user-help-desk-header-title">Your Match Notifications</Typography>
        </Box>
        {renderContent()}
        {chatState.matchId && <UserChatModal open={chatState.open} onClose={handleCloseChat} matchId={chatState.matchId} />}
        
        <Dialog open={claimModalOpen} onClose={handleCloseClaimModal}>
            <DialogTitle>Confirm Item Claim</DialogTitle>
            <DialogContent><DialogContentText>Are you sure you have received this item and want to mark it as claimed? This action cannot be undone.</DialogContentText></DialogContent>
            <DialogActions>
                <Button onClick={handleCloseClaimModal} color="secondary">Cancel</Button>
                <Button onClick={handleConfirmClaim} variant="contained" color="primary" autoFocus>Yes, I have it</Button>
            </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default UserHelpDesk;