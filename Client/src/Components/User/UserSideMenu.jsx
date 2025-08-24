import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Avatar, Box, Typography, Skeleton } from '@mui/material';
import { 
  FaTachometerAlt, 
  FaPlusCircle, 
  FaListUl, 
  FaUserCircle, 
  FaSignOutAlt 
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/UserSideMenu.css';

function UserSideMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserDataFromAPI = useCallback(async () => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const parsedData = JSON.parse(storedUserInfo);
        if (parsedData && parsedData._id) {
          const response = await axiosInstance.get(`/api/users/${parsedData._id}`);
          setUser(response.data.data);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user info from API", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserDataFromAPI();

    const handleProfileUpdate = () => {
      console.log("Side menu received 'profileUpdated' event. Refetching data from API.");
      loadUserDataFromAPI();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [loadUserDataFromAPI]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login/user');
  };

  const renderProfileSection = () => {
    if (loading) {
      return (
        <Box className="user-profile-section skeleton">
          <Skeleton variant="circular" width={84} height={84} />
          <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: '80%' }} />
        </Box>
      );
    }
    if (user) {
      return (
        <Link to="/user/profile" className="user-profile-link">
          <Box className="user-profile-section">
            <Avatar
              alt={`${user.firstName} ${user.lastName}`}
              src={`http://localhost:5001${user.profileImage ? user.profileImage.replace(/\\/g, '/') : ''}`}
              sx={{ width: 84, height: 84, border: '3px solid var(--user-primary-color)' }}
            >
              {user.firstName ? user.firstName.charAt(0) : ''}
            </Avatar>
            <Typography variant="subtitle1" className="user-profile-name">
              {`${user.firstName} ${user.lastName}`}
            </Typography>
          </Box>
        </Link>
      );
    }
    return (
      <div className="user-sidemenu-header-placeholder">
        <h3>Findy Portal</h3>
      </div>
    );
  };

  return (
    <aside className="user-sidemenu">
      {renderProfileSection()}
      <nav className="user-sidemenu-nav">
        <ul>
          <li><NavLink to="/user/dashboard"><FaTachometerAlt className="user-sidemenu-icon" /><span>Dashboard</span></NavLink></li>
          <li><NavLink to="/user/add-item"><FaPlusCircle className="user-sidemenu-icon" /><span>Add Item</span></NavLink></li>
          <li><NavLink to="/user/view-items"><FaListUl className="user-sidemenu-icon" /><span>View My Items</span></NavLink></li>
          <li><NavLink to="/user/profile"><FaUserCircle className="user-sidemenu-icon" /><span>My Profile</span></NavLink></li>
        </ul>
      </nav>
      <div className="user-sidemenu-logout">
        <button onClick={handleLogout}>
          <FaSignOutAlt className="user-sidemenu-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default UserSideMenu;