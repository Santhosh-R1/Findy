// src/components/organisation/OrganisationHelpDesk.js

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
  Verified as VerifiedIcon,
  Lock as LockIcon,
  Handshake as HandshakeIcon
} from '@mui/icons-material';
import axiosInstance from '../../api/baseUrl';
import UserChatModal from '../user/UserChatModal'; 
import '../../Styles/OrganisationHelpDesk.css'; 

const getImageUrl = (path) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  return `${API_BASE_URL}/${path}`;
};

const renderStatusChip = (status) => {
  const statusConfig = {
    resolved: { icon: <CheckCircleIcon />, label: "Resolved", color: "success" },
    confirmed_by_owner: { icon: <CheckCircleIcon />, label: "Confirmed by Owner", color: "primary" },
    rejected_by_owner: { icon: <CancelIcon />, label: "Rejected", color: "error" },
    pending_review: { icon: <HourglassIcon />, label: "Pending Review", color: "warning" },
  };
  const config = statusConfig[status] || statusConfig.pending_review;
  return <Chip icon={config.icon} label={config.label} color={config.color} size="small" />;
};

const ItemDisplay = ({ label, color, item }) => (
  <div className="help-desk-user-item-display">
    <Avatar variant="rounded" src={getImageUrl(item.itemImage)} alt={item.itemName} className="help-desk-user-item-avatar" />
    <Box>
      <Chip label={label} size="small" color={color} className="help-desk-user-item-tag" />
      <Typography className="help-desk-user-item-name">{item.itemName || item.subCategory}</Typography>
      <Typography variant="caption" color="text.secondary">Status: <strong>{item.status}</strong></Typography>
    </Box>
  </div>
);

const MatchCard = ({ match, onOpenChat, currentOrgId, onInitiateClaim }) => {
  const isOwnerOfLostItem = currentOrgId === match.lostItemOwner;
  
  const finderId = match.finder?._id || match.finder;
  const isFinder = currentOrgId === finderId;

  let leftItemData, rightItemData;

  if (isOwnerOfLostItem) {
    leftItemData = { item: match.lostItem, label: "Org Lost Item", color: "error" };
    rightItemData = { item: match.foundItem, label: "Found Item Match", color: "success" };
  } else {
    leftItemData = { item: match.foundItem, label: "Item You Found", color: "success" };
    rightItemData = { item: match.lostItem, label: "User's Lost Item", color: "error" };
  }

  const isResolved = match.status === 'resolved';
  const isConfirmed = match.status === 'confirmed_by_owner';

  const canChat = isOwnerOfLostItem || (isFinder && match.isFinderAllowedInChat);
  const chatTooltip = canChat ? "Open conversation with Item Owner" : "Chat locked until Moderator approval";

  return (
    <Paper variant="outlined" className="help-desk-user-match-card">
      <div className="help-desk-user-card-header">
        <Typography variant="h6" className="help-desk-user-card-title">
          {isResolved ? "Match Resolved - Item Claimed" : "Potential Match Notification"}
        </Typography>
        {renderStatusChip(match.status)}
      </div>

      <div className="help-desk-user-card-body">
        <div className="help-desk-user-item-container">
          <ItemDisplay label={leftItemData.label} color={leftItemData.color} item={leftItemData.item} />
        </div>
        <div className="help-desk-user-connector">
          <div className="help-desk-user-connector-line"></div>
          {isResolved ? <VerifiedIcon color="success" /> : <ExchangeIcon className="help-desk-user-connector-icon" />}
          <div className="help-desk-user-connector-line"></div>
        </div>
        <div className="help-desk-user-item-container help-desk-user-found-item-container">
          <ItemDisplay label={rightItemData.label} color={rightItemData.color} item={rightItemData.item} />
        </div>
      </div>

      <div className="help-desk-user-card-actions">
        
        {isResolved ? (
          <Button variant="contained" color="success" startIcon={<VerifiedIcon />} disabled style={{ cursor: 'default' }}>
            Successfully Claimed
          </Button>
        ) : isConfirmed ? (
           isOwnerOfLostItem ? (
             <Button variant="contained" color="primary" startIcon={<HandshakeIcon />} onClick={() => onInitiateClaim(match)}>
                Mark as Claimed
             </Button>
           ) : (
             <Typography variant="caption" sx={{ mr: 2, color: 'primary.main', fontWeight: 600 }}>
                 Owner has confirmed. Waiting for claim...
             </Typography>
           )
        ) : (
           <Typography variant="caption" sx={{mr: 2, color: 'text.secondary'}}>
               {isOwnerOfLostItem ? "Please review details" : "Waiting for owner review..."}
           </Typography>
        )}

        <Tooltip title={chatTooltip}>
          <span>
            <Button
                variant="outlined"
                className="help-desk-user-chat-btn"
                startIcon={canChat ? <ChatIcon /> : <LockIcon />}
                onClick={() => onOpenChat(match._id)}
                disabled={!canChat}
                sx={!canChat ? { opacity: 0.6, borderColor: '#ccc', color: '#999' } : {}}
            >
                Chat with {isOwnerOfLostItem ? "Finder" : "Owner"}
            </Button>
          </span>
        </Tooltip>
      </div>
    </Paper>
  );
};

function OrganisationHelpDesk() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatState, setChatState] = useState({ open: false, matchId: null });
  
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedMatchForClaim, setSelectedMatchForClaim] = useState(null);

  const [currentOrgId, setCurrentOrgId] = useState(null);
  const navigate = useNavigate();

  const fetchOrgMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgInfoString = localStorage.getItem('organisationInfo');
      if (!orgInfoString) { navigate('/login/organisation'); return; }
      
      const orgInfo = JSON.parse(orgInfoString);
      const orgId = orgInfo.data?._id || orgInfo._id; 
      if (!orgId) throw new Error("Organisation ID not found.");

      setCurrentOrgId(orgId);
      const response = await axiosInstance.get(`/api/items/my-matches/${orgId}`);
      setMatches(response.data.data);
    } catch (err) { setError(err.response?.data?.message || err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrgMatches(); }, [navigate]);

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
          fetchOrgMatches(); 
      } catch (err) { alert("Error finalizing claim."); }
  };

  const renderContent = () => {
    if (loading) return <Box className="help-desk-user-status-container"><CircularProgress /></Box>;
    if (error) return <Box className="help-desk-user-status-container"><Alert severity="error">{error}</Alert></Box>;
    if (matches.length === 0) return (
      <Paper variant="outlined" className="help-desk-user-status-container help-desk-user-no-items">
        <NoMatchesIcon className="help-desk-user-no-items-icon" />
        <Typography variant="h5">No Active Matches</Typography>
        <Typography color="text.secondary">Matches for items you report found will appear here.</Typography>
      </Paper>
    );
    return (
      <Stack spacing={4}>
        {matches.map((match) => (
          <MatchCard
            key={match._id}
            match={match}
            onOpenChat={handleOpenChat}
            currentOrgId={currentOrgId}
            onInitiateClaim={handleInitiateClaim}
          />
        ))}
      </Stack>
    );
  };

  return (
    <Box className="help-desk-user-page-wrapper">
      <Container maxWidth="lg" className="help-desk-user-container">
        <Box className="help-desk-user-header">
          <Typography variant="h3" component="h1" className="help-desk-user-header-title">Organisation Help Desk</Typography>
          <Typography variant="subtitle1" color="text.secondary">Manage communications for items found by your organization.</Typography>
        </Box>
        {renderContent()}
        
        {chatState.matchId && <UserChatModal open={chatState.open} onClose={handleCloseChat} matchId={chatState.matchId} />}

        <Dialog
            open={claimModalOpen}
            onClose={handleCloseClaimModal}
            PaperProps={{ className: 'help-desk-user-modal-paper' }}
        >
            <DialogTitle className="help-desk-user-modal-title">Confirm Item Claim</DialogTitle>
            <DialogContent className="help-desk-user-modal-content">
                <DialogContentText className="help-desk-user-modal-text">Confirm that you have received this item? This will mark the match as resolved.</DialogContentText>
            </DialogContent>
            <DialogActions className="help-desk-user-modal-actions">
                <Button onClick={handleCloseClaimModal} className="help-desk-user-modal-cancel">Cancel</Button>
                <Button onClick={handleConfirmClaim} variant="contained" className="help-desk-user-modal-confirm" autoFocus>Confirm Receipt</Button>
            </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default OrganisationHelpDesk;