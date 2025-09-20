import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Avatar, Box, Typography, Skeleton } from '@mui/material';
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaCheckSquare,
  FaUsers,
  FaSignOutAlt,
  FaUserCircle // Kept for profile avatar fallback
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl'; // Make sure this path is correct
import '../../Styles/ModeratorSidemenu.css'; 

function ModeratorSidemenu() {
  const navigate = useNavigate();
  const [moderator, setModerator] = useState(null);
  const [loading, setLoading] = useState(true);

  // This function now loads initial data from localStorage for speed,
  // then fetches the latest data from the API.
  const loadModeratorData = useCallback(async () => {
    try {
      const storedModeratorInfo = localStorage.getItem('moderatorInfo');
      if (storedModeratorInfo) {
        const parsedData = JSON.parse(storedModeratorInfo);

        // --- CORRECTED LOGIC HERE ---
        // Use the flat data structure from local storage immediately
        if (parsedData && parsedData._id) {
          setModerator(parsedData); // Instantly set state with local data
          setLoading(false); // Stop loading, we have something to show

          // Now, fetch the most up-to-date data from the server in the background
          try {
            const response = await axiosInstance.get(`/api/moderator/get-by-id/${parsedData._id}`);
            // The API response might be nested under a 'data' key, adjust if needed
            setModerator(response.data.data); 
          } catch (apiError) {
            console.error("Failed to fetch updated moderator info from API, using local data.", apiError);
            // If API fails, the user still sees the data from localStorage
          }
        } else {
          console.error("Moderator ID not found in localStorage data.");
          setModerator(null);
          setLoading(false);
        }
      } else {
        setModerator(null);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to parse moderator info from localStorage", error);
      setModerator(null);
      setLoading(false);
    }
  }, []);

  // Effect to load data on mount and listen for profile updates
  useEffect(() => {
    loadModeratorData();

    const handleProfileUpdate = () => {
      loadModeratorData();
    };

    window.addEventListener('moderatorProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('moderatorProfileUpdated', handleProfileUpdate);
    };
  }, [loadModeratorData]);

  const handleLogout = () => {
    localStorage.removeItem('moderatorInfo');
    localStorage.removeItem('moderatorToken');
    setModerator(null);
    navigate('/login/moderator');
  };

  const renderProfileSection = () => {
    if (loading) {
      return (
        <Box className="moderators-profile-section skeleton">
          <Skeleton variant="circular" width={84} height={84} />
          <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: '80%', mt: 1 }} />
        </Box>
      );
    }
    if (moderator) {
      // --- CORRECTED PROPERTY ACCESS ---
      const profilePicUrl = moderator.profileImage
        ? `http://localhost:5001${moderator.profileImage.replace(/\\/g, '/')}`
        : '';
        
      return (
        <Link to="/moderator/profile" className="moderators-profile-link">
          <Box className="moderators-profile-section">
            <Avatar
              alt={moderator.firstName} // Use firstName
              src={profilePicUrl}
              sx={{ width: 84, height: 84, border: '3px solid var(--mod-primary-color)' }}
            >
              {moderator.firstName ? moderator.firstName.charAt(0).toUpperCase() : <FaUserCircle />}
            </Avatar>
            <Typography variant="subtitle1" className="moderators-profile-name">
              {moderator.firstName} {/* Use firstName */}
            </Typography>
          </Box>
        </Link>
      );
    }
    return (
      <div className="moderators-sidemenu-header-placeholder">
        <h3>Moderator Portal</h3>
      </div>
    );
  };

  return (
    <aside className="moderators-sidemenu">
      {renderProfileSection()}
      <nav className="moderators-sidemenu-nav">
        <ul>
          <li><NavLink to="/moderator/dashboard"><FaTachometerAlt className="moderators-sidemenu-icon" /><span>Dashboard</span></NavLink></li>
          <li><NavLink to="/moderator/LostItems"><FaBoxOpen className="moderators-sidemenu-icon" /><span>View Lost Items</span></NavLink></li>
          <li><NavLink to="/moderator/FoundItems"><FaCheckSquare className="moderators-sidemenu-icon" /><span>View Found Items</span></NavLink></li>
          <li><NavLink to="/moderator/manage-claims"><FaUsers className="moderators-sidemenu-icon" /><span>Manage Claims</span></NavLink></li>
          <li><NavLink to="/moderator/profile"><FaUserCircle className="moderators-sidemenu-icon" /><span>Profile</span></NavLink></li>
        </ul>
      </nav>
      <div className="moderators-sidemenu-logout">
        <button onClick={handleLogout}>
          <FaSignOutAlt className="moderators-sidemenu-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default ModeratorSidemenu;