// src/components/MatchReviewPage.js

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../Styles/MatchReviewPage.css';

const MatchReviewPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [lostItem, setLostItem] = useState(null);
    const [foundItem, setFoundItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const lostItemId = searchParams.get('lostItemId');
    const foundItemId = searchParams.get('foundItemId');
    const serverBaseUrl = 'http://localhost:5001';

    useEffect(() => {
        if (!lostItemId || !foundItemId) {
            setError('Missing item information.');
            setLoading(false);
            return;
        }
        const fetchMatchDetails = async () => {
            try {
                const response = await axios.get(`${serverBaseUrl}/api/items/match-details`, {
                    params: { lostItemId, foundItemId }
                });
                setLostItem(response.data.data.lostItem);
                setFoundItem(response.data.data.foundItem);
            } catch (err) {
                setError('Could not retrieve details.');
            } finally {
                setLoading(false);
            }
        };
        fetchMatchDetails();
    }, [lostItemId, foundItemId]);

    const handleConfirm = async () => {
        setActionLoading(true);
        try {
            await axios.post(`${serverBaseUrl}/api/items/match/confirm-owner`, {
                lostItemId,
                foundItemId
            });
            
            alert("Match Confirmed! Please log in to your Help Desk to finalize the claim.");
            navigate('/user/HelpDesk'); 
        } catch (err) {
            console.error(err);
            alert("Error confirming match. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if(!window.confirm("Remove this match?")) return;
        setActionLoading(true);
        try {
            await axios.post(`${serverBaseUrl}/api/items/match/reject`, { lostItemId, foundItemId });
            alert("Match removed.");
            navigate('/');
        } catch (err) { alert("Error removing match."); } finally { setActionLoading(false); }
    };

    if (loading) return <div className="page-container"><h2>Loading...</h2></div>;
    if (error) return <div className="page-container error-message"><h2>Error</h2><p>{error}</p></div>;

    return (
        <div className="page-container">
            <h1>Review Your Potential Match</h1>
            <div className="comparison-container">
                <div className="item-card">
                    <h2>Your Lost Item</h2>
                    <img src={`${serverBaseUrl}/${lostItem.itemImage}`} alt="Lost" className="item-image" />
                    <h3>{lostItem.itemName}</h3>
                </div>
                <div className="item-card">
                    <h2>Potentially Matched Item</h2>
                    <img src={`${serverBaseUrl}/${foundItem.itemImage}`} alt="Found" className="item-image" />
                    <h3>{foundItem.itemName || 'Found Item'}</h3>
                </div>
            </div>
            <div className="actions">
                <h2>Is this your item?</h2>
                <button onClick={handleConfirm} className="claim-button" disabled={actionLoading}>
                    {actionLoading ? "Processing..." : "Yes, This is Mine"}
                </button>
                <button onClick={handleReject} className="claim-button secondary" disabled={actionLoading}>
                    No, Not Mine
                </button>
            </div>
        </div>
    );
};

export default MatchReviewPage;