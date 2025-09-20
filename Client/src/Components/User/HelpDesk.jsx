// src/components/user/UserHelpDesk.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Paper, Button, Chip, Avatar,
  Container, Stack, Tooltip
} from '@mui/material';
import {
  ChatBubbleOutline as ChatIcon,
  SyncAlt as ExchangeIcon,
  CheckCircle as CheckCircleIcon,
  HourglassTop as HourglassIcon,
  Cancel as CancelIcon,
  ForumOutlined as NoMatchesIcon,
  RateReviewOutlined as ReviewIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/baseUrl';
import UserChatModal from './UserChatModal';
import '../../Styles/UserHelpDesk.css'; // Import the stylesheet

// --- Helper Functions & Sub-components ---

const getImageUrl = (path) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  return `${API_BASE_URL}/${path}`;
};

const renderStatusChip = (status) => {
  const statusConfig = {
    resolved: { icon: <CheckCircleIcon />, label: "Action Taken", color: "success" },
    confirmed_by_owner: { icon: <CheckCircleIcon />, label: "Action Taken", color: "success" },
    rejected_by_owner: { icon: <CancelIcon />, label: "Rejected by You", color: "error" },
    pending_review: { icon: <HourglassIcon />, label: "Awaiting Your Review", color: "warning" },
  };
  const config = statusConfig[status] || statusConfig.pending_review;
  return <Chip icon={config.icon} label={config.label} color={config.color} size="small" />;
};

const ItemDisplay = ({ label, color, item }) => (
  <div className="user-help-desk-item-display">
    <Avatar
      variant="rounded"
      src={getImageUrl(item.itemImage)}
      alt={item.itemName || item.petName}
      className="user-help-desk-item-avatar"
    />
    <Box>
      <Chip
        label={label}
        size="small"
        color={color}
        className="user-help-desk-item-tag"
      />
      <Typography className="user-help-desk-item-name">
        {item.itemName || item.subCategory}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {/* Check for lostDate property to determine if it's a lost or found item */}
        {item.lostDate
          ? `Lost on ${new Date(item.lostDate).toLocaleDateString()}`
          : `Found at: ${item.foundLocationAddress}`
        }
      </Typography>
    </Box>
  </div>
);

const MatchCard = ({ match, onOpenChat, currentUserId }) => {
  const navigate = useNavigate();

  const handleReview = () => {
    navigate(`/match-review?lostItemId=${match.lostItem._id}&foundItemId=${match.foundItem._id}`);
  };

  // *** CORE LOGIC CHANGE ***
  // Determine if the current user is the owner of the lost item or the finder.
  const isOwnerOfLostItem = currentUserId === match.lostItemOwner;

  let leftItemData, rightItemData;

  if (isOwnerOfLostItem) {
    // Standard view: User lost an item, and someone else found a match.
    leftItemData = { item: match.lostItem, label: "Your Lost Item", color: "error" };
    rightItemData = { item: match.foundItem, label: "Found Item Match", color: "success" };
  } else {
    // Alternate view: User found an item that matches someone else's lost item.
    leftItemData = { item: match.foundItem, label: "Your Found Item", color: "success" };
    rightItemData = { item: match.lostItem, label: "Owner's Lost Item", color: "error" };
  }

  return (
    <Paper variant="outlined" className="user-help-desk-match-card">
      <div className="user-help-desk-card-header">
        <Typography variant="h6" className="user-help-desk-card-title">
          Potential Match Found
        </Typography>
        {renderStatusChip(match.status)}
      </div>

      <div className="user-help-desk-card-body">
        {/* Left Item (Dynamically determined based on user's role) */}
        <div className="user-help-desk-item-container">
          <ItemDisplay
            label={leftItemData.label}
            color={leftItemData.color}
            item={leftItemData.item}
          />
        </div>
        
        {/* Connector */}
        <div className="user-help-desk-connector">
          <div className="user-help-desk-connector-line"></div>
          <ExchangeIcon className="user-help-desk-connector-icon" />
          <div className="user-help-desk-connector-line"></div>
        </div>

        {/* Right Item (Dynamically determined) */}
        <div className="user-help-desk-item-container found-item-container">
          <ItemDisplay
            label={rightItemData.label}
            color={rightItemData.color}
            item={rightItemData.item}
          />
        </div>
      </div>

      <div className="user-help-desk-card-actions">
        {match.status === 'pending_review' && (
          <Button
            variant="contained"
            className="user-help-desk-review-btn"
            startIcon={<ReviewIcon />}
            onClick={handleReview}
            disableElevation
          >
            Review Details
          </Button>
        )}
        <Tooltip title="Open a conversation with the other person">
          <Button
            variant="outlined"
            className="user-help-desk-chat-btn"
            startIcon={<ChatIcon />}
            onClick={() => onOpenChat(match._id)}
          >
            Conversation
          </Button>
        </Tooltip>
      </div>
    </Paper>
  );
};

// --- Main Component ---

function UserHelpDesk() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatState, setChatState] = useState({ open: false, matchId: null });
  const [currentUserId, setCurrentUserId] = useState(null); // State to hold the user's ID
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const userInfoString = localStorage.getItem('userInfo');
        if (!userInfoString) {
          navigate('/login');
          return;
        }
        const userInfo = JSON.parse(userInfoString);
        const userId = userInfo?._id;
        
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }

        setCurrentUserId(userId); // Set the current user's ID
        
        const response = await axiosInstance.get(`/api/items/my-matches/${userId}`);
        console.log(response);
        
        if (response.data?.success) {
          setMatches(response.data.data);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch matches.');
        }
      } catch (err) {
        console.error("Error fetching user matches:", err);
        const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMatches();
  }, [navigate]);

  const handleOpenChat = (matchId) => setChatState({ open: true, matchId });
  const handleCloseChat = () => setChatState({ open: false, matchId: null });

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="user-help-desk-status-container">
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box className="user-help-desk-status-container">
          <Alert severity="error" variant="filled">{error}</Alert>
        </Box>
      );
    }
    if (matches.length === 0) {
      return (
        <Paper variant="outlined" className="user-help-desk-status-container user-help-desk-no-items">
          <NoMatchesIcon className="user-help-desk-no-items-icon" />
          <Typography variant="h5">No Notifications Yet</Typography>
          <Typography color="text.secondary">
            When a potential match for one of your items is found, it will appear here.
          </Typography>
        </Paper>
      );
    }
    return (
      <Stack spacing={4}>
        {matches.map((match) => (
          <MatchCard
            key={match._id}
            match={match}
            onOpenChat={handleOpenChat}
            currentUserId={currentUserId} // Pass the ID down to each card
          />
        ))}
      </Stack>
    );
  };

  return (
    <Box className="user-help-desk-page-wrapper">
      <Container maxWidth="lg" className="user-help-desk-container">
        <Box className="user-help-desk-header">
          <Typography variant="h3" component="h1" className="user-help-desk-header-title">
            Your Match Notifications
          </Typography>
          <Typography variant="h6" className="user-help-desk-header-subtitle">
            Review potential matches found by our system and start a conversation.
          </Typography>
        </Box>

        {renderContent()}

        {chatState.matchId && (
          <UserChatModal
            open={chatState.open}
            onClose={handleCloseChat}
            matchId={chatState.matchId}
          />
        )}
      </Container>
    </Box>
  );
}

export default UserHelpDesk;