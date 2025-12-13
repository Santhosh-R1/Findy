import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper, Chip, Avatar, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  FaRobot, FaUserCog, FaCheckCircle, FaHourglassHalf, FaTimesCircle, 
  FaQuestionCircle, FaListUl, FaComments
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ManageClaim.css';
import ChatModal from './ChatModal'; 

const renderStatusChip = (status) => {
  switch (status) {
    case 'resolved':
      return <Chip icon={<FaCheckCircle />} label="Resolved" color="success" size="small" className="mc-status-chip" />;
    case 'confirmed_by_owner':
      return <Chip icon={<FaCheckCircle />} label="Confirmed" color="primary" size="small" className="mc-status-chip" />;
    case 'rejected_by_owner':
      return <Chip icon={<FaTimesCircle />} label="Rejected" color="error" size="small" className="mc-status-chip" />;
    case 'pending_review':
      return <Chip icon={<FaHourglassHalf />} label="Pending" color="warning" size="small" className="mc-status-chip" />;
    default:
      return <Chip icon={<FaQuestionCircle />} label="Unknown" size="small" className="mc-status-chip" />;
  }
};

function ManageClaim() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chatState, setChatState] = useState({ open: false, matchId: null, matchData: null });

  const handleOpenChat = (match) => {
    setChatState({ open: true, matchId: match._id, matchData: match });
  };
  const handleCloseChat = () => {
    setChatState({ open: false, matchId: null, matchData: null });
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/items');
        console.log(response);
        
        if (response.data?.success) {
          setMatches(response.data.data);
        } else {
          throw new Error('Failed to fetch match data.');
        }
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError(err.response?.data?.message || 'Could not retrieve match records.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="mc-status-container">
          <CircularProgress color="warning" />
          <Typography sx={{ mt: 2 }} color="text.secondary">Loading Match Records...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box className="mc-status-container">
          <Alert severity="error" variant="filled">{error}</Alert>
        </Box>
      );
    }

    if (matches.length === 0) {
      return (
        <Box className="mc-status-container mc-no-items">
          <FaListUl className="mc-no-items-icon" />
          <Typography variant="h5">No Matches Found</Typography>
          <Typography color="text.secondary">There are no AI or manual matches recorded in the system yet.</Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined" className="mc-table-container">
        <Table sx={{ minWidth: 650 }} aria-label="match review table">
          <TableHead className="mc-table-head">
            <TableRow>
              <TableCell>Lost Item</TableCell>
              <TableCell>Found Item</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Match Details</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match._id} className="mc-table-row">
                <TableCell className="mc-table-cell">
                  <Box className="mc-item-cell-content">
                    <Avatar variant="rounded" src={`http://localhost:5001/${match.lostItem.itemImage}`} />
                    <Box>
                      <Typography className="mc-item-name">{match.lostItem.itemName || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">{`${match.lostItem.mainCategory} / ${match.lostItem.subCategory}`}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell className="mc-table-cell">
                  <Box className="mc-item-cell-content">
                    <Avatar variant="rounded" src={`http://localhost:5001/${match.foundItem.itemImage}`} />
                    <Box>
                      <Typography className="mc-item-name">{match.foundItem.itemName || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">{`${match.foundItem.mainCategory} / ${match.foundItem.subCategory}`}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell className="mc-table-cell">
                   <Box className="mc-user-cell-content">
                     <Typography className="mc-user-name">{`${match.lostItemOwner?.firstName} ${match.lostItemOwner.lastName || ''}`}</Typography>
                     <Typography variant="caption" color="text.secondary">{match.lostItemOwner.email}</Typography>
                   </Box>
                </TableCell>
                <TableCell className="mc-table-cell">
                   <Box className="mc-details-cell-content">
                     <Chip
                        icon={match.matchType === 'ai' ? <FaRobot /> : <FaUserCog />}
                        label={match.matchType === 'ai' ? `AI Match (${(match.matchScore * 100).toFixed(0)}%)` : 'Manual'}
                        size="small"
                        className="mc-type-chip"
                        color={match.matchType === 'ai' ? 'primary' : 'secondary'}
                     />
<Typography variant="body2">Finder: <strong>{match.finder?.firstName} {match.finder?.lastName || ''}</strong></Typography>                     {match.matchType === 'manual' && match.moderator && (
                        <Typography variant="caption" color="text.secondary" className="mc-moderator-info">
                            by Mod: {match.moderator.firstName}
                        </Typography>
                     )}
                   </Box>
                </TableCell>
                <TableCell align="center">{renderStatusChip(match.status)}</TableCell>
                <TableCell>
                  {new Date(match.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FaComments />}
                    onClick={() => handleOpenChat(match)}
                    className="mc-action-btn"
                  >
                    Chat
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box className="manage-claim-page">
      <Box className="mc-page-header-container">
        <Typography variant="h4" component="h1" className="mc-page-header">
          Match Review Center
        </Typography>
        <Typography variant="subtitle1" className="mc-page-subtitle">
          Oversee all potential matches between lost and found items.
        </Typography>
      </Box>

      {renderContent()}

      <ChatModal
        open={chatState.open}
        onClose={handleCloseChat}
        matchId={chatState.matchId}
        initialMatchData={chatState.matchData}
      />
    </Box>
  );
}

export default ManageClaim;