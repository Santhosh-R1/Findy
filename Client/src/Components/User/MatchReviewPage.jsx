import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../../Styles/MatchReviewPage.css'; 

const MatchReviewPage = () => {
    const [searchParams] = useSearchParams();
    const [lostItem, setLostItem] = useState(null);
    const [foundItem, setFoundItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const lostItemId = searchParams.get('lostItemId');
    const foundItemId = searchParams.get('foundItemId');
    
    // Your backend server URL
    const serverBaseUrl = 'http://localhost:5001';

    useEffect(() => {
        if (!lostItemId || !foundItemId) {
            setError('Missing item information in the link.');
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
                setError('Could not retrieve match details. The link may be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        fetchMatchDetails();
    }, [lostItemId, foundItemId]);

    if (loading) {
        return <div className="page-container"><h2>Loading Match Details...</h2></div>;
    }

    if (error) {
        return <div className="page-container error-message"><h2>Error</h2><p>{error}</p></div>;
    }

    return (
        <div className="page-container">
            <h1>Review Your Potential Match</h1>
            <p className="intro-text">Please compare the item you lost with the item that was found. If you believe this is yours, please log in to begin the claim process.</p>
            
            <div className="comparison-container">
                {/* Your Lost Item Column */}
                <div className="item-card">
                    <h2>Your Lost Item</h2>
                    <img src={`${serverBaseUrl}/${lostItem.itemImage}`} alt={lostItem.itemName} className="item-image" />
                    <h3>{lostItem.itemName}</h3>
                    <p>{lostItem.description}</p>
                </div>

                {/* Found Item Column */}
                <div className="item-card">
                    <h2>Potentially Matched Item</h2>
                    <img src={`${serverBaseUrl}/${foundItem.itemImage}`} alt={foundItem.itemName} className="item-image" />
                    <h3>{foundItem.itemName || 'Item name not specified'}</h3>
                    <p>{foundItem.description}</p>
                </div>
            </div>

            <div className="actions">
                <h2>Is this your item?</h2>
                <Link to="/login" className="claim-button">Yes, Log In to Claim</Link>
                <Link to="/" className="claim-button secondary">No, This is Not Mine</Link>
            </div>
        </div>
    );
};

export default MatchReviewPage;