import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
    Button, CircularProgress, Typography, Box 
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import '../../Styles/MatchReviewPage.css';

const MatchReviewPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [lostItem, setLostItem] = useState(null);
    const [foundItem, setFoundItem] = useState(null);
    const [matchStatus, setMatchStatus] = useState(null); // Store match status
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    // Modal State
    const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'success' });

    const lostItemId = searchParams.get('lostItemId');
    const foundItemId = searchParams.get('foundItemId');
    const serverBaseUrl = 'http://localhost:5001';

    // Get Current User ID
    const userInfoStr = localStorage.getItem('userInfo');
    const orgInfoStr = localStorage.getItem('organisationInfo');
    
    let currentUserId = null;
    if (userInfoStr) currentUserId = JSON.parse(userInfoStr)._id;
    else if (orgInfoStr) currentUserId = JSON.parse(orgInfoStr).data?._id || JSON.parse(orgInfoStr)._id;

    useEffect(() => {
        if (!lostItemId || !foundItemId) {
            setError('Missing item information.');
            setLoading(false);
            return;
        }

        const fetchMatchDetails = async () => {
            try {
                // Fetch Items
                const response = await axios.get(`${serverBaseUrl}/api/items/match-details`, {
                    params: { lostItemId, foundItemId }
                });
                setLostItem(response.data.data.lostItem);
                setFoundItem(response.data.data.foundItem);

                // Fetch Match Status specifically to check if already confirmed
                // Note: You might need to update your backend to return match status in 'match-details'
                // For now, let's assume we can get it or infer it. 
                // Ideally, fetch the match object here.
                const matchesRes = await axios.get(`${serverBaseUrl}/api/items/matches/all`); 
                const currentMatch = matchesRes.data.data.find(m => 
                    m.lostItem._id === lostItemId && m.foundItem._id === foundItemId
                );
                
                if (currentMatch) {
                    setMatchStatus(currentMatch.status);
                }

            } catch (err) {
                setError('Could not retrieve details.');
            } finally {
                setLoading(false);
            }
        };
        fetchMatchDetails();
    }, [lostItemId, foundItemId]);

    const handleCloseModal = () => {
        setModal({ ...modal, open: false });
        if (modal.type === 'success') {
             // Redirect based on user type
             const target = userInfoStr ? '/user/HelpDesk' : '/organisation/help-desk';
             navigate(target);
        }
    };

    const handleConfirm = async () => {
        setActionLoading(true);
        try {
            await axios.post(`${serverBaseUrl}/api/items/match/confirm-owner`, {
                lostItemId,
                foundItemId
            });
            
            setModal({
                open: true,
                type: 'success',
                title: 'Match Confirmed!',
                message: 'Great! Please go to your Help Desk to finalize the claim process.'
            });
            setMatchStatus('confirmed_by_owner'); // Update local state
        } catch (err) {
            console.error(err);
            setModal({
                open: true,
                type: 'error',
                title: 'Error',
                message: 'Something went wrong while confirming the match. Please try again.'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if(!window.confirm("Are you sure? This will remove the match notification.")) return;
        
        setActionLoading(true);
        try {
            await axios.post(`${serverBaseUrl}/api/items/match/reject`, { lostItemId, foundItemId });
            navigate('/');
        } catch (err) { 
            alert("Error removing match."); 
        } finally { 
            setActionLoading(false); 
        }
    };

    if (loading) return <div className="page-container"><h2>Loading...</h2></div>;
    if (error) return <div className="page-container error-message"><h2>Error</h2><p>{error}</p></div>;

    // --- LOGIC CHECKS ---
    const isFinder = foundItem?.finder === currentUserId;
    const isAlreadyConfirmed = matchStatus === 'confirmed_by_owner' || matchStatus === 'resolved';

    return (
        <div className="page-container">
            <h1>Review Your Potential Match</h1>
            <div className="comparison-container">
                <div className="item-card">
                    <h2>Your Lost Item</h2>
                    <img src={`${serverBaseUrl}/${lostItem.itemImage}`} alt="Lost" className="item-image" />
                    <h3>{lostItem.itemName || lostItem.petName}</h3>
                </div>
                <div className="item-card">
                    <h2>Potentially Matched Item</h2>
                    <img src={`${serverBaseUrl}/${foundItem.itemImage}`} alt="Found" className="item-image" />
                    <h3>{foundItem.itemName || foundItem.petName || 'Found Item'}</h3>
                </div>
            </div>

            <div className="actions">
                {/* CASE 1: Current User is the FINDER (Cannot confirm own find) */}
                {isFinder ? (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            You found this item. Waiting for the owner to confirm.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            sx={{ mt: 2 }} 
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                    </Box>
                ) : isAlreadyConfirmed ? (
                    /* CASE 2: Already Confirmed */
                    <Box sx={{ textAlign: 'center' }}>
                         <Typography variant="h5" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <CheckCircleOutline /> Match Confirmed
                        </Typography>
                        <Typography color="text.secondary">
                            You have already confirmed this match.
                        </Typography>
                        <Button 
                            variant="contained" 
                            className="claim-button"
                            onClick={() => navigate(userInfoStr ? '/user/HelpDesk' : '/organisation/help-desk')}
                            sx={{ mt: 3 }}
                        >
                            Go to Help Desk
                        </Button>
                    </Box>
                ) : (
                    /* CASE 3: Owner Viewing (Can Confirm/Reject) */
                    <>
                        <h2>Is this your item?</h2>
                        <button onClick={handleConfirm} className="claim-button" disabled={actionLoading}>
                            {actionLoading ? "Processing..." : "Yes, This is Mine"}
                        </button>
                        <button onClick={handleReject} className="claim-button secondary" disabled={actionLoading}>
                            No, Not Mine
                        </button>
                    </>
                )}
            </div>

            {/* --- Professional Modal --- */}
            <Dialog
                open={modal.open}
                onClose={handleCloseModal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ style: { borderRadius: 16, padding: '10px' } }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: modal.type === 'success' ? '#2e7d32' : '#d32f2f' }}>
                    {modal.type === 'success' ? <CheckCircleOutline /> : <ErrorOutline />}
                    {modal.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" sx={{ fontSize: '1.1rem' }}>
                        {modal.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} variant="contained" color={modal.type === 'success' ? "success" : "error"} autoFocus>
                        Okay
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};

export default MatchReviewPage;